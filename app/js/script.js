/* ============================================================
   CHAMBER — Russian Roulette Arena
   Guest play + optional auth + realtime rooms + bots
   ============================================================ */
(function () {
  'use strict';

  let SUPABASE_URL = '';
  let SUPABASE_ANON_KEY = '';
  let sb = null;

  // Session
  let USER = null;           // logged-in user object or null
  let IS_GUEST = true;
  let GUEST_NAME = '';
  let DEVICE_ID = '';
  let MY_SLOT = null;        // 'p1' | 'p2'
  let ROOM_ID = null;
  let ROOM_CODE = null;
  let BOT_DIFF = 'normal';
  let roomChannel = null;
  let chatChannel = null;
  let pvpSearching = false;

  const $ = (id) => document.getElementById(id);
  function toast(msg, ms) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('show'), ms || 2500);
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function initials(n) {
    return String(n || 'G').slice(0, 2).toUpperCase();
  }
  function hearts(hp) {
    let s = '';
    for (let i = 0; i < 4; i++) s += i < hp ? '❤️' : '<span class="dead">🖤</span>';
    return s;
  }
  function myName() {
    return USER ? (USER.display_name || USER.username) : GUEST_NAME;
  }

  // ---------- Config & SB ----------
  async function initSb() {
    try {
      if (typeof loadChConfig === 'function') {
        const cfg = await loadChConfig();
        SUPABASE_URL = cfg.SUPABASE_URL || '';
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY || '';
      }
    } catch (e) {}
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_PROJECT')) {
      toast('Config/config.cfg را با آدرس سوپابیس پر کن');
      return false;
    }
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 20 } }
    });
    return true;
  }

  // ---------- Device & Guest ----------
  function initDevice() {
    let id = localStorage.getItem('ch_device_id');
    if (!id) {
      id = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('ch_device_id', id);
    }
    DEVICE_ID = id;
  }
  function initGuest() {
    let n = sessionStorage.getItem('ch_guest_name');
    if (!n) {
      n = 'Ghost' + (100 + Math.floor(Math.random() * 900));
      sessionStorage.setItem('ch_guest_name', n);
    }
    GUEST_NAME = n;
    IS_GUEST = !USER;
  }

  // ---------- UI identity ----------
  function refreshIdentity() {
    const name = myName();
    const av = USER && USER.avatar_url;
    $('btnAvatar').textContent = initials(name);
    if (av) $('btnAvatar').innerHTML = '<img src="' + esc(av) + '" alt="">';
    else $('btnAvatar').textContent = initials(name);

    $('profName').textContent = name;
    $('profAvatar').textContent = initials(name);
    if (av) $('profAvatar').innerHTML = '<img src="' + esc(av) + '" alt="">';
    else $('profAvatar').textContent = initials(name);

    if (USER) {
      $('profGuestTag').classList.add('hidden');
      $('btnLogout').classList.remove('hidden');
      $('btnAuth').querySelector('span').textContent = 'حساب: ' + USER.username;
      $('profStats').innerHTML =
        '<span>برد <b>' + (USER.total_wins || 0) + '</b></span>' +
        '<span>باخت <b>' + (USER.total_losses || 0) + '</b></span>' +
        '<span>استریک <b>' + (USER.win_streak || 0) + '</b></span>';
      if (USER.is_owner || USER.is_admin || USER.is_mod) $('btnAdmin').classList.remove('hidden');
      else $('btnAdmin').classList.add('hidden');
    } else {
      $('profGuestTag').classList.remove('hidden');
      $('btnLogout').classList.add('hidden');
      $('btnAdmin').classList.add('hidden');
      $('btnAuth').querySelector('span').textContent = 'ورود / ثبت‌نام';
      $('profStats').innerHTML = '<span class="muted">حالت مهمان — آماری ذخیره نمی‌شود</span>';
    }
  }

  // ---------- Navigation ----------
  function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const panel = $(id);
    if (panel) panel.classList.add('active');
    const tab = document.querySelector('.tab-btn[data-panel="' + id + '"]');
    if (tab) tab.classList.add('active');
    if (id === 'panelLb') loadLeaderboard();
    if (id === 'panelChat') loadGlobalChat();
  }

  // ---------- Auth ----------
  let authMode = 'login';
  function openAuth() {
    $('authModal').classList.remove('hidden');
    $('authErr').textContent = '';
  }
  async function doAuth() {
    const u = ($('authUser').value || '').trim();
    const p = $('authPass').value || '';
    if (u.length < 3) { $('authErr').textContent = 'نام کاربری حداقل ۳ کاراکتر'; return; }
    if (p.length < 4) { $('authErr').textContent = 'رمز حداقل ۴ کاراکتر'; return; }
    if (!sb) { $('authErr').textContent = 'اتصال برقرار نیست'; return; }
    $('authSubmit').disabled = true;
    try {
      const fn = authMode === 'signup' ? 'register_user' : 'login_user';
      const { data, error } = await sb.rpc(fn, {
        p_username: u,
        p_password: p,
        p_device_id: DEVICE_ID
      });
      if (error) throw new Error(error.message);
      if (!data || !data.ok) {
        const r = data && data.reason;
        if (r === 'username_taken') throw new Error('این نام قبلاً گرفته شده');
        if (r === 'banned') throw new Error('حساب مسدود است');
        if (r === 'device_banned') throw new Error('دستگاه مسدود است');
        throw new Error(authMode === 'login' ? 'نام کاربری یا رمز اشتباه' : 'ثبت‌نام ناموفق');
      }
      USER = data.user;
      IS_GUEST = false;
      localStorage.setItem('ch_user_id', USER.id);
      localStorage.setItem('ch_user_cache', JSON.stringify(USER));
      $('authModal').classList.add('hidden');
      refreshIdentity();
      toast('خوش آمدی ' + (USER.display_name || USER.username));
    } catch (e) {
      $('authErr').textContent = e.message || 'خطا';
    } finally {
      $('authSubmit').disabled = false;
    }
  }

  async function restoreSession() {
    const id = localStorage.getItem('ch_user_id');
    if (!id || !sb) return;
    try {
      const cache = JSON.parse(localStorage.getItem('ch_user_cache') || 'null');
      if (cache && cache.id === id) { USER = cache; IS_GUEST = false; }
      const { data } = await sb.rpc('get_profile', { p_user_id: id });
      if (data) {
        USER = data;
        IS_GUEST = false;
        localStorage.setItem('ch_user_cache', JSON.stringify(data));
      } else {
        USER = null;
        IS_GUEST = true;
        localStorage.removeItem('ch_user_id');
      }
    } catch (e) {}
  }

  // ---------- Create / Join rooms ----------
  async function createRoom(mode) {
    if (!sb) return toast('سوپابیس تنظیم نشده');
    const name = myName();
    const { data, error } = await sb.rpc('create_room', {
      p_mode: mode,
      p_host_name: name,
      p_host_id: USER ? USER.id : null,
      p_host_is_guest: !USER,
      p_bot_difficulty: mode === 'bot' ? BOT_DIFF : null,
      p_live: 1,
      p_blank: 5
    });
    if (error || !data?.ok) {
      toast((data && data.reason) || error?.message || 'ساخت روم ناموفق');
      return;
    }
    ROOM_ID = data.room_id;
    ROOM_CODE = data.code;
    MY_SLOT = 'p1';
    enterLobby();
    if (mode === 'bot') {
      // auto start after short delay
      setTimeout(() => startGame(), 800);
    }
  }

  async function joinRoom(code) {
    if (!sb) return toast('سوپابیس تنظیم نشده');
    const { data, error } = await sb.rpc('join_room', {
      p_code: code,
      p_name: myName(),
      p_user_id: USER ? USER.id : null,
      p_is_guest: !USER
    });
    if (error || !data?.ok) {
      const r = data && data.reason;
      toast(r === 'room_not_found' ? 'روم پیدا نشد' : r === 'room_full' ? 'روم پر است' : (error?.message || 'ورود ناموفق'));
      return;
    }
    ROOM_ID = data.room_id;
    ROOM_CODE = data.code;
    MY_SLOT = 'p2';
    enterLobby();
  }

  // PVP matchmaking: create room and wait, or join an open waiting pvp room
  async function findPvp() {
    if (pvpSearching) return;
    pvpSearching = true;
    $('pvpStatus').textContent = 'در حال جستجو...';
    $('btnFindPvp').disabled = true;
    try {
      // try join existing waiting pvp
      const { data: open } = await sb.from('rooms')
        .select('id,code')
        .eq('mode', 'pvp')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(1);
      if (open && open.length) {
        await joinRoom(open[0].code);
      } else {
        await createRoom('pvp');
        $('pvpStatus').textContent = 'روم ساخته شد — منتظر حریف...';
      }
    } catch (e) {
      toast('خطا در مچ‌میکینگ');
    } finally {
      pvpSearching = false;
      $('btnFindPvp').disabled = false;
    }
  }

  function enterLobby() {
    showPanel('panelGame');
    $('lobbyView').classList.remove('hidden');
    $('gameView').classList.add('hidden');
    $('lobbyCode').textContent = ROOM_CODE || '------';
    subscribeRoom();
    refreshLobby();
  }

  async function refreshLobby() {
    if (!ROOM_ID) return;
    const { data: room } = await sb.from('rooms').select('*').eq('id', ROOM_ID).maybeSingle();
    const { data: players } = await sb.from('room_players').select('*').eq('room_id', ROOM_ID).order('slot');
    if (!room) return;

    $('lobbyStatus').textContent =
      room.status === 'waiting' ? 'در انتظار حریف...' :
      room.status === 'loading' ? 'آماده شروع' :
      room.status === 'playing' ? 'در حال بازی' : room.status;

    const box = $('lobbyPlayers');
    box.innerHTML = (players || []).map(p =>
      '<div class="player-row">' +
        '<div class="avatar">' + initials(p.display_name) + '</div>' +
        '<div class="name">' + esc(p.display_name) + (p.is_bot ? ' 🤖' : '') + '</div>' +
        '<div class="tag' + (p.is_ready ? ' ready' : '') + '">' + (p.is_ready ? 'آماده' : '...') + '</div>' +
      '</div>'
    ).join('');

    // host can start when 2 players and loading
    const isHost = MY_SLOT === 'p1';
    if (isHost && room.status === 'loading' && (players || []).length >= 2) {
      $('btnStartGame').classList.remove('hidden');
    } else {
      $('btnStartGame').classList.add('hidden');
    }

    if (room.status === 'playing' || room.status === 'finished') {
      enterGameView(room, players || []);
    }
  }

  function subscribeRoom() {
    if (roomChannel) { try { sb.removeChannel(roomChannel); } catch (e) {} }
    if (!ROOM_ID) return;
    roomChannel = sb.channel('room:' + ROOM_ID)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: 'id=eq.' + ROOM_ID }, () => {
        refreshLobby();
        refreshGame();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: 'room_id=eq.' + ROOM_ID }, () => {
        refreshLobby();
        refreshGame();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_actions', filter: 'room_id=eq.' + ROOM_ID }, (payload) => {
        onAction(payload.new);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'channel=eq.room:' + ROOM_ID }, (payload) => {
        appendRoomChat(payload.new);
      })
      .subscribe();
  }

  async function startGame() {
    if (!ROOM_ID) return;
    const { data, error } = await sb.rpc('start_game', { p_room_id: ROOM_ID });
    if (error || !data?.ok) {
      toast(error?.message || 'شروع ناموفق');
      return;
    }
    // show reveal
    showReveal(data.live, data.blank, data.total);
    setTimeout(async () => {
      await sb.rpc('clear_reveal', { p_room_id: ROOM_ID });
      hideReveal();
      refreshGame();
      // if bot goes first, trigger bot
      maybeBotTurn();
    }, 3000);
  }

  function showReveal(live, blank, total) {
    const row = $('bulletRow');
    let html = '';
    for (let i = 0; i < live; i++) html += '<div class="bullet live">💥</div>';
    for (let i = 0; i < blank; i++) html += '<div class="bullet blank">○</div>';
    row.innerHTML = html;
    $('revealCount').textContent = live + ' واقعی · ' + blank + ' مشقی · جمع ' + total;
    $('revealOverlay').classList.remove('hidden');
  }
  function hideReveal() {
    $('revealOverlay').classList.add('hidden');
  }

  function enterGameView(room, players) {
    $('lobbyView').classList.add('hidden');
    $('gameView').classList.remove('hidden');
    const p1 = players.find(p => p.slot === 'p1');
    const p2 = players.find(p => p.slot === 'p2');
    if (p1) { $('nameP1').textContent = p1.display_name; $('heartsP1').innerHTML = hearts(p1.hp); }
    if (p2) { $('nameP2').textContent = p2.display_name; $('heartsP2').innerHTML = hearts(p2.hp); }
    updateTurnUI(room);
    if (room.status === 'finished') showWin(room);
    loadRoomChat();
  }

  async function refreshGame() {
    if (!ROOM_ID) return;
    const { data: room } = await sb.from('rooms').select('*').eq('id', ROOM_ID).maybeSingle();
    const { data: players } = await sb.from('room_players').select('*').eq('room_id', ROOM_ID);
    if (!room) return;
    if (room.status === 'playing' || room.status === 'finished') {
      enterGameView(room, players || []);
      if (room.status === 'playing') maybeBotTurn();
    }
  }

  function updateTurnUI(room) {
    const mine = room.current_turn === MY_SLOT;
    $('turnLabel').innerHTML = mine
      ? 'نوبت <strong>تو</strong>ست — انتخاب کن'
      : 'نوبت <strong>حریف</strong>';
    $('hpP1').classList.toggle('active-turn', room.current_turn === 'p1');
    $('hpP2').classList.toggle('active-turn', room.current_turn === 'p2');
    $('actionRow').style.opacity = mine && room.status === 'playing' ? '1' : '0.35';
    $('btnShootSelf').disabled = !mine || room.status !== 'playing';
    $('btnShootOpp').disabled = !mine || room.status !== 'playing';
  }

  async function fire(action) {
    if (!ROOM_ID || !MY_SLOT) return;
    $('btnShootSelf').disabled = true;
    $('btnShootOpp').disabled = true;
    const { data, error } = await sb.rpc('fire_shot', {
      p_room_id: ROOM_ID,
      p_actor_slot: MY_SLOT,
      p_action: action
    });
    if (error || !data?.ok) {
      toast((data && data.reason) || error?.message || 'شلیک ناموفق');
      refreshGame();
      return;
    }
    animateShot(data);
    if (data.winner) {
      await finishMatch(data);
    } else {
      setTimeout(() => maybeBotTurn(), 700);
    }
  }

  function animateShot(data) {
    const gun = $('gunEmoji');
    gun.classList.remove('fire');
    void gun.offsetWidth;
    gun.classList.add('fire');
    const flash = $('resultFlash');
    flash.className = 'result-flash ' + data.result;
    flash.textContent = data.result === 'live' ? '💥 واقعی!' : '✓ مشقی';
    if (data.hp) {
      $('heartsP1').innerHTML = hearts(data.hp.p1);
      $('heartsP2').innerHTML = hearts(data.hp.p2);
    }
  }

  function onAction(row) {
    if (!row || row.action === 'system') return;
    const log = $('actionLog');
    if (log) {
      const div = document.createElement('div');
      div.textContent = (row.message || (row.actor_slot + ' ' + row.action + ' → ' + row.result));
      log.prepend(div);
    }
  }

  // ---------- Bot AI ----------
  let botBusy = false;
  async function maybeBotTurn() {
    if (botBusy || !ROOM_ID) return;
    const { data: room } = await sb.from('rooms').select('*').eq('id', ROOM_ID).maybeSingle();
    if (!room || room.status !== 'playing' || room.mode !== 'bot') return;
    if (room.current_turn !== 'p2') return; // bot is always p2

    const { data: players } = await sb.from('room_players').select('*').eq('room_id', ROOM_ID);
    const bot = (players || []).find(p => p.slot === 'p2');
    if (!bot || !bot.is_bot) return;

    botBusy = true;
    const diff = bot.bot_difficulty || room.bot_difficulty || 'normal';
    // decision delay by difficulty
    const delay = diff === 'easy' ? 1200 : diff === 'normal' ? 800 : diff === 'hard' ? 500 : 300;
    await new Promise(r => setTimeout(r, delay));

    // AI: estimate risk. Remaining unknown — use simple heuristics
    const total = room.total_chambers || 6;
    const idx = room.chamber_index || 0;
    const left = total - idx;
    // prefer shoot opponent when aggressive, self when safe
    let action = 'shoot_opponent';
    if (diff === 'easy') {
      action = Math.random() < 0.55 ? 'shoot_self' : 'shoot_opponent';
    } else if (diff === 'normal') {
      action = Math.random() < 0.4 ? 'shoot_self' : 'shoot_opponent';
    } else if (diff === 'hard') {
      // more likely to shoot opponent if many chambers left
      action = left > 3 && Math.random() < 0.7 ? 'shoot_opponent' : (Math.random() < 0.35 ? 'shoot_self' : 'shoot_opponent');
    } else {
      // insane: rarely shoots self unless few left
      action = left <= 2 && Math.random() < 0.5 ? 'shoot_self' : 'shoot_opponent';
    }

    const { data, error } = await sb.rpc('fire_shot', {
      p_room_id: ROOM_ID,
      p_actor_slot: 'p2',
      p_action: action
    });
    botBusy = false;
    if (error || !data?.ok) {
      refreshGame();
      return;
    }
    animateShot(data);
    if (data.winner) await finishMatch(data);
    else {
      // if blank+self, bot may go again
      setTimeout(() => maybeBotTurn(), 600);
    }
  }

  async function finishMatch(data) {
    const iWon = data.winner === MY_SLOT;
    showWin({ winner_slot: data.winner, winner_name: data.winner_name }, iWon);
    if (USER && ROOM_ID) {
      const { data: room } = await sb.from('rooms').select('mode,bot_difficulty').eq('id', ROOM_ID).maybeSingle();
      const { data: players } = await sb.from('room_players').select('*').eq('room_id', ROOM_ID);
      const opp = (players || []).find(p => p.slot !== MY_SLOT);
      await sb.rpc('record_match_result', {
        p_room_id: ROOM_ID,
        p_user_id: USER.id,
        p_result: iWon ? 'win' : 'loss',
        p_mode: room?.mode || 'pvp',
        p_opponent: opp?.display_name || null,
        p_bot_diff: room?.bot_difficulty || null
      });
      // refresh profile
      const { data: prof } = await sb.rpc('get_profile', { p_user_id: USER.id });
      if (prof) { USER = prof; localStorage.setItem('ch_user_cache', JSON.stringify(prof)); refreshIdentity(); }
    }
  }

  function showWin(room, iWon) {
    $('winView').classList.remove('hidden');
    const won = typeof iWon === 'boolean' ? iWon : room.winner_slot === MY_SLOT;
    $('winTitle').textContent = won ? 'بردی! 🏆' : 'باختی';
    $('winSub').textContent = 'برنده: ' + (room.winner_name || '—');
    $('actionRow').classList.add('hidden');
  }

  function leaveRoom() {
    if (roomChannel) { try { sb.removeChannel(roomChannel); } catch (e) {} roomChannel = null; }
    ROOM_ID = null;
    ROOM_CODE = null;
    MY_SLOT = null;
    botBusy = false;
    $('winView').classList.add('hidden');
    $('actionRow').classList.remove('hidden');
    showPanel('panelHome');
    $('botDiffBox').classList.add('hidden');
    $('privateBox').classList.add('hidden');
    $('pvpBox').classList.add('hidden');
    $('pvpStatus').textContent = '';
  }

  // ---------- Chat ----------
  async function loadGlobalChat() {
    if (!sb) return;
    const { data } = await sb.from('messages')
      .select('*').eq('channel', 'global')
      .order('created_at', { ascending: false }).limit(50);
    const box = $('globalChatMsgs');
    box.innerHTML = (data || []).reverse().map(m =>
      '<div class="chat-bubble"><div class="meta">' + esc(m.sender_name) + (m.is_guest ? ' · مهمان' : '') +
      '</div><div>' + esc(m.content) + '</div></div>'
    ).join('') || '<div class="muted" style="text-align:center">پیامی نیست</div>';
    box.scrollTop = box.scrollHeight;
  }
  async function sendGlobalChat() {
    const text = ($('globalChatInput').value || '').trim();
    if (!text || !sb) return;
    $('globalChatInput').value = '';
    await sb.from('messages').insert({
      channel: 'global',
      sender_id: USER ? USER.id : null,
      sender_name: myName(),
      sender_avatar: USER?.avatar_url || null,
      is_guest: !USER,
      content: text.slice(0, 200)
    });
    loadGlobalChat();
  }
  async function loadRoomChat() {
    if (!ROOM_ID || !sb) return;
    const ch = 'room:' + ROOM_ID;
    const { data } = await sb.from('messages').select('*').eq('channel', ch)
      .order('created_at', { ascending: false }).limit(40);
    const box = $('roomChatMsgs');
    box.innerHTML = (data || []).reverse().map(m =>
      '<div class="chat-bubble"><div class="meta">' + esc(m.sender_name) + '</div><div>' + esc(m.content) + '</div></div>'
    ).join('');
    box.scrollTop = box.scrollHeight;
  }
  function appendRoomChat(m) {
    const box = $('roomChatMsgs');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'chat-bubble';
    div.innerHTML = '<div class="meta">' + esc(m.sender_name) + '</div><div>' + esc(m.content) + '</div>';
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }
  async function sendRoomChat() {
    if (!ROOM_ID) return;
    const text = ($('roomChatInput').value || '').trim();
    if (!text) return;
    $('roomChatInput').value = '';
    await sb.from('messages').insert({
      channel: 'room:' + ROOM_ID,
      sender_id: USER ? USER.id : null,
      sender_name: myName(),
      is_guest: !USER,
      content: text.slice(0, 200)
    });
  }

  // ---------- Leaderboard ----------
  async function loadLeaderboard() {
    if (!sb) return;
    const box = $('lbList');
    box.innerHTML = '<div class="muted" style="text-align:center;padding:20px">بارگذاری...</div>';
    const { data, error } = await sb.from('users')
      .select('id,username,display_name,avatar_url,total_wins,total_losses,best_streak,is_verified,level')
      .order('total_wins', { ascending: false })
      .limit(40);
    if (error || !data?.length) {
      box.innerHTML = '<div class="muted" style="text-align:center;padding:20px">هنوز کسی نیست — ثبت‌نام کن و بازی کن</div>';
      return;
    }
    box.innerHTML = data.map((u, i) => {
      const rc = i === 0 ? 'g' : i === 1 ? 's' : i === 2 ? 'b' : '';
      const name = u.display_name || u.username;
      return '<div class="lb-row" data-uid="' + u.id + '">' +
        '<div class="lb-rank ' + rc + '">' + (i + 1) + '</div>' +
        '<div class="avatar">' + initials(name) + '</div>' +
        '<div class="lb-info"><div class="lb-name">' + esc(name) + (u.is_verified ? ' ✓' : '') +
        '</div><div class="lb-sub">لول ' + (u.level || 1) + ' · استریک ' + (u.best_streak || 0) + '</div></div>' +
        '<div class="lb-score">' + (u.total_wins || 0) + '</div></div>';
    }).join('');
    box.querySelectorAll('.lb-row').forEach(row => {
      row.onclick = async () => {
        const { data: p } = await sb.rpc('get_profile', { p_user_id: row.dataset.uid });
        if (!p) return;
        $('modalName').textContent = p.display_name || p.username;
        $('modalAv').textContent = initials(p.display_name || p.username);
        if (p.avatar_url) $('modalAv').innerHTML = '<img src="' + esc(p.avatar_url) + '" alt="">';
        $('modalSub').textContent = '@' + p.username + (p.is_verified ? ' · تایید شده' : '');
        $('modalStats').innerHTML =
          '<span>برد <b>' + (p.total_wins || 0) + '</b></span>' +
          '<span>باخت <b>' + (p.total_losses || 0) + '</b></span>' +
          '<span>بازی <b>' + (p.total_games || 0) + '</b></span>' +
          '<span>بهترین استریک <b>' + (p.best_streak || 0) + '</b></span>';
        $('profileModal').classList.remove('hidden');
      };
    });
  }

  // ---------- Admin ----------
  async function adminBan(unban) {
    if (!USER) return;
    const uname = ($('adminUser').value || '').trim();
    if (!uname) return toast('یوزرنیم لازم است');
    const { data: rows } = await sb.from('users').select('id').eq('username_lower', uname.toLowerCase()).limit(1);
    if (!rows?.length) return toast('کاربر پیدا نشد');
    const tid = rows[0].id;
    if (unban) {
      const { data } = await sb.rpc('admin_unban_user', { p_actor: USER.id, p_target: tid });
      toast(data?.ok ? 'آنبن شد' : (data?.reason || 'خطا'));
    } else {
      const hours = parseInt($('adminHours').value, 10);
      const { data } = await sb.rpc('admin_ban_user', {
        p_actor: USER.id,
        p_target: tid,
        p_reason: $('adminReason').value || '—',
        p_hours: Number.isFinite(hours) ? hours : null
      });
      toast(data?.ok ? 'بن شد' : (data?.reason || 'خطا'));
    }
  }
  async function adminDeviceBan() {
    if (!USER) return;
    const did = ($('adminDevice').value || '').trim();
    if (!did) return toast('device id لازم است');
    const hours = parseInt($('adminHours').value, 10);
    const { data } = await sb.rpc('admin_ban_device', {
      p_actor: USER.id,
      p_device: did,
      p_reason: $('adminReason').value || '—',
      p_hours: Number.isFinite(hours) ? hours : null
    });
    toast(data?.ok ? 'دستگاه بن شد' : (data?.reason || 'خطا'));
  }

  // ---------- Edit profile (logged in only) ----------
  async function saveProfile() {
    if (!USER || !sb) return toast('ابتدا وارد شو');
    const { data, error } = await sb.rpc('update_profile', {
      p_user_id: USER.id,
      p_display_name: ($('editDisplay').value || '').trim() || null,
      p_avatar_url: ($('editAvatar').value || '').trim() || null,
      p_bio: ($('editBio').value || '').trim() || null
    });
    if (error || !data || !data.ok) {
      toast((error && error.message) || 'ذخیره ناموفق');
      return;
    }
    USER = data.user;
    localStorage.setItem('ch_user_cache', JSON.stringify(USER));
    refreshIdentity();
    $('editModal').classList.add('hidden');
    toast('ذخیره شد');
  }

  // ---------- Wire UI ----------
  function wire() {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.onclick = () => showPanel(b.dataset.panel);
    });

    document.querySelectorAll('.mode-card').forEach(c => {
      c.onclick = () => {
        const mode = c.dataset.mode;
        $('botDiffBox').classList.toggle('hidden', mode !== 'bot');
        $('privateBox').classList.toggle('hidden', mode !== 'private');
        $('pvpBox').classList.toggle('hidden', mode !== 'pvp');
      };
    });

    document.querySelectorAll('.diff-chip').forEach(c => {
      c.onclick = () => {
        document.querySelectorAll('.diff-chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        BOT_DIFF = c.dataset.diff;
      };
    });

    $('btnStartBot').onclick = () => createRoom('bot');
    $('btnCreatePrivate').onclick = () => createRoom('private');
    $('btnJoinPrivate').onclick = () => {
      const code = ($('joinCodeInput').value || '').trim().toUpperCase();
      if (code.length < 4) return toast('کد روم را وارد کن');
      joinRoom(code);
    };
    $('btnFindPvp').onclick = () => findPvp();
    $('btnStartGame').onclick = () => startGame();
    $('btnLeaveLobby').onclick = () => leaveRoom();
    $('btnBackHome').onclick = () => leaveRoom();
    $('btnShootSelf').onclick = () => fire('shoot_self');
    $('btnShootOpp').onclick = () => fire('shoot_opponent');

    $('globalChatSend').onclick = sendGlobalChat;
    $('globalChatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendGlobalChat(); });
    $('roomChatSend').onclick = sendRoomChat;
    $('roomChatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendRoomChat(); });

    $('btnAuth').onclick = openAuth;
    $('authClose').onclick = () => $('authModal').classList.add('hidden');
    $('authSubmit').onclick = doAuth;
    document.querySelectorAll('.auth-tabs button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.auth-tabs button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        authMode = b.dataset.auth;
        $('authSubmit').textContent = authMode === 'login' ? 'ورود' : 'ثبت‌نام';
      };
    });
    $('btnLogout').onclick = () => {
      USER = null; IS_GUEST = true;
      localStorage.removeItem('ch_user_id');
      localStorage.removeItem('ch_user_cache');
      refreshIdentity();
      toast('خارج شدی');
    };

    $('btnGuide').onclick = () => showPanel('panelGuide');
    $('btnGuideBack').onclick = () => showPanel('panelProfile');
    $('btnAdmin').onclick = () => showPanel('panelAdmin');
    $('btnAdminBack').onclick = () => showPanel('panelProfile');
    $('btnAdminBan').onclick = () => adminBan(false);
    $('btnAdminUnban').onclick = () => adminBan(true);
    $('btnAdminDeviceBan').onclick = adminDeviceBan;

    $('btnEditProfile').onclick = () => {
      if (!USER) return toast('اول وارد حساب شو');
      $('editDisplay').value = USER.display_name || '';
      $('editAvatar').value = USER.avatar_url || '';
      $('editBio').value = USER.bio || '';
      $('editModal').classList.remove('hidden');
    };
    $('editClose').onclick = () => $('editModal').classList.add('hidden');
    $('editSave').onclick = saveProfile;
    $('modalClose').onclick = () => $('profileModal').classList.add('hidden');
    $('btnAvatar').onclick = () => showPanel('panelProfile');
  }

  // ---------- Boot ----------
  async function boot() {
    initDevice();
    initGuest();
    wire();
    refreshIdentity();
    const ok = await initSb();
    if (ok) {
      await restoreSession();
      refreshIdentity();
      // global chat realtime
      sb.channel('global-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'channel=eq.global' }, () => {
          if ($('panelChat').classList.contains('active')) loadGlobalChat();
        })
        .subscribe();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

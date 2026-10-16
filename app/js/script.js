/* ============================================================
   Guessino v3.0 — Secure + Completely Redesigned Game
   ============================================================ */

(function () {
  'use strict';

  // ---------- Config & Supabase ----------
  let SUPABASE_URL = '';
  let SUPABASE_ANON_KEY = '';
  let sb = null;
  let CURRENT_USER = null;
  let DEVICE_ID = null;

  async function loadConfig() {
    try {
      if (typeof loadGzConfig === 'function') {
        const cfg = await loadGzConfig();
        SUPABASE_URL = cfg.SUPABASE_URL || '';
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY || '';
      }
    } catch (e) {}
  }

  function loadSupabaseLib() {
    return new Promise((resolve) => {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        resolve(true); return;
      }
      const urls = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'https://unpkg.com/@supabase/supabase-js@2'
      ];
      let i = 0;
      function next() {
        if (i >= urls.length) { resolve(false); return; }
        const s = document.createElement('script');
        s.src = urls[i++]; s.async = true;
        s.onload = () => (typeof supabase !== 'undefined' ? resolve(true) : next());
        s.onerror = next;
        document.head.appendChild(s);
      }
      next();
    });
  }

  async function ensureSb() {
    if (sb) return sb;
    await loadConfig();
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Config missing');
    const ok = await loadSupabaseLib();
    if (!ok) throw new Error('Supabase library failed');
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return sb;
  }

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  function toast(msg, ms = 2500) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('show'), ms);
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function initials(name) {
    const s = String(name || '?').trim();
    return s.slice(0, 2).toUpperCase() || '?';
  }
  function fmtNum(n) {
    return Number(n || 0).toLocaleString('fa-IR');
  }

  // ---------- Device ID (simple but useful) ----------
  async function initDevice() {
    let id = localStorage.getItem('gz_device_id');
    if (!id) {
      const raw = [
        navigator.userAgent || '',
        screen.width + 'x' + screen.height,
        navigator.language || '',
        Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        Date.now().toString(36)
      ].join('|');
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
        id = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
      } catch (e) {
        id = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      }
      localStorage.setItem('gz_device_id', id);
    }
    DEVICE_ID = id;
    return id;
  }

  // ---------- Auth (SECURE — uses RPCs only) ----------
  async function doLogin(username, password) {
    const { data, error } = await sb.rpc('login_user', {
      p_username: username,
      p_password: password,
      p_device_id: DEVICE_ID
    });
    if (error) throw new Error(error.message || 'خطای سرور');
    if (!data || !data.ok) {
      if (data?.reason === 'banned') throw new Error('حساب شما مسدود است: ' + (data.ban_reason || ''));
      throw new Error('نام کاربری یا رمز عبور اشتباه است');
    }
    return data.user;
  }

  async function doRegister(username, password) {
    const { data, error } = await sb.rpc('register_user', {
      p_username: username,
      p_password: password,
      p_device_id: DEVICE_ID
    });
    if (error) throw new Error(error.message || 'خطای سرور');
    if (!data || !data.ok) {
      if (data?.reason === 'username_taken') throw new Error('این نام کاربری قبلاً گرفته شده');
      throw new Error('ثبت‌نام ناموفق بود');
    }
    return data.user;
  }

  async function refreshProfile() {
    if (!CURRENT_USER?.id) return;
    const { data, error } = await sb.rpc('get_my_profile', { p_user_id: CURRENT_USER.id });
    if (!error && data) {
      CURRENT_USER = data;
      localStorage.setItem('gz_user_cache', JSON.stringify(data));
      updateUIFromUser();
    }
  }

  // ---------- Game State ----------
  const GAME_MODES = {
    classic:   { min: 10000,  max: 500000,  label: '۱۰٬۰۰۰ – ۵۰۰٬۰۰۰',  color: '#3b82f6' },
    blitz:     { min: 0,      max: 100000,  label: '۰ – ۱۰۰٬۰۰۰',       color: '#f59e0b' },
    precision: { min: 0,      max: 10000,   label: '۰ – ۱۰٬۰۰۰',        color: '#22c55e' },
    survival:  { min: 0,      max: 1000000, label: '۰ – ۱٬۰۰۰٬۰۰۰',     color: '#ef4444' },
    ranked:    { min: 50000,  max: 2000000, label: '۵۰٬۰۰۰ – ۲٬۰۰۰٬۰۰۰', color: '#a78bfa' }
  };

  let gameMode = localStorage.getItem('gz_game_mode') || 'classic';
  let currentRoundId = null;
  let typedDigits = '';
  let guessCount = 0;
  let guessHistory = [];
  let isRoundActive = false;
  let isBusy = false;

  // ---------- Game Logic (server-authoritative) ----------
  async function startNewRound() {
    if (isBusy) return;
    isBusy = true;
    try {
      const mode = GAME_MODES[gameMode] || GAME_MODES.classic;
      const { data, error } = await sb.rpc('start_round', {
        p_user_id: CURRENT_USER.id,
        p_mode: gameMode,
        p_min: mode.min,
        p_max: mode.max
      });
      if (error || !data?.ok) {
        // Fallback to client-side for demo if RPC not applied yet
        console.warn('start_round RPC failed, using client fallback', error || data);
        currentRoundId = 'local-' + Date.now();
        window.__localTarget = mode.min + Math.floor(Math.random() * (mode.max - mode.min + 1));
      } else {
        currentRoundId = data.round_id;
        window.__localTarget = null; // server has it
      }

      typedDigits = '';
      guessCount = 0;
      guessHistory = [];
      isRoundActive = true;
      updateGuessDisplay();
      renderHistory();
      $('resultFeedback').textContent = '';
      $('resultFeedback').className = 'result-feedback';
      $('guessCount').textContent = 'حدس ۰';
      $('submitGuessBtn').disabled = true;
      $('winOverlay').classList.add('hidden');
      $('rangeLabel').textContent = mode.label;
    } catch (e) {
      toast('خطا در شروع راند');
      console.error(e);
    } finally {
      isBusy = false;
    }
  }

  async function submitGuess() {
    if (!isRoundActive || isBusy || !typedDigits) return;
    const guess = parseInt(typedDigits, 10);
    if (!Number.isFinite(guess)) return;

    const mode = GAME_MODES[gameMode] || GAME_MODES.classic;
    if (guess < mode.min || guess > mode.max) {
      toast('عدد خارج از محدوده است');
      return;
    }

    isBusy = true;
    $('submitGuessBtn').disabled = true;

    try {
      let result, target, xp = 0, coins = 0;

      if (currentRoundId && !String(currentRoundId).startsWith('local-')) {
        // Server path
        const { data, error } = await sb.rpc('submit_guess', {
          p_user_id: CURRENT_USER.id,
          p_round_id: currentRoundId,
          p_guess: guess
        });
        if (error || !data?.ok) throw new Error(data?.reason || error?.message || 'خطا');
        result = data.result;
        target = data.target;
        xp = data.xp || 0;
        coins = data.coins || 0;
        guessCount = data.guesses || guessCount + 1;
      } else {
        // Local fallback (for when schema not yet applied)
        const t = window.__localTarget;
        guessCount++;
        if (guess === t) {
          result = 'win';
          target = t;
          xp = Math.max(8, 40 - guessCount * 2);
          coins = guessCount <= 5 ? 25 : guessCount <= 10 ? 15 : 8;
        } else if (guess < t) {
          result = 'higher';
        } else {
          result = 'lower';
        }
      }

      guessHistory.push({ guess, result });
      renderHistory();

      const fb = $('resultFeedback');
      if (result === 'win') {
        fb.textContent = '🎉 درست بود!';
        fb.className = 'result-feedback win';
        isRoundActive = false;
        showWinOverlay(target, guessCount, xp, coins);
        // Optimistic UI update
        if (CURRENT_USER) {
          CURRENT_USER.total_wins = (CURRENT_USER.total_wins || 0) + 1;
          CURRENT_USER.current_streak = (CURRENT_USER.current_streak || 0) + 1;
          CURRENT_USER.coins = (CURRENT_USER.coins || 0) + coins;
          CURRENT_USER.xp = (CURRENT_USER.xp || 0) + xp;
          updateUIFromUser();
        }
        setTimeout(() => refreshProfile(), 800);
      } else if (result === 'higher') {
        fb.textContent = '↑ بالاتر';
        fb.className = 'result-feedback higher';
        typedDigits = '';
        updateGuessDisplay();
      } else {
        fb.textContent = '↓ پایین‌تر';
        fb.className = 'result-feedback lower';
        typedDigits = '';
        updateGuessDisplay();
      }

      $('guessCount').textContent = 'حدس ' + fmtNum(guessCount);
    } catch (e) {
      toast(e.message || 'خطا در ثبت حدس');
      console.error(e);
    } finally {
      isBusy = false;
      $('submitGuessBtn').disabled = !typedDigits;
    }
  }

  function showWinOverlay(target, guesses, xp, coins) {
    $('winTarget').textContent = 'عدد: ' + fmtNum(target);
    $('winGuesses').textContent = fmtNum(guesses);
    $('winXp').textContent = '+' + fmtNum(xp);
    $('winCoins').textContent = '+' + fmtNum(coins);
    $('winOverlay').classList.remove('hidden');
  }

  function updateGuessDisplay() {
    const el = $('currentGuessDisplay');
    el.textContent = typedDigits ? Number(typedDigits).toLocaleString('en-US') : '؟';
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
    $('submitGuessBtn').disabled = !typedDigits || !isRoundActive || isBusy;
  }

  function renderHistory() {
    const box = $('guessHistory');
    box.innerHTML = guessHistory.slice(-8).map(h =>
      `<div class="gh-item ${h.result}">${Number(h.guess).toLocaleString('en-US')} ${h.result === 'higher' ? '↑' : h.result === 'lower' ? '↓' : '✓'}</div>`
    ).join('');
  }

  // Numpad
  function setupNumpad() {
    $('numpad').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-n]');
      if (!btn || !isRoundActive) return;
      const n = btn.dataset.n;
      if (n === 'clear') typedDigits = '';
      else if (n === 'del') typedDigits = typedDigits.slice(0, -1);
      else if (typedDigits.length < 9) typedDigits += n;
      updateGuessDisplay();
    });
    $('submitGuessBtn').onclick = submitGuess;
    $('nextRoundBtn').onclick = () => {
      $('winOverlay').classList.add('hidden');
      startNewRound();
    };
  }

  // Mode switch
  function setupModes() {
    $('modeSelector').addEventListener('click', (e) => {
      const chip = e.target.closest('.mode-chip');
      if (!chip) return;
      const mode = chip.dataset.mode;
      if (mode === gameMode) return;
      if (isRoundActive && guessCount > 0) {
        if (!confirm('راند فعلی تمام می‌شود. ادامه می‌دهی؟')) return;
      }
      gameMode = mode;
      localStorage.setItem('gz_game_mode', mode);
      document.querySelectorAll('.mode-chip').forEach(c => c.classList.toggle('active', c.dataset.mode === mode));
      startNewRound();
    });
  }

  // Power-ups (client-side cost for now)
  function setupPowerups() {
    $('powerups').addEventListener('click', (e) => {
      const btn = e.target.closest('.power-btn');
      if (!btn || !isRoundActive) return;
      const power = btn.dataset.power;
      const costs = { hint: 30, range: 50, skip: 80 };
      const cost = costs[power] || 0;
      if ((CURRENT_USER.coins || 0) < cost) {
        toast('سکه کافی نداری');
        return;
      }
      // Optimistic deduct
      CURRENT_USER.coins -= cost;
      updateUIFromUser();
      toast('قابلیت به زودی فعال می‌شود (نسخه بعدی)');
      // In full version: call RPC to spend coins + apply effect
    });
  }

  // ---------- UI Updates ----------
  function updateUIFromUser() {
    if (!CURRENT_USER) return;
    const u = CURRENT_USER;
    $('topUsername').textContent = u.username || '...';
    $('statLevel').textContent = u.level || 1;
    $('statStreak').textContent = (u.current_streak || 0) + ' 🔥';
    $('statCoins').textContent = fmtNum(u.coins || 0);
    const xpPct = Math.min(100, ((u.xp || 0) / (u.xp_needed || 50)) * 100);
    $('xpFill').style.width = xpPct + '%';

    // Avatar
    const av = $('topAvatar');
    av.textContent = initials(u.username);
    if (u.avatar_url) {
      av.innerHTML = `<img src="${escapeHtml(u.avatar_url)}" alt="">`;
    }

    // Profile screen
    $('profileName').textContent = u.username;
    $('profileTitle').textContent = u.title || 'Newbie';
    $('pLevel').textContent = u.level || 1;
    $('pWins').textContent = fmtNum(u.total_wins || 0);
    $('pCrowns').textContent = fmtNum(u.crowns || 0);
    const pav = $('profileAvatar');
    pav.textContent = initials(u.username);
    if (u.avatar_url) pav.innerHTML = `<img src="${escapeHtml(u.avatar_url)}" alt="">`;

    // Admin tab
    if (u.is_owner || u.is_admin || u.is_staff) {
      $('adminTabBtn').classList.remove('hidden');
    }
  }

  // ---------- Navigation ----------
  function showScreen(id) {
    document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const panel = $(id);
    if (panel) panel.classList.add('active');
    const btn = document.querySelector(`.tab-btn[data-screen="${id}"]`);
    if (btn) btn.classList.add('active');

    if (id === 'leaderScreen') loadLeaderboard('weekly');
    if (id === 'socialScreen') loadChat();
  }

  function setupNav() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => showScreen(btn.dataset.screen));
    });
    $('logoutBtn').onclick = () => {
      localStorage.removeItem('gz_user_id');
      localStorage.removeItem('gz_session_ok');
      localStorage.removeItem('gz_user_cache');
      location.replace('../login/');
    };
  }

  // ---------- Leaderboard ----------
  async function loadLeaderboard(type) {
    const box = $('leaderList');
    box.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:20px">در حال بارگذاری...</div>';
    try {
      let q = sb.from('users').select('id,username,avatar_url,total_wins,weekly_wins,rank_points,level,is_verified');
      if (type === 'weekly') q = q.order('weekly_wins', { ascending: false }).order('weekly_guesses', { ascending: true });
      else if (type === 'ranked') q = q.order('rank_points', { ascending: false });
      else q = q.order('total_wins', { ascending: false }).order('total_guesses', { ascending: true });
      const { data, error } = await q.limit(50);
      if (error) throw error;
      if (!data?.length) {
        box.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:20px">هنوز کسی نیست</div>';
        return;
      }
      box.innerHTML = data.map((u, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const score = type === 'weekly' ? u.weekly_wins : type === 'ranked' ? u.rank_points : u.total_wins;
        return `<div class="leader-row">
          <div class="leader-rank ${rankClass}">${i + 1}</div>
          <div class="avatar sm">${initials(u.username)}</div>
          <div class="leader-info">
            <div class="leader-name">${escapeHtml(u.username)}${u.is_verified ? ' ✓' : ''}</div>
            <div class="leader-sub">لول ${u.level || 1}</div>
          </div>
          <div class="leader-score">${fmtNum(score)}</div>
        </div>`;
      }).join('');
    } catch (e) {
      box.innerHTML = '<div style="text-align:center;color:var(--red);padding:20px">خطا در بارگذاری</div>';
    }
  }

  // Leader tabs
  document.querySelectorAll('[data-lb]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-lb]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadLeaderboard(tab.dataset.lb);
    });
  });

  // ---------- Chat (simple) ----------
  async function loadChat() {
    const box = $('chatMessages');
    try {
      const { data } = await sb.from('messages')
        .select('id,content,created_at,user_id')
        .eq('room', 'global')
        .order('created_at', { ascending: false })
        .limit(40);
      // We don't join users for simplicity; show user_id short
      box.innerHTML = (data || []).reverse().map(m =>
        `<div class="chat-msg">
          <div class="meta">${escapeHtml(String(m.user_id).slice(0, 8))} · ${new Date(m.created_at).toLocaleTimeString('fa-IR')}</div>
          <div class="body">${escapeHtml(m.content)}</div>
        </div>`
      ).join('') || '<div style="text-align:center;color:var(--text-dim)">پیامی نیست</div>';
      box.scrollTop = box.scrollHeight;
    } catch (e) {
      box.innerHTML = '<div style="color:var(--red)">خطا</div>';
    }
  }

  $('chatSendBtn')?.addEventListener('click', async () => {
    const input = $('chatInput');
    const text = (input.value || '').trim();
    if (!text || !CURRENT_USER) return;
    input.value = '';
    try {
      await sb.from('messages').insert({
        room: 'global',
        user_id: CURRENT_USER.id,
        content: text.slice(0, 200)
      });
      loadChat();
    } catch (e) {
      toast('ارسال ناموفق');
    }
  });

  // ---------- Boot ----------
  async function boot() {
    try {
      await initDevice();
      await ensureSb();

      const uid = localStorage.getItem('gz_user_id');
      if (!uid) {
        location.replace('../login/');
        return;
      }

      // Try cache first for fast UI
      try {
        const cache = JSON.parse(localStorage.getItem('gz_user_cache') || 'null');
        if (cache && cache.id === uid) {
          CURRENT_USER = cache;
          updateUIFromUser();
        }
      } catch (e) {}

      // Refresh from server
      const { data, error } = await sb.rpc('get_my_profile', { p_user_id: uid });
      if (error || !data) {
        // Fallback: maybe old schema
        console.warn('get_my_profile failed', error);
        if (!CURRENT_USER) {
          localStorage.removeItem('gz_user_id');
          location.replace('../login/');
          return;
        }
      } else {
        CURRENT_USER = data;
        localStorage.setItem('gz_user_cache', JSON.stringify(data));
        localStorage.setItem('gz_session_ok', '1');
        updateUIFromUser();
      }

      // Show app
      $('loadingScreen').classList.add('hidden');
      $('mainApp').classList.remove('hidden');

      setupNumpad();
      setupModes();
      setupPowerups();
      setupNav();
      startNewRound();

    } catch (e) {
      console.error(boot, e);
      $('loadingText').textContent = '';
      $('loadingError').classList.remove('hidden');
      $('loadingErrorMsg').textContent = e.message || 'خطا در بارگذاری';
      $('loadingRetryBtn').onclick = () => location.reload();
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

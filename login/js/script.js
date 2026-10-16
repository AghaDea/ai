/* CHAMBER Login — optional auth, guest continue */
(function () {
  'use strict';

  let mode = 'login';
  let SUPABASE_URL = '';
  let SUPABASE_ANON_KEY = '';
  let sb = null;

  const $ = (id) => document.getElementById(id);

  function baseApp() {
    var path = location.pathname || '/';
    if (/\/index\.html$/i.test(path)) path = path.replace(/\/index\.html$/i, '/');
    else if (!path.endsWith('/')) {
      if (/\.[a-zA-Z0-9]+$/.test(path.split('/').pop())) path = path.replace(/\/[^/]*$/, '/');
      else path = path + '/';
    }
    return path.replace(/\/login\/?$/i, '/');
  }

  function goApp() {
    try { location.replace(baseApp() + 'app/'); }
    catch (e) { location.replace('../app/'); }
  }

  function deviceId() {
    var id = localStorage.getItem('ch_device_id');
    if (!id) {
      id = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('ch_device_id', id);
    }
    return id;
  }

  async function init() {
    // already logged in?
    if (localStorage.getItem('ch_user_id') && localStorage.getItem('ch_user_cache')) {
      goApp();
      return;
    }

    try {
      if (typeof loadChConfig === 'function') {
        var cfg = await loadChConfig();
        SUPABASE_URL = cfg.SUPABASE_URL || '';
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY || '';
      }
    } catch (e) {}

    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY &&
        !SUPABASE_URL.includes('YOUR_PROJECT')) {
      sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    }

    wire();
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.mode === m);
    });
    $('sub').textContent = m === 'login' ? 'وارد حساب شو یا همین‌طور مهمان بمان' : 'یک حساب جدید بساز';
    $('submitBtn').textContent = m === 'login' ? 'ورود' : 'ثبت‌نام';
    $('err').classList.add('hidden');
  }

  function showErr(msg) {
    $('err').textContent = msg;
    $('err').classList.remove('hidden');
  }

  async function submit() {
    var username = ($('username').value || '').trim();
    var password = $('password').value || '';
    $('err').classList.add('hidden');

    if (username.length < 3 || username.length > 16) {
      showErr('نام کاربری باید بین ۳ تا ۱۶ کاراکتر باشد');
      return;
    }
    if (password.length < 4) {
      showErr('رمز عبور حداقل ۴ کاراکتر');
      return;
    }
    if (!sb) {
      showErr('اتصال به سرور برقرار نشد — Config را چک کن');
      return;
    }

    $('submitBtn').disabled = true;
    try {
      var fn = mode === 'signup' ? 'register_user' : 'login_user';
      var res = await sb.rpc(fn, {
        p_username: username,
        p_password: password,
        p_device_id: deviceId()
      });
      var data = res.data;
      var error = res.error;

      if (error) throw new Error(error.message || 'خطای سرور');
      if (!data || !data.ok) {
        var r = data && data.reason;
        if (r === 'username_taken') throw new Error('این نام کاربری قبلاً گرفته شده');
        if (r === 'banned') throw new Error('حساب شما مسدود است');
        if (r === 'device_banned') throw new Error('دستگاه شما مسدود است');
        throw new Error(mode === 'login' ? 'نام کاربری یا رمز اشتباه است' : 'ثبت‌نام ناموفق');
      }

      localStorage.setItem('ch_user_id', data.user.id);
      localStorage.setItem('ch_user_cache', JSON.stringify(data.user));
      goApp();
    } catch (e) {
      showErr(e.message || 'خطا');
    } finally {
      $('submitBtn').disabled = false;
    }
  }

  function guestContinue() {
    // ensure guest name exists for app
    if (!sessionStorage.getItem('ch_guest_name')) {
      sessionStorage.setItem('ch_guest_name', 'Ghost' + (100 + Math.floor(Math.random() * 900)));
    }
    localStorage.removeItem('ch_user_id');
    localStorage.removeItem('ch_user_cache');
    goApp();
  }

  function wire() {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.onclick = function () { setMode(t.dataset.mode); };
    });
    $('submitBtn').onclick = submit;
    $('guestBtn').onclick = guestContinue;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

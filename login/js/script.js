/* Guessino Login — Secure Auth via RPC */
(function () {
  'use strict';

  let mode = 'login'; // or 'signup'
  let SUPABASE_URL = '';
  let SUPABASE_ANON_KEY = '';
  let sb = null;

  const $ = (id) => document.getElementById(id);

  async function init() {
    try {
      if (typeof loadGzConfig === 'function') {
        const cfg = await loadGzConfig();
        SUPABASE_URL = cfg.SUPABASE_URL || '';
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY || '';
      }
    } catch (e) {}

    // Check maintenance mode
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/site_update_normalize', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: '{}'
        });
        if (r.ok) {
          const d = await r.json();
          if (d && d.ok && d.active) {
            location.replace('../update/');
            return;
          }
        }
      } catch (e) {}
    }

    // Already logged in?
    if (localStorage.getItem('gz_user_id') && localStorage.getItem('gz_session_ok')) {
      location.replace('../app/');
      return;
    }

    // Load Supabase library
    await new Promise((resolve) => {
      if (typeof supabase !== 'undefined') {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });

    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
      sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    }
  }

  function setMode(m) {
    mode = m;
    $('authSub').textContent = m === 'login' ? 'وارد حساب خود شوید' : 'یک حساب جدید بسازید';
    $('submitBtn').textContent = m === 'login' ? 'ورود' : 'ثبت‌نام';
    $('switchLink').textContent = m === 'login' ? 'ثبت‌نام' : 'ورود';
    $('authError').classList.add('hidden');
  }

  function setupUI() {
    $('switchLink').onclick = () => setMode(mode === 'login' ? 'signup' : 'login');

    $('submitBtn').onclick = async () => {
      const username = ($('username').value || '').trim();
      const password = $('password').value || '';
      const err = $('authError');
      err.classList.add('hidden');

      if (username.length < 2 || username.length > 16) {
        err.textContent = 'نام کاربری باید بین ۲ تا ۱۶ کاراکتر باشد';
        err.classList.remove('hidden');
        return;
      }
      if (password.length < 4) {
        err.textContent = 'رمز عبور حداقل ۴ کاراکتر';
        err.classList.remove('hidden');
        return;
      }
      if (!sb) {
        err.textContent = 'اتصال به سرور برقرار نشد';
        err.classList.remove('hidden');
        return;
      }

      $('submitBtn').disabled = true;
      try {
        let deviceId = localStorage.getItem('gz_device_id');
        if (!deviceId) {
          deviceId = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('gz_device_id', deviceId);
        }

        const rpcName = mode === 'signup' ? 'register_user' : 'login_user';
        const { data, error } = await sb.rpc(rpcName, {
          p_username: username,
          p_password: password,
          p_device_id: deviceId
        });

        if (error) throw new Error(error.message || 'خطای سرور');
        if (!data || !data.ok) {
          if (data && data.reason === 'username_taken') {
            throw new Error('این نام کاربری قبلاً گرفته شده');
          }
          if (data && data.reason === 'banned') {
            throw new Error('حساب شما مسدود است' + (data.ban_reason ? ': ' + data.ban_reason : ''));
          }
          throw new Error(mode === 'login' ? 'نام کاربری یا رمز اشتباه است' : 'ثبت‌نام ناموفق');
        }

        localStorage.setItem('gz_user_id', data.user.id);
        localStorage.setItem('gz_session_ok', '1');
        localStorage.setItem('gz_user_cache', JSON.stringify(data.user));
        location.replace('../app/');
      } catch (e) {
        err.textContent = e.message || 'خطا';
        err.classList.remove('hidden');
      } finally {
        $('submitBtn').disabled = false;
      }
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('submitBtn').click();
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await init();
      setupUI();
    });
  } else {
    init().then(setupUI);
  }
})();

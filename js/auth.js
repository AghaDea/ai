// منطق ورود و ثبت‌نام

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const messageBox = document.getElementById('auth-message');

  // سوییچ بین تب‌ها
  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      clearMessage();
    });

    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      clearMessage();
    });
  }

  // ورود
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showMessage('لطفاً ایمیل و رمز عبور رو کامل وارد کن.', 'error');
        return;
      }

      showMessage('دارم وارد می‌شم... یه لحظه صبر کن.', 'info');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showMessage(translateError(error.message), 'error');
        return;
      }

      showMessage('خوش اومدی! داری می‌ری به داشبورد...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    });
  }

  // ثبت‌نام
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const password2 = document.getElementById('register-password2').value;

      if (!email || !password) {
        showMessage('ایمیل و رمز عبور رو وارد کن لطفاً.', 'error');
        return;
      }

      if (password.length < 6) {
        showMessage('رمز عبور حداقل باید ۶ کاراکتر باشه.', 'error');
        return;
      }

      if (password !== password2) {
        showMessage('دو تا رمز عبور یکی نیستن. دوباره چک کن.', 'error');
        return;
      }

      showMessage('دارم حسابت رو می‌سازم...', 'info');

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        showMessage(translateError(error.message), 'error');
        return;
      }

      // در بعضی تنظیمات Supabase نیاز به تأیید ایمیل هست
      if (data.user && !data.session) {
        showMessage('حساب ساخته شد! یه ایمیل تأیید برات فرستادم. بعد از تأیید می‌تونی وارد شی.', 'success');
      } else {
        showMessage('حسابت آماده شد! خوش اومدی 🎉', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      }
    });
  }

  // اگر کاربر قبلاً لاگین باشه، مستقیم بفرستش داشبورد
  checkIfAlreadyLoggedIn();
});

async function checkIfAlreadyLoggedIn() {
  const user = await getCurrentUser();
  if (user) {
    window.location.href = 'dashboard.html';
  }
}

function showMessage(text, type = 'info') {
  const box = document.getElementById('auth-message');
  if (!box) return;
  box.textContent = text;
  box.className = `auth-message ${type}`;
  box.classList.remove('hidden');
}

function clearMessage() {
  const box = document.getElementById('auth-message');
  if (box) {
    box.classList.add('hidden');
    box.textContent = '';
  }
}

function translateError(msg) {
  const map = {
    'Invalid login credentials': 'ایمیل یا رمز عبور اشتباهه.',
    'Email not confirmed': 'اول باید ایمیلت رو تأیید کنی.',
    'User already registered': 'این ایمیل قبلاً ثبت شده. برو تب ورود.',
    'Password should be at least 6 characters': 'رمز عبور خیلی کوتاهه (حداقل ۶ کاراکتر).',
    'Unable to validate email address: invalid format': 'فرمت ایمیل درست نیست.'
  };
  return map[msg] || msg;
}

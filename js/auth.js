// منطق ورود و ثبت‌نام با نام کاربری (بدون ایمیل واقعی)

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');

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
      const username = document.getElementById('login-username').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      if (!username || !password) {
        showMessage('لطفاً نام کاربری و رمز عبور رو کامل وارد کن.', 'error');
        return;
      }

      if (!isValidUsername(username)) {
        showMessage('نام کاربری فقط می‌تونه شامل حروف انگلیسی، عدد و _ باشه.', 'error');
        return;
      }

      showMessage('دارم وارد می‌شم... یه لحظه صبر کن.', 'info');

      // تبدیل نام کاربری به ایمیل داخلی
      const email = usernameToEmail(username);

      const { data, error } = await supabaseClient.auth.signInWithPassword({
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
      const username = document.getElementById('register-username').value.trim().toLowerCase();
      const password = document.getElementById('register-password').value;
      const password2 = document.getElementById('register-password2').value;

      if (!username || !password) {
        showMessage('نام کاربری و رمز عبور رو وارد کن لطفاً.', 'error');
        return;
      }

      if (!isValidUsername(username)) {
        showMessage('نام کاربری فقط می‌تونه شامل حروف انگلیسی، عدد و آندرلاین (_) باشه و حداقل ۳ کاراکتر.', 'error');
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

      const email = usernameToEmail(username);

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            display_name: username
          }
        }
      });

      if (error) {
        console.error('SignUp error:', error);
        showMessage(translateError(error.message), 'error');
        return;
      }

      // اگر تأیید ایمیل خاموش باشه، مستقیم session می‌ده
      if (data.user && data.session) {
        showMessage('حسابت آماده شد! خوش اومدی 🎉', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 900);
      } else if (data.user) {
        // ممکنه تأیید ایمیل روشن باشه
        showMessage('حساب ساخته شد! اگر صفحه ورود نیومد، از تب ورود وارد شو.', 'success');
        setTimeout(() => {
          // سعی کن لاگین کنه
          loginAfterRegister(email, password);
        }, 1200);
      } else {
        showMessage('مشکلی پیش اومد. دوباره امتحان کن.', 'error');
      }
    });
  }

  // اگر کاربر قبلاً لاگین باشه، مستقیم بفرستش داشبورد
  checkIfAlreadyLoggedIn();
});

async function loginAfterRegister(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (!error) {
    window.location.href = 'dashboard.html';
  }
}

async function checkIfAlreadyLoggedIn() {
  const user = await getCurrentUser();
  if (user) {
    window.location.href = 'dashboard.html';
  }
}

// تبدیل نام کاربری به ایمیل ساختگی (Supabase فقط با ایمیل کار می‌کنه)
function usernameToEmail(username) {
  return `${username}@htmlstudio.local`;
}

// اعتبارسنجی نام کاربری
function isValidUsername(username) {
  // فقط حروف انگلیسی، عدد و آندرلاین، حداقل ۳ کاراکتر
  return /^[a-z0-9_]{3,30}$/.test(username);
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
    'Invalid login credentials': 'نام کاربری یا رمز عبور اشتباهه.',
    'Email not confirmed': 'حساب هنوز فعال نشده. با پشتیبانی در میون بذار.',
    'User already registered': 'این نام کاربری قبلاً ثبت شده. یکی دیگه انتخاب کن یا برو تب ورود.',
    'Password should be at least 6 characters': 'رمز عبور خیلی کوتاهه (حداقل ۶ کاراکتر).',
    'Unable to validate email address: invalid format': 'نام کاربری معتبر نیست.',
    'Database error saving new user': 'خطای دیتابیس موقع ساخت حساب. احتمالاً تأیید ایمیل روشنه یا کلید API مشکل داره. برو تنظیمات Supabase رو چک کن (پایین صفحه راهنما هست).',
    'Signups not allowed for this instance': 'ثبت‌نام در این پروژه غیرفعال شده.',
    'Email rate limit exceeded': 'خیلی سریع تلاش کردی. چند دقیقه صبر کن.'
  };

  // اگر پیام دقیق نبود، سعی کن شباهت پیدا کنی
  for (const key in map) {
    if (msg.includes(key) || msg.toLowerCase().includes(key.toLowerCase())) {
      return map[key];
    }
  }
  return msg;
}

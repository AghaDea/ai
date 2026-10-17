// کلاینت مرکزی Supabase
// این فایل رو در همه صفحه‌ها لود می‌کنیم

let supabase = null;

function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.error('کتابخانه Supabase لود نشده. مطمئن شو CDN درست باشه.');
    return null;
  }

  if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_SUPABASE')) {
    console.warn('هنوز کلیدهای Supabase رو تنظیم نکردی! به فایل js/config.js سر بزن.');
    return null;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

// گرفتن کاربر فعلی
async function getCurrentUser() {
  if (!supabase) initSupabase();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('خطا در گرفتن کاربر:', error.message);
    return null;
  }
  return user;
}

// خروج از حساب
async function signOut() {
  if (!supabase) initSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('خطا در خروج:', error.message);
    return false;
  }
  window.location.href = 'index.html';
  return true;
}

// بررسی اینکه کاربر لاگین هست یا نه و در صورت نیاز ریدایرکت
async function requireAuth(redirectTo = 'index.html') {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

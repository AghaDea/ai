// کلاینت مرکزی Supabase
// این فایل رو در همه صفحه‌ها لود می‌کنیم

let supabaseClient = null;

function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.error('کتابخانه Supabase لود نشده. مطمئن شو CDN درست باشه.');
    return null;
  }

  if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_SUPABASE')) {
    console.warn('هنوز کلیدهای Supabase رو تنظیم نکردی! به فایل js/config.js سر بزن.');
    return null;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

// گرفتن کاربر فعلی
async function getCurrentUser() {
  if (!supabaseClient) initSupabase();
  if (!supabaseClient) return null;

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error('خطا در گرفتن کاربر:', error.message);
    return null;
  }
  return user;
}

// خروج از حساب
async function signOut() {
  if (!supabaseClient) initSupabase();
  const { error } = await supabaseClient.auth.signOut();
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

Guessino — نسخه نهایی
======================

این بسته = همان پروژه اصلی خودت + فقط این تغییرات:

1) supabase_schema.sql
   - کل اسکیمای اصلی (تمام جداول و فانکشن‌ها)
   - لایه امنیتی v3.7 در انتهای فایل:
     • register_user با bcrypt
     • login_user که هم هش قدیمی را قبول می‌کند هم bcrypt
     • get_my_profile
     • start_round / submit_guess (اختیاری)

2) بقیه فایل‌ها
   - بدون تغییر از پروژه اصلی تو کپی شده‌اند
   - app/js/script.js همان ۷۰۰۰+ خط اصلی
   - login/js/script.js همان نسخه اصلی (کپچا و آنتی‌بات مال خود پروژه تو است، اضافه نشده)

نحوه نصب SQL:
  کل supabase_schema.sql را در SQL Editor سوپابیس اجرا کن.

اگر قبلاً اسکیما را زده‌ای، دوباره اجرا کردن باید امن باشد (IF NOT EXISTS / OR REPLACE).

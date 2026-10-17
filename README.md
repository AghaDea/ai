# HTML Studio — استودیو یادگیری و ساخت پروژه HTML

یک پلتفرم کامل و حرفه‌ای برای یادگیری و ساخت پروژه‌های HTML/CSS/JavaScript با پیش‌نمایش زنده، مدیریت چندفایلی، ذخیره‌سازی روی سرور و آماده انتشار روی GitHub Pages.

---

## ویژگی‌های اصلی

- **ساخت و حذف پروژه** — هر کاربر می‌تونه هر تعداد پروژه بسازه و حذف کنه
- **ویرایش همزمان چند فایل** — تب‌های جدا برای هر فایل
- **فایل‌منیجر کامل** در پایین صفحه:
  - آپلود فایل
  - تغییر نام
  - حذف
  - باز کردن در ادیتور
- **پیش‌نمایش زنده و دقیق** — هر تغییری فوری در iframe نمایش داده می‌شه
- **هایلایت سینتکس رنگی** (مثل ادیتورهای حرفه‌ای)
- **جداسازی فایل‌ها** — `.html` ، `.css` ، `.js` جدا ذخیره می‌شن و موقع پیش‌نمایش خودکار به هم متصل می‌شن
- **ذخیره روی سرور (Supabase)** — وقتی دوباره وارد شی، همه پروژه‌هات سر جاشون هستن
- **آماده GitHub Pages** — کاملاً استاتیک + Supabase
- **رابط کاربری فارسی و انسانی** — متن‌ها طوری نوشته شدن که انگار یه دوست داره بهت توضیح می‌ده

---

## پیش‌نیازها

1. یک اکانت رایگان در [Supabase](https://supabase.com)
2. یک ریپازیتوری GitHub (برای انتشار روی GitHub Pages)

---

## راه‌اندازی Supabase (خیلی مهم)

### ۱. پروژه جدید بساز
- برو به [supabase.com](https://supabase.com) و یک پروژه جدید بساز.
- بعد از ساخته شدن، از منوی سمت چپ برو به **Project Settings → API**
- دو تا مقدار رو کپی کن:
  - `Project URL`
  - `anon public` key

### ۲. جداول دیتابیس رو بساز

در بخش **SQL Editor** این کدها رو یکی‌یکی اجرا کن:

```sql
-- جدول پروژه‌ها
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول فایل‌ها
create table public.files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  content text default '',
  file_type text default 'html',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, name)
);

-- ایندکس برای سرعت
create index idx_projects_user on projects(user_id);
create index idx_files_project on files(project_id);

-- فعال کردن RLS
alter table projects enable row level security;
alter table files enable row level security;

-- سیاست‌های امنیتی پروژه‌ها
create policy "Users can view their own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete using (auth.uid() = user_id);

-- سیاست‌های امنیتی فایل‌ها
create policy "Users can view files of their projects"
  on files for select using (
    exists (
      select 1 from projects
      where projects.id = files.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert files to their projects"
  on files for insert with check (
    exists (
      select 1 from projects
      where projects.id = files.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update files of their projects"
  on files for update using (
    exists (
      select 1 from projects
      where projects.id = files.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete files of their projects"
  on files for delete using (
    exists (
      select 1 from projects
      where projects.id = files.project_id
      and projects.user_id = auth.uid()
    )
  );
```

### ۳. احراز هویت رو فعال کن
- برو به **Authentication → Providers**
- Email رو روشن کن (یا Google اگر خواستی)

### ۴. (اختیاری ولی پیشنهادی) Storage برای عکس‌ها
- برو به **Storage**
- یک باکت به اسم `project-assets` بساز و Public بذار.

---

## تنظیم کلیدهای Supabase در پروژه

فایل `js/config.js` رو باز کن و این دو مقدار رو جایگزین کن:

```js
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## انتشار روی GitHub Pages

1. همه فایل‌های این پوشه رو داخل یک ریپازیتوری GitHub بریز.
2. برو به **Settings → Pages**
3. Source رو روی `Deploy from a branch` بذار و branch رو `main` انتخاب کن.
4. چند دقیقه صبر کن تا سایت بالا بیاد.

آدرس نهایی چیزی شبیه این می‌شه:
`https://yourusername.github.io/html-studio/`

---

## ساختار فایل‌ها

```
html-studio/
├── index.html          ← صفحه ورود / ثبت‌نام / لندینگ
├── dashboard.html      ← لیست پروژه‌ها
├── editor.html         ← ادیتور اصلی + فایل‌منیجر + پیش‌نمایش
├── css/
│   ├── main.css        ← استایل کلی
│   └── editor.css      ← استایل مخصوص ادیتور
├── js/
│   ├── config.js       ← کلیدهای Supabase
│   ├── supabase-client.js
│   ├── auth.js
│   ├── dashboard.js
│   └── editor.js
└── README.md
```

---

## نکات مهم برای یادگیری

- این پروژه خودش یک نمونه کامل از ساختار واقعی یک اپلیکیشن وب مدرنه.
- ببین چطور فایل‌های CSS و JS جدا نگه داشته شدن و موقع پیش‌نمایش به هم وصل می‌شن.
- منطق ذخیره‌سازی، مدیریت state، و کار با API رو با دقت بررسی کن.
- اگر چیزی رو نفهمیدی، کد رو خط به خط بخون و با console.log تست کن.

---

ساخته شده با عشق برای یادگیرندگان HTML ❤️  
اگر سوالی داشتی یا باگی دیدی، بگو تا با هم درستش کنیم.

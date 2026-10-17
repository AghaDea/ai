// صفحه یادگیری HTML

const lessons = {
  1: {
    title: 'مقدمه و ساختار پایه HTML',
    desc: 'اولین قدم: بفهمیم HTML چیه و یه صفحه ساده چطور ساخته می‌شه.',
    content: `
      <p>HTML مخفف <strong>HyperText Markup Language</strong> هست. این زبان ساختار صفحه وب رو می‌سازه. مثل اسکلت بدن انسان.</p>
      <p>هر صفحه HTML یک ساختار ثابت داره که باید حفظش کنی:</p>

      <div class="code-block">
&lt;!DOCTYPE html&gt;
&lt;html lang="fa" dir="rtl"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;عنوان صفحه&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;!-- محتوای صفحه اینجا می‌آد --&gt;
&lt;/body&gt;
&lt;/html&gt;
      </div>

      <h2>توضیح هر قسمت</h2>
      <ul>
        <li><code>&lt;!DOCTYPE html&gt;</code> → به مرورگر می‌گه این یک صفحه HTML5 هست.</li>
        <li><code>lang="fa"</code> → زبان صفحه فارسیه.</li>
        <li><code>dir="rtl"</code> → متن راست‌چین باشه (برای فارسی ضروریه).</li>
        <li><code>&lt;head&gt;</code> → اطلاعات صفحه (عنوان، فونت، استایل و...) اینجا می‌ره. کاربر نمی‌بینه.</li>
        <li><code>&lt;body&gt;</code> → هر چیزی که کاربر می‌بینه اینجا نوشته می‌شه.</li>
      </ul>

      <div class="try-box">
        <h4>تمرین</h4>
        <p>برو به پروژه‌هات، یک پروژه جدید بساز و ساختار بالا رو داخل فایل <code>index.html</code> بنویس. بعد عنوان صفحه رو عوض کن و ببین توی تب مرورگر چه اتفاقی می‌افته.</p>
      </div>

      <div class="tip-box">
        💡 نکته: همیشه تگ‌ها رو با حروف کوچک بنویس و تگ باز و بسته رو درست ببند.
      </div>
    `
  },

  2: {
    title: 'تگ‌های متنی',
    desc: 'یاد می‌گیریم چطور عنوان، پاراگراف و متن‌های مهم بنویسیم.',
    content: `
      <h2>عنوان‌ها (Headings)</h2>
      <p>از <code>&lt;h1&gt;</code> تا <code>&lt;h6&gt;</code> برای عنوان استفاده می‌کنیم. h1 بزرگ‌ترین و h6 کوچک‌ترین است.</p>

      <div class="code-block">
&lt;h1&gt;عنوان اصلی صفحه&lt;/h1&gt;
&lt;h2&gt;عنوان بخش&lt;/h2&gt;
&lt;h3&gt;عنوان فرعی&lt;/h3&gt;
      </div>

      <h2>پاراگراف</h2>
      <div class="code-block">
&lt;p&gt;این یک پاراگراف معمولی است. متن‌های طولانی رو داخل این تگ می‌ذاریم.&lt;/p&gt;
      </div>

      <h2>متن پررنگ و کج</h2>
      <ul>
        <li><code>&lt;strong&gt;</code> → متن مهم و پررنگ</li>
        <li><code>&lt;em&gt;</code> → متن با تاکید (معمولاً کج)</li>
        <li><code>&lt;br&gt;</code> → رفتن به خط بعدی (تگ خالی است)</li>
        <li><code>&lt;hr&gt;</code> → خط افقی جداکننده</li>
      </ul>

      <div class="code-block">
&lt;p&gt;این متن &lt;strong&gt;خیلی مهم&lt;/strong&gt; است و این یکی &lt;em&gt;تاکید&lt;/em&gt; داره.&lt;/p&gt;
      </div>

      <div class="try-box">
        <h4>تمرین</h4>
        <p>یک صفحه بساز که شامل یک h1، دو تا h2 و چند پاراگراف باشه. از strong و em هم استفاده کن.</p>
      </div>
    `
  },

  3: {
    title: 'لینک و تصویر',
    desc: 'یاد می‌گیریم چطور به صفحات دیگه لینک بدیم و عکس بذاریم.',
    content: `
      <h2>لینک (Hyperlink)</h2>
      <p>با تگ <code>&lt;a&gt;</code> لینک می‌سازیم. ویژگی <code>href</code> آدرس مقصد رو مشخص می‌کنه.</p>

      <div class="code-block">
&lt;a href="https://google.com"&gt;برو به گوگل&lt;/a&gt;

&lt;!-- باز شدن در تب جدید --&gt;
&lt;a href="https://google.com" target="_blank"&gt;گوگل (تب جدید)&lt;/a&gt;

&lt;!-- لینک به فایل داخل پروژه --&gt;
&lt;a href="about.html"&gt;درباره ما&lt;/a&gt;
      </div>

      <h2>تصویر</h2>
      <p>تگ <code>&lt;img&gt;</code> خودبسته‌ست (نیازی به تگ بسته نداره). دو ویژگی مهم داره:</p>
      <ul>
        <li><code>src</code> → آدرس عکس</li>
        <li><code>alt</code> → متن جایگزین (اگر عکس لود نشد یا برای نابینایان)</li>
      </ul>

      <div class="code-block">
&lt;img src="photo.jpg" alt="توضیح عکس"&gt;

&lt;!-- با عرض مشخص --&gt;
&lt;img src="https://via.placeholder.com/300" alt="عکس نمونه" width="300"&gt;
      </div>

      <div class="tip-box">
        💡 همیشه برای عکس‌ها alt بنویس. هم برای سئو خوبه هم برای دسترسی‌پذیری.
      </div>
    `
  },

  4: {
    title: 'لیست‌ها',
    desc: 'لیست‌های نقطه‌ای و شماره‌دار.',
    content: `
      <h2>لیست نامرتب (نقطه‌ای)</h2>
      <div class="code-block">
&lt;ul&gt;
  &lt;li&gt;آیتم اول&lt;/li&gt;
  &lt;li&gt;آیتم دوم&lt;/li&gt;
  &lt;li&gt;آیتم سوم&lt;/li&gt;
&lt;/ul&gt;
      </div>

      <h2>لیست مرتب (شماره‌دار)</h2>
      <div class="code-block">
&lt;ol&gt;
  &lt;li&gt;قدم اول&lt;/li&gt;
  &lt;li&gt;قدم دوم&lt;/li&gt;
  &lt;li&gt;قدم سوم&lt;/li&gt;
&lt;/ol&gt;
      </div>

      <h2>لیست تو در تو</h2>
      <div class="code-block">
&lt;ul&gt;
  &lt;li&gt;میوه
    &lt;ul&gt;
      &lt;li&gt;سیب&lt;/li&gt;
      &lt;li&gt;پرتقال&lt;/li&gt;
    &lt;/ul&gt;
  &lt;/li&gt;
  &lt;li&gt;سبزیجات&lt;/li&gt;
&lt;/ul&gt;
      </div>

      <div class="try-box">
        <h4>تمرین</h4>
        <p>یک لیست از کارهایی که امروز باید انجام بدی بساز (با ol) و یک لیست از علایقت (با ul).</p>
      </div>
    `
  },

  5: {
    title: 'تگ‌های معنایی (Semantic)',
    desc: 'تگ‌هایی که معنی دارن و به موتورهای جستجو و برنامه‌ها کمک می‌کنن صفحه رو بهتر بفهمن.',
    content: `
      <p>به جای اینکه همه چیز رو با <code>&lt;div&gt;</code> بنویسی، از تگ‌های معنایی استفاده کن:</p>

      <ul>
        <li><code>&lt;header&gt;</code> → سرصفحه (لوگو، منو، عنوان اصلی)</li>
        <li><code>&lt;nav&gt;</code> → منوی ناوبری</li>
        <li><code>&lt;main&gt;</code> → محتوای اصلی صفحه</li>
        <li><code>&lt;section&gt;</code> → یک بخش موضوعی</li>
        <li><code>&lt;article&gt;</code> → یک مطلب مستقل (مثل پست بلاگ)</li>
        <li><code>&lt;aside&gt;</code> → محتوای کناری (سایدبار)</li>
        <li><code>&lt;footer&gt;</code> → پاورقی</li>
      </ul>

      <div class="code-block">
&lt;header&gt;
  &lt;h1&gt;اسم سایت&lt;/h1&gt;
  &lt;nav&gt;...&lt;/nav&gt;
&lt;/header&gt;

&lt;main&gt;
  &lt;section&gt;
    &lt;h2&gt;درباره ما&lt;/h2&gt;
    &lt;p&gt;...&lt;/p&gt;
  &lt;/section&gt;
&lt;/main&gt;

&lt;footer&gt;
  &lt;p&gt;© ۱۴۰۵&lt;/p&gt;
&lt;/footer&gt;
      </div>

      <div class="tip-box">
        💡 استفاده از تگ‌های معنایی باعث می‌شه کدت تمیزتر باشه و سئوی بهتری داشته باشی.
      </div>
    `
  },

  6: {
    title: 'جداول',
    desc: 'ساخت جدول برای نمایش داده‌های مرتب.',
    content: `
      <div class="code-block">
&lt;table border="1"&gt;
  &lt;thead&gt;
    &lt;tr&gt;
      &lt;th&gt;نام&lt;/th&gt;
      &lt;th&gt;سن&lt;/th&gt;
      &lt;th&gt;شهر&lt;/th&gt;
    &lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;
      &lt;td&gt;علی&lt;/td&gt;
      &lt;td&gt;۲۵&lt;/td&gt;
      &lt;td&gt;تهران&lt;/td&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
      &lt;td&gt;سارا&lt;/td&gt;
      &lt;td&gt;۲۲&lt;/td&gt;
      &lt;td&gt;اصفهان&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;
      </div>

      <ul>
        <li><code>&lt;table&gt;</code> → خود جدول</li>
        <li><code>&lt;thead&gt;</code> → بخش هدر جدول</li>
        <li><code>&lt;tbody&gt;</code> → بدنه جدول</li>
        <li><code>&lt;tr&gt;</code> → یک ردیف</li>
        <li><code>&lt;th&gt;</code> → سلول هدر (معمولاً پررنگ)</li>
        <li><code>&lt;td&gt;</code> → سلول معمولی</li>
      </ul>
    `
  },

  7: {
    title: 'فرم‌ها',
    desc: 'ساخت فرم برای گرفتن اطلاعات از کاربر.',
    content: `
      <div class="code-block">
&lt;form action="#" method="post"&gt;
  &lt;label for="name"&gt;نام:&lt;/label&gt;
  &lt;input type="text" id="name" name="name" placeholder="اسمت رو بنویس"&gt;

  &lt;label for="email"&gt;ایمیل:&lt;/label&gt;
  &lt;input type="email" id="email" name="email"&gt;

  &lt;label for="msg"&gt;پیام:&lt;/label&gt;
  &lt;textarea id="msg" name="message" rows="4"&gt;&lt;/textarea&gt;

  &lt;button type="submit"&gt;ارسال&lt;/button&gt;
&lt;/form&gt;
      </div>

      <h2>انواع input پرکاربرد</h2>
      <ul>
        <li><code>type="text"</code> → متن معمولی</li>
        <li><code>type="email"</code> → ایمیل</li>
        <li><code>type="password"</code> → رمز عبور</li>
        <li><code>type="number"</code> → عدد</li>
        <li><code>type="checkbox"</code> → تیک‌باکس</li>
        <li><code>type="radio"</code> → گزینه تک‌انتخابی</li>
        <li><code>type="file"</code> → انتخاب فایل</li>
      </ul>

      <div class="tip-box">
        💡 همیشه از <code>&lt;label&gt;</code> استفاده کن و با for به id اینپوت وصلش کن. این کار برای دسترسی‌پذیری خیلی مهمه.
      </div>
    `
  },

  8: {
    title: 'مقدمه CSS',
    desc: 'CSS ظاهر صفحه رو کنترل می‌کنه. رنگ، فونت، فاصله و چیدمان.',
    content: `
      <p>سه روش برای اضافه کردن CSS وجود داره:</p>

      <h2>۱. اینلاین (داخل خود تگ) — زیاد توصیه نمی‌شه</h2>
      <div class="code-block">
&lt;p style="color: red; font-size: 18px;"&gt;متن قرمز&lt;/p&gt;
      </div>

      <h2>۲. داخلی (داخل head)</h2>
      <div class="code-block">
&lt;style&gt;
  p {
    color: blue;
  }
&lt;/style&gt;
      </div>

      <h2>۳. خارجی (بهترین روش)</h2>
      <p>یک فایل جدا به اسم <code>style.css</code> بساز و این‌طوری وصلش کن:</p>
      <div class="code-block">
&lt;link rel="stylesheet" href="style.css"&gt;
      </div>

      <div class="tip-box">
        💡 در HTML Studio وقتی فایل CSS می‌سازی، خودش موقع پیش‌نمایش به صفحه وصل می‌شه. نیازی نیست دستی link بنویسی (البته نوشتنش هم اشکالی نداره).
      </div>
    `
  },

  9: {
    title: 'رنگ، فونت و فاصله',
    desc: 'ویژگی‌های پرکاربرد CSS برای زیبا کردن صفحه.',
    content: `
      <div class="code-block">
body {
  font-family: Tahoma, Arial, sans-serif;
  background-color: #f0f4f8;
  color: #1a202c;
  margin: 0;
  padding: 20px;
  line-height: 1.6;
}

h1 {
  color: #2b6cb0;
  font-size: 2rem;
  margin-bottom: 12px;
}

p {
  margin-bottom: 16px;
}
      </div>

      <h2>ویژگی‌های مهم</h2>
      <ul>
        <li><code>color</code> → رنگ متن</li>
        <li><code>background-color</code> → رنگ پس‌زمینه</li>
        <li><code>font-size</code> → اندازه فونت</li>
        <li><code>font-family</code> → نوع فونت</li>
        <li><code>margin</code> → فاصله بیرونی</li>
        <li><code>padding</code> → فاصله درونی</li>
        <li><code>border</code> → حاشیه</li>
        <li><code>border-radius</code> → گرد کردن گوشه‌ها</li>
      </ul>
    `
  },

  10: {
    title: 'Flexbox ساده',
    desc: 'یکی از قدرتمندترین ابزارهای CSS برای چیدمان.',
    content: `
      <p>با Flexbox می‌تونی المان‌ها رو راحت کنار هم بچینی.</p>

      <div class="code-block">
.container {
  display: flex;
  justify-content: center;    /* افقی وسط‌چین */
  align-items: center;        /* عمودی وسط‌چین */
  gap: 16px;                  /* فاصله بین آیتم‌ها */
  flex-wrap: wrap;            /* اگر جا نشد بره خط بعد */
}

.item {
  background: #3b82f6;
  color: white;
  padding: 20px;
  border-radius: 8px;
}
      </div>

      <h2>ویژگی‌های پرکاربرد justify-content</h2>
      <ul>
        <li><code>flex-start</code> → از ابتدا</li>
        <li><code>center</code> → وسط</li>
        <li><code>flex-end</code> → از انتها</li>
        <li><code>space-between</code> → فاصله مساوی بین آیتم‌ها</li>
        <li><code>space-around</code> → فاصله مساوی اطراف آیتم‌ها</li>
      </ul>

      <div class="try-box">
        <h4>تمرین نهایی</h4>
        <p>یک هدر بساز که لوگو سمت راست و منو سمت چپ باشه (با flex و space-between). بعد چند تا کارت با flex کنار هم بچین.</p>
      </div>

      <div class="tip-box">
        🎉 تبریک! اگر تا اینجا اومدی، پایه‌های HTML و CSS رو بلدی. حالا برو پروژه واقعی بساز و تمرین کن.
      </div>
    `
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  const user = await getCurrentUser();
  // یادگیری برای همه بازه، حتی بدون لاگین (اختیاری)
  // if (!user) { window.location.href = 'index.html'; return; }

  document.getElementById('logout-btn')?.addEventListener('click', () => signOut());

  // لود درس اول
  loadLesson(1);

  // کلیک روی درس‌ها
  document.querySelectorAll('.lesson-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lesson-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadLesson(btn.dataset.lesson);
    });
  });
});

function loadLesson(num) {
  const lesson = lessons[num];
  if (!lesson) return;

  const container = document.getElementById('lesson-content');
  container.innerHTML = `
    <h1>${lesson.title}</h1>
    <p class="lesson-desc">${lesson.desc}</p>
    ${lesson.content}
    <div class="nav-lessons">
      ${num > 1 ? `<button class="btn btn-secondary" onclick="goLesson(${num - 1})">→ درس قبلی</button>` : '<span></span>'}
      ${num < 10 ? `<button class="btn btn-primary" onclick="goLesson(${num + 1})">درس بعدی ←</button>` : '<span></span>'}
    </div>
  `;

  // اسکرول به بالا
  container.scrollTop = 0;
  window.scrollTo(0, 0);
}

function goLesson(num) {
  document.querySelectorAll('.lesson-item').forEach(b => {
    b.classList.toggle('active', b.dataset.lesson == num);
  });
  loadLesson(num);
}

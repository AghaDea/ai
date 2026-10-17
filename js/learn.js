// ============================================
// سیستم یادگیری کامل - دو مسیر جدا
// ============================================

const visualLessons = [
  {
    id: 1,
    title: "۱. مقدمه و ساختار HTML",
    content: `
      <p>HTML زبان ساختار صفحه وب است. مثل اسکلت بدن. هر چیزی که در صفحه می‌بینی، با تگ‌های HTML ساخته شده.</p>
      
      <h2>ساختار پایه هر صفحه</h2>
      <div class="code-block">&lt;!DOCTYPE html&gt;
&lt;html lang="fa" dir="rtl"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;عنوان صفحه&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  محتوا اینجا می‌آد
&lt;/body&gt;
&lt;/html&gt;</div>

      <h2>توضیح قسمت‌ها</h2>
      <ul>
        <li><code>&lt;!DOCTYPE html&gt;</code> → به مرورگر می‌گوید این HTML5 است.</li>
        <li><code>lang="fa"</code> و <code>dir="rtl"</code> → برای فارسی و راست‌چین ضروری است.</li>
        <li><code>&lt;head&gt;</code> → اطلاعات صفحه (کاربر نمی‌بیند).</li>
        <li><code>&lt;body&gt;</code> → هر چیزی که کاربر می‌بیند.</li>
      </ul>

      <div class="try-box">
        <h4>تمرین</h4>
        <p>یک پروژه جدید بساز و این ساختار را داخل index.html بنویس. عنوان صفحه را عوض کن و نتیجه را در تب مرورگر ببین.</p>
      </div>
    `
  },
  {
    id: 2,
    title: "۲. تگ‌های متنی",
    content: `
      <h2>عنوان‌ها</h2>
      <p>از <code>h1</code> تا <code>h6</code>. h1 بزرگ‌ترین است.</p>
      <div class="code-block">&lt;h1&gt;عنوان اصلی&lt;/h1&gt;
&lt;h2&gt;عنوان بخش&lt;/h2&gt;
&lt;h3&gt;عنوان فرعی&lt;/h3&gt;</div>

      <h2>پاراگراف و تاکید</h2>
      <div class="code-block">&lt;p&gt;این یک پاراگراف است.&lt;/p&gt;
&lt;p&gt;متن &lt;strong&gt;پررنگ&lt;/strong&gt; و متن &lt;em&gt;کج&lt;/em&gt;.&lt;/p&gt;
&lt;br&gt;  &lt;!-- خط جدید --&gt;
&lt;hr&gt;  &lt;!-- خط افقی --&gt;</div>

      <div class="tip-box">💡 فقط یک <code>h1</code> در هر صفحه داشته باش. برای سئو بهتر است.</div>
    `
  },
  {
    id: 3,
    title: "۳. لینک و تصویر",
    content: `
      <h2>لینک</h2>
      <div class="code-block">&lt;a href="https://google.com"&gt;برو به گوگل&lt;/a&gt;
&lt;a href="about.html"&gt;صفحه درباره ما&lt;/a&gt;
&lt;a href="https://google.com" target="_blank"&gt;تب جدید&lt;/a&gt;</div>

      <h2>تصویر</h2>
      <div class="code-block">&lt;img src="photo.jpg" alt="توضیح عکس"&gt;
&lt;img src="https://via.placeholder.com/300" alt="نمونه" width="300"&gt;</div>

      <div class="tip-box">💡 همیشه برای تصویر <code>alt</code> بنویس. هم برای سئو خوب است هم برای نابینایان.</div>
    `
  },
  {
    id: 4,
    title: "۴. لیست‌ها",
    content: `
      <h2>لیست نقطه‌ای</h2>
      <div class="code-block">&lt;ul&gt;
  &lt;li&gt;آیتم ۱&lt;/li&gt;
  &lt;li&gt;آیتم ۲&lt;/li&gt;
&lt;/ul&gt;</div>

      <h2>لیست شماره‌دار</h2>
      <div class="code-block">&lt;ol&gt;
  &lt;li&gt;قدم اول&lt;/li&gt;
  &lt;li&gt;قدم دوم&lt;/li&gt;
&lt;/ol&gt;</div>

      <h2>لیست تو در تو</h2>
      <div class="code-block">&lt;ul&gt;
  &lt;li&gt;میوه‌ها
    &lt;ul&gt;
      &lt;li&gt;سیب&lt;/li&gt;
      &lt;li&gt;پرتقال&lt;/li&gt;
    &lt;/ul&gt;
  &lt;/li&gt;
&lt;/ul&gt;</div>
    `
  },
  {
    id: 5,
    title: "۵. تگ‌های معنایی",
    content: `
      <p>به جای <code>div</code> های بی‌معنی، از تگ‌های معنایی استفاده کن:</p>
      <ul>
        <li><code>&lt;header&gt;</code> → سرصفحه</li>
        <li><code>&lt;nav&gt;</code> → منو</li>
        <li><code>&lt;main&gt;</code> → محتوای اصلی</li>
        <li><code>&lt;section&gt;</code> → بخش</li>
        <li><code>&lt;article&gt;</code> → مطلب مستقل</li>
        <li><code>&lt;aside&gt;</code> → سایدبار</li>
        <li><code>&lt;footer&gt;</code> → پاورقی</li>
      </ul>

      <div class="code-block">&lt;header&gt;
  &lt;h1&gt;اسم سایت&lt;/h1&gt;
  &lt;nav&gt;...&lt;/nav&gt;
&lt;/header&gt;
&lt;main&gt;
  &lt;section&gt;...&lt;/section&gt;
&lt;/main&gt;
&lt;footer&gt;...&lt;/footer&gt;</div>
    `
  },
  {
    id: 6,
    title: "۶. جدول و فرم",
    content: `
      <h2>جدول</h2>
      <div class="code-block">&lt;table&gt;
  &lt;thead&gt;
    &lt;tr&gt;&lt;th&gt;نام&lt;/th&gt;&lt;th&gt;سن&lt;/th&gt;&lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;&lt;td&gt;علی&lt;/td&gt;&lt;td&gt;۲۵&lt;/td&gt;&lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</div>

      <h2>فرم ساده</h2>
      <div class="code-block">&lt;form&gt;
  &lt;label for="name"&gt;نام:&lt;/label&gt;
  &lt;input type="text" id="name" placeholder="اسمت"&gt;
  &lt;input type="email" placeholder="ایمیل"&gt;
  &lt;textarea rows="3"&gt;&lt;/textarea&gt;
  &lt;button type="submit"&gt;ارسال&lt;/button&gt;
&lt;/form&gt;</div>
    `
  },
  {
    id: 7,
    title: "۷. مقدمه CSS",
    content: `
      <p>CSS ظاهر صفحه را کنترل می‌کند. سه روش اضافه کردن دارد:</p>

      <h2>۱. اینلاین (کمتر استفاده کن)</h2>
      <div class="code-block">&lt;p style="color:red"&gt;متن&lt;/p&gt;</div>

      <h2>۲. داخلی</h2>
      <div class="code-block">&lt;style&gt;
  p { color: blue; }
&lt;/style&gt;</div>

      <h2>۳. خارجی (بهترین روش)</h2>
      <div class="code-block">&lt;link rel="stylesheet" href="style.css"&gt;</div>

      <div class="tip-box">💡 در HTML Studio وقتی فایل CSS می‌سازی، خودش به پیش‌نمایش وصل می‌شود.</div>
    `
  },
  {
    id: 8,
    title: "۸. رنگ، فونت، فاصله",
    content: `
      <div class="code-block">body {
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
}</div>

      <h2>ویژگی‌های پرکاربرد</h2>
      <ul>
        <li><code>color</code> / <code>background-color</code></li>
        <li><code>font-size</code> / <code>font-family</code> / <code>font-weight</code></li>
        <li><code>margin</code> (بیرونی) / <code>padding</code> (درونی)</li>
        <li><code>border</code> / <code>border-radius</code></li>
        <li><code>width</code> / <code>height</code> / <code>max-width</code></li>
      </ul>
    `
  },
  {
    id: 9,
    title: "۹. Flexbox",
    content: `
      <p>Flexbox قوی‌ترین ابزار چیدمان در CSS است.</p>
      <div class="code-block">.container {
  display: flex;
  justify-content: center;   /* افقی */
  align-items: center;       /* عمودی */
  gap: 16px;
  flex-wrap: wrap;
}

.item {
  padding: 20px;
  background: #3b82f6;
  border-radius: 8px;
}</div>

      <h2>justify-content</h2>
      <ul>
        <li><code>flex-start</code> / <code>center</code> / <code>flex-end</code></li>
        <li><code>space-between</code> / <code>space-around</code></li>
      </ul>

      <div class="try-box">
        <h4>تمرین</h4>
        <p>یک هدر بساز که لوگو راست و منو چپ باشد (با space-between).</p>
      </div>
    `
  },
  {
    id: 10,
    title: "۱۰. Grid و ریسپانسیو",
    content: `
      <h2>CSS Grid</h2>
      <div class="code-block">.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}</div>

      <h2>ریسپانسیو با Media Query</h2>
      <div class="code-block">/* موبایل اول */
.container { flex-direction: column; }

@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}</div>

      <div class="tip-box">🎉 تبریک! پایه‌های ظاهر را کامل یاد گرفتی. حالا برو پروژه واقعی بساز.</div>
    `
  },
  {
    id: 11,
    title: "۱۱. انیمیشن و Transition",
    content: `
      <h2>Transition (تغییر نرم)</h2>
      <div class="code-block">.btn {
  background: #3b82f6;
  transition: background 0.3s ease, transform 0.2s;
}
.btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}</div>

      <h2>Animation</h2>
      <div class="code-block">@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.5s ease forwards;
}</div>
    `
  },
  {
    id: 12,
    title: "۱۲. پروژه نهایی ظاهر",
    content: `
      <p>حالا همه چیز را با هم ترکیب کن و یک صفحه کامل بساز:</p>
      <ul>
        <li>هدر با لوگو و منو (Flexbox)</li>
        <li>بخش معرفی با عنوان و دکمه</li>
        <li>سه کارت ویژگی (Grid یا Flex)</li>
        <li>فرم تماس</li>
        <li>فوتر</li>
      </ul>

      <div class="try-box">
        <h4>چالش</h4>
        <p>صفحه را طوری بساز که در موبایل هم خوب به نظر برسد. از media query استفاده کن.</p>
      </div>

      <div class="tip-box">💡 بعد از اتمام این مسیر، برو سراغ مسیر اسکریپت تا صفحه‌ات تعاملی شود.</div>
    `
  }
];

const scriptLessons = [
  {
    id: 1,
    title: "۱. مقدمه JavaScript",
    content: `
      <p>JavaScript زبان برنامه‌نویسی وب است. با آن می‌توانی صفحه را تعاملی کنی.</p>

      <h2>اضافه کردن به صفحه</h2>
      <div class="code-block">&lt;script src="script.js"&gt;&lt;/script&gt;

&lt;!-- یا داخلی --&gt;
&lt;script&gt;
  console.log("سلام دنیا");
&lt;/script&gt;</div>

      <h2>اولین کد</h2>
      <div class="code-block">console.log("سلام از JavaScript");
alert("این یک پیام است");</div>

      <div class="tip-box">💡 برای دیدن console.log کلید F12 را بزن و به تب Console برو.</div>
    `
  },
  {
    id: 2,
    title: "۲. متغیرها و انواع داده",
    content: `
      <div class="code-block">let name = "علی";          // قابل تغییر
const age = 25;            // ثابت
var old = "قدیمی";         // کمتر استفاده کن

let isActive = true;       // بولین
let score = 100;           // عدد
let list = [1, 2, 3];      // آرایه
let user = { name: "سارا", age: 22 }; // آبجکت
let nothing = null;
let notDefined = undefined;</div>

      <div class="warn-box">⚠️ از <code>var</code> کمتر استفاده کن. <code>let</code> و <code>const</code> بهتر هستند.</div>
    `
  },
  {
    id: 3,
    title: "۳. عملگرها و شرط‌ها",
    content: `
      <h2>عملگرها</h2>
      <div class="code-block">let a = 10 + 5;    // 15
let b = 10 > 5;    // true
let c = 10 === "10"; // false (سخت‌گیر)
let d = 10 == "10";  // true  (شل)</div>

      <h2>شرط</h2>
      <div class="code-block">if (age >= 18) {
  console.log("بزرگسال");
} else if (age >= 13) {
  console.log("نوجوان");
} else {
  console.log("کودک");
}

// حالت کوتاه
let status = age >= 18 ? "بزرگسال" : "نوجوان";</div>
    `
  },
  {
    id: 4,
    title: "۴. حلقه‌ها و توابع",
    content: `
      <h2>حلقه</h2>
      <div class="code-block">for (let i = 0; i < 5; i++) {
  console.log(i);
}

let fruits = ["سیب", "موز", "پرتقال"];
fruits.forEach(fruit => console.log(fruit));</div>

      <h2>تابع</h2>
      <div class="code-block">function greet(name) {
  return "سلام " + name;
}

// Arrow function
const add = (a, b) => a + b;

console.log(greet("علی"));
console.log(add(3, 7));</div>
    `
  },
  {
    id: 5,
    title: "۵. کار با DOM",
    content: `
      <p>DOM یعنی ساختار صفحه که JavaScript می‌تواند آن را تغییر دهد.</p>

      <div class="code-block">// پیدا کردن المان
const title = document.querySelector("h1");
const btn = document.getElementById("myBtn");
const items = document.querySelectorAll(".item");

// تغییر محتوا
title.textContent = "عنوان جدید";
title.innerHTML = "عنوان &lt;strong&gt;پررنگ&lt;/strong&gt;";

// تغییر استایل
title.style.color = "red";
title.classList.add("active");
title.classList.toggle("hidden");</div>
    `
  },
  {
    id: 6,
    title: "۶. رویدادها (Events)",
    content: `
      <div class="code-block">const btn = document.querySelector("#myBtn");

btn.addEventListener("click", function() {
  alert("کلیک شد!");
});

// یا با arrow
btn.addEventListener("click", () => {
  console.log("کلیک");
});

// رویدادهای پرکاربرد:
// click, input, change, submit, keydown, mouseover</div>

      <div class="try-box">
        <h4>تمرین</h4>
        <p>یک دکمه بساز که با هر کلیک رنگ پس‌زمینه صفحه را عوض کند.</p>
      </div>
    `
  },
  {
    id: 7,
    title: "۷. آرایه و متدهای کاربردی",
    content: `
      <div class="code-block">const numbers = [1, 2, 3, 4, 5];

numbers.push(6);           // اضافه به انتها
numbers.pop();             // حذف از انتها
numbers.map(n => n * 2);   // [2,4,6,8,10]
numbers.filter(n => n > 2); // [3,4,5]
numbers.find(n => n > 3);  // 4
numbers.includes(3);       // true
numbers.join(" - ");       // "1 - 2 - 3 - 4 - 5"</div>
    `
  },
  {
    id: 8,
    title: "۸. آبجکت و JSON",
    content: `
      <div class="code-block">const user = {
  name: "علی",
  age: 25,
  skills: ["HTML", "CSS", "JS"],
  greet() {
    return "سلام من " + this.name + " هستم";
  }
};

console.log(user.name);
console.log(user.greet());

// تبدیل به JSON
const json = JSON.stringify(user);
const parsed = JSON.parse(json);</div>
    `
  },
  {
    id: 9,
    title: "۹. Async و Fetch",
    content: `
      <p>برای گرفتن داده از سرور از fetch استفاده می‌کنیم.</p>

      <div class="code-block">async function getData() {
  try {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("خطا:", error);
  }
}

getData();</div>

      <div class="tip-box">💡 <code>async/await</code> خوانایی کد را خیلی بهتر می‌کند نسبت به .then().</div>
    `
  },
  {
    id: 10,
    title: "۱۰. پروژه تعاملی",
    content: `
      <p>یک To-Do List ساده بساز:</p>

      <div class="code-block">// HTML
&lt;input id="taskInput" placeholder="کار جدید"&gt;
&lt;button id="addBtn"&gt;اضافه&lt;/button&gt;
&lt;ul id="taskList"&gt;&lt;/ul&gt;

// JavaScript
const input = document.getElementById("taskInput");
const btn = document.getElementById("addBtn");
const list = document.getElementById("taskList");

btn.addEventListener("click", () => {
  if (!input.value.trim()) return;
  
  const li = document.createElement("li");
  li.textContent = input.value;
  list.appendChild(li);
  input.value = "";
});</div>

      <div class="try-box">
        <h4>چالش نهایی</h4>
        <p>به To-Do قابلیت حذف هر آیتم و ذخیره در localStorage را اضافه کن.</p>
      </div>

      <div class="tip-box">🎉 مسیر اسکریپت تمام شد! حالا می‌توانی صفحات تعاملی واقعی بسازی.</div>
    `
  }
];

// ========== منطق صفحه ==========

let currentTrack = null; // 'visual' | 'script'
let currentLessons = [];

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  
  document.getElementById('logout-btn')?.addEventListener('click', () => signOut());
  
  document.getElementById('track-visual')?.addEventListener('click', () => startTrack('visual'));
  document.getElementById('track-script')?.addEventListener('click', () => startTrack('script'));
  document.getElementById('back-to-tracks')?.addEventListener('click', showTrackSelector);
});

function startTrack(track) {
  currentTrack = track;
  currentLessons = track === 'visual' ? visualLessons : scriptLessons;
  
  document.getElementById('track-selector').classList.add('hidden');
  document.getElementById('learn-layout').classList.remove('hidden');
  
  document.getElementById('current-track-title').textContent = 
    track === 'visual' ? '🎨 مسیر ظاهر' : '⚡ مسیر اسکریپت';
  
  renderNav();
  loadLesson(0);
}

function showTrackSelector() {
  document.getElementById('track-selector').classList.remove('hidden');
  document.getElementById('learn-layout').classList.add('hidden');
  currentTrack = null;
}

function renderNav() {
  const nav = document.getElementById('lesson-nav');
  nav.innerHTML = currentLessons.map((lesson, index) => `
    <button class="lesson-item ${index === 0 ? 'active' : ''}" data-index="${index}">
      ${lesson.title}
    </button>
  `).join('');
  
  nav.querySelectorAll('.lesson-item').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.lesson-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadLesson(Number(btn.dataset.index));
    });
  });
}

function loadLesson(index) {
  const lesson = currentLessons[index];
  if (!lesson) return;
  
  const container = document.getElementById('lesson-content');
  container.innerHTML = `
    <h1>${lesson.title}</h1>
    ${lesson.content}
    <div class="nav-lessons">
      ${index > 0 
        ? `<button class="btn btn-secondary" onclick="goLesson(${index - 1})">→ درس قبلی</button>` 
        : '<span></span>'}
      ${index < currentLessons.length - 1 
        ? `<button class="btn btn-primary" onclick="goLesson(${index + 1})">درس بعدی ←</button>` 
        : '<span></span>'}
    </div>
  `;
  
  container.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goLesson(index) {
  const nav = document.getElementById('lesson-nav');
  nav.querySelectorAll('.lesson-item').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.index) === index);
  });
  loadLesson(index);
}

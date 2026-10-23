# 🎬 Flask Video Speech-to-Text + Translation

پروژه کامل Flask برای آپلود ویدیو/صوت، تشخیص گفتار با **Whisper محلی** و ترجمه زنده متن.

## ویژگی‌ها

- آپلود ویدیو و صوت (mp4, mkv, mp3, wav و ...)
- تشخیص گفتار با **faster-whisper** (کاملاً محلی و آفلاین بعد از دانلود مدل)
- امکان ترجمه مستقیم به انگلیسی توسط خود Whisper (آفلاین)
- ترجمه به فارسی (اختیاری و آنلاین — اگر اینترنت نباشد فقط متن اصلی نشان داده می‌شود)
- نمایش **پیش‌رونده** متن‌ها (SSE)
- مدل در پوشه `model/` ذخیره می‌شود → بعد از دانلود اول کاملاً آفلاین
- مناسب برای **Termux** (با مدل `tiny`)

---

## ۱. اجرا روی کامپیوتر (لینوکس / ویندوز / مک)

### پیش‌نیاز
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### نصب و اجرا
```bash
cd flask_video_translator
python -m venv venv
source venv/bin/activate          # ویندوز: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
بعد برو به: `http://127.0.0.1:5000`

---

## ۲. اجرا روی Termux (اندروید) — کاملاً آفلاین بعد از دانلود

### مرحله ۱: نصب پکیج‌های پایه
```bash
pkg update -y && pkg upgrade -y
pkg install -y python ffmpeg git clang make cmake libopenblas
termux-setup-storage
```

### مرحله ۲: کپی پروژه
پروژه را داخل حافظه گوشی بگذار (مثلاً در `Download/flask_video_translator`) و بعد:
```bash
cd ~/storage/downloads/flask_video_translator
# یا هر مسیری که پروژه را گذاشتی
```

### مرحله ۳: نصب وابستگی‌ها
```bash
pip install --upgrade pip
pip install flask faster-whisper deep-translator
```

> **نکته مهم درباره faster-whisper در Termux:**  
> گاهی `ctranslate2` به‌صورت مستقیم نصب نمی‌شود.  
> اگر خطا گرفتی، یکی از این دو راه را امتحان کن:

**راه آسان‌تر (پیشنهادی):**
```bash
# نصب از طریق proot-distro (اوبونتو داخل Termux)
pkg install proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
# داخل اوبونتو:
apt update && apt install -y python3 python3-pip ffmpeg
pip3 install flask faster-whisper deep-translator
```

**یا بیلد دستی ctranslate2** (پیشرفته — حدود ۲۰–۴۰ دقیقه طول می‌کشد).

### مرحله ۴: مدل کوچک برای گوشی
در فایل `app.py` مطمئن شو این تنظیمات هست (الان پیش‌فرض همین است):

```python
MODEL_SIZE = "tiny"     # روی گوشی حتماً tiny بگذار
DEVICE = "cpu"
COMPUTE_TYPE = "int8"
```

### مرحله ۵: اجرا
```bash
python app.py
```

بعد در مرورگر گوشی برو به:
```
http://127.0.0.1:5000
```
یا با دستور زیر لینک را باز کن:
```bash
termux-open-url http://127.0.0.1:5000
```

### اولین اجرا در Termux
- اینترنت لازم است تا مدل `tiny` (حدود ۷۵ مگابایت) داخل پوشه `model/` دانلود شود.
- بعد از دانلود، **حتی بدون اینترنت** کار می‌کند (تشخیص گفتار + ترجمه به انگلیسی).
- ترجمه به فارسی فقط وقتی اینترنت باشد کار می‌کند.

---

## تغییر اندازه مدل

| مدل     | حجم تقریبی | مناسب برای          | دقت   |
|---------|------------|----------------------|----------|
| **tiny**    | ~۷۵ MB     | **Termux / موبایل**  | متوسط   |
| base    | ~۱۴۰ MB    | گوشی قوی / کامپیوتر  | خوب      |
| small   | ~۴۶۰ MB    | کامپیوتر             | خیلی خوب |
| medium  | ~۱.۵ GB    | کامپیوتر قوی         | عالی     |

در `app.py` این خط را عوض کن:
```python
MODEL_SIZE = "tiny"
```

---

## ساختار پروژه

```
flask_video_translator/
├── app.py
├── requirements.txt
├── README.md
├── model/          ← مدل اینجا ذخیره می‌شود (آفلاین)
├── uploads/
└── templates/
    └── index.html
```

---

## نکات مهم برای آفلاین بودن

| قابلیت                          | آفلاین؟ | توضیح |
|--------------------------------|---------|-------|
| تشخیص گفتار (زبان اصلی)         | ✅ بله  | با مدل محلی |
| ترجمه مستقیم به انگلیسی (Whisper) | ✅ بله  | task=translate |
| ترجمه به فارسی / زبان‌های دیگر  | ❌ خیر  | نیاز به اینترنت (Google) |

اگر بخوای ترجمه هم کاملاً آفلاین باشه، باید مدل ترجمه محلی (مثل Helsinki-NLP یا NLLB) اضافه کنیم که روی گوشی خیلی سنگین می‌شه.

---

## عیب‌یابی Termux

**خطای حافظه (OOM):**  
مدل را روی `tiny` بگذار و فایل‌های خیلی طولانی نده.

**ffmpeg پیدا نشد:**  
```bash
pkg install ffmpeg
```

**پورت ۵۰۰۰ اشغال است:**  
در `app.py` پورت را عوض کن:
```python
app.run(host="0.0.0.0", port=8080, debug=False, threaded=True)
```

**می‌خوای از بیرون شبکه محلی دسترسی داشته باشی:**  
```python
app.run(host="0.0.0.0", port=5000, ...)
```
بعد IP گوشی را در مرورگر لپ‌تاپ بزن.

---

موفق باشی! 🚀  
اگر موقع نصب روی Termux به مشکل خوردی، متن خطا را بفرست تا دقیق راهنمایی کنم.

# PRD template

This is the team's PRD structure, taken from the reference PRD ("بکاپ خودکار زمان‌بندی‌شده سرورهای ابری ایران‌سرور"). Use these sections, headings and table columns exactly, in this order. Do not add sections or subsections that are not here.

Text in Persian is output. Notes in English (after "Note:" or in `{}`) are guidance and must not appear in the document. Subsections marked "(if relevant)" are left out when the feature has nothing for them; every other part is always present.

---

# {عنوان محصول یا قابلیت}

**نگاه کلی**

| | |
|---|---|
| نسخه سند | 0.1.0 |
| وضعیت داکیومنت | پیش‌نویس |
| مالک | [تکمیل شود] |
| طراح | [تکمیل شود] |
| تیم توسعه | [تکمیل شود] |
| تضمین کیفیت | [تکمیل شود] |
| ذی نفعان سند | [تکمیل شود] |
| تاریخ تایید و انتشار | |
| مستندات تکمیلی | {related docs, or empty} |

{Optional short paragraph: what this version is based on, and what is deliberately left for later versions.}

**نکته مهم: لطفا هر موردی که در این سند در نظر گرفته نشده است و ابهام دارد را خواهشمند است در قالب کامنت اعلام بفرمایید تا در سند اعمال شود. همچنین در صورت عدم اعلام به معنای موافقت با سند در نظر گرفته میشود.**

- نگاه کلی
- 1. خلاصه مدیریتی (TLDR)
- 2. تعریف مشکل و مسئله
- 3. تعریف موفقیت
- 4. بخش بازار (Market Segment)
- 5. راه‌حل (Solution)
- 6. محدودیت های فنی
- ۷. تحلیل رفتار رقبای داخلی و خارجی در نحوه پلن‌بندی محصول
- ۸. پرسش‌های متداول فنی و محصولی
- 9. وایرفریم

## -----1. خلاصه مدیریتی (TLDR)

{What we offer, to whom, and the main rules, in a few short paragraphs. If the document has independent concepts, name them as bold-lead bullets. If pricing is in scope, put the formula in bold on its own line, then the key billing and cancellation rules as bullets.}

## -----2. تعریف مشکل و مسئله

### 2.1 پیش‌زمینه

{How it works today and why it is not enough. Competitor patterns in a short bullet list if they shaped the decision.}

### 2.2 مشکل یا مسئله

{Bullets, one problem each.}

## -----3. تعریف موفقیت

### هدف اصلی

{One paragraph: what the customer can do when this is done.}

### ارزش برای کسب‌وکار و مشتری

- **برای مشتری:**
- **برای کسب‌وکار:**
- **برای عملیات:**

### نتایج کلیدی (Key Results)

| # | نتیجه کلیدی | خط مبنا | هدف اولیه | توضیح |
|---|---|---|---|---|
| KR1 | | | | |

Note: use "فاقد خط مبنا" when there is no baseline; never invent one.

### شاخص‌های تکمیلی

{Bullets.}

### موارد خارج از محدوده

{Bullets, each with one line of why or when.}

## -----4. بخش بازار (Market Segment)

### 4.1 پرسونای اصلی

{One paragraph.}

### 4.2 سگمنت های بازار بر اساس Job-to-be-Done

| زیرگروه | Job-to-be-Done | راه‌حل این فاز |
|---|---|---|

### 4.3 نقشه سفر مشتری

| مرحله | اقدام کاربر | سؤال یا نگرانی | پاسخ محصول |
|---|---|---|---|

## -----5. راه‌حل (Solution)

### 5.1 تجربه کاربری و مسیر کاربر (UX / Flows)

#### مرحله ۱ — {عنوان مرحله}

{Bullets. Repeat one "مرحله N" per step of the flow. Use small tables inside a step when there are options to compare.}

### 5.2 ویژگی‌های کلیدی و نیازمندی‌ها

| شناسه | نیازمندی | اولویت |
|---|---|---|
| FR-01 | | Must |

Note: priorities are Must, Should, Could.

### 5.3 قواعد مالی و درآمدی (if relevant)

#### 5.3.1 {عنوان قاعده یا فرمول}

**{فرمول}**

{قواعد as bullets. One 5.3.x per billing model or priced item.}

### 5.4 قواعد نگه‌داری و چرخه عمر (if relevant)

| موضوع | سیاست فاز اول |
|---|---|

### 5.5 وضعیت‌ها، خطاها و حالت‌های لبه

| وضعیت | معنی |
|---|---|

قواعد خطا:

{Bullets: idempotency, blocked actions, validation failures, what the API rejects.}

### 5.6 محتوا و اعلان‌های ضروری UI

**{عنوان پیام}**

{Exact Persian copy the customer sees, with placeholders like {deadline}.}

## -----6. محدودیت های فنی

### 6.1 دامنه فنی و وابستگی‌ها

{Bullets: technical scope, platform constraints, and the systems this depends on.}

## -----۷. تحلیل رفتار رقبای داخلی و خارجی در نحوه پلن‌بندی محصول

| رقیب | الگوی اصلی | تصمیم ایران‌سرور |
|---|---|---|

دلایل تصمیم:

- 

{If there is a fuller competitor file: "جزئیات کامل رقبا در فایل پیوست موجود است." with the link.}

## -----۸. پرسش‌های متداول فنی و محصولی

### {سؤال}؟

{پاسخ کوتاه}

### مستندات فنی مرجع

- {links}

## -----9. وایرفریم

{Link or attachment, or "[وایرفریم‌ها توسط طراح تهیه و پیوست شود.]"}

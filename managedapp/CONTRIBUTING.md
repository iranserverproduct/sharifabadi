# راهنمای افزودن یا به‌روزرسانی برنامه

هر برنامه یا هر به‌روزرسانی برنامه با **یک pull request** به شاخه `main` وارد می‌شود. مستقیم روی `main` push نکنید.

## ۱. ساخت شاخه و پوشه

```bash
git checkout main && git pull
git checkout -b managedapp/<app-slug>
cd managedapp
mkdir -p apps/<app-slug>/research
cp templates/01-market-validation-brief.md apps/<app-slug>/
```

- `app-slug` با حروف کوچک انگلیسی و خط تیره باشد، مثل `ai-gateway` یا `error-tracking`.
- برای به‌روزرسانی برنامه موجود، شاخه را `managedapp/<app-slug>-<topic>` بنامید.
- همه مسیرهای این راهنما نسبت به پوشه `managedapp/` هستند.

## ۲. تکمیل سندها به ترتیب

| مرحله | فایل | اسکیل | دروازه |
|---|---|---|---|
| ۱ | `01-market-validation-brief.md` | `managedapp-market-validation` | Gate A: Product و Marketing وضعیت را Approved یا Rejected می‌کنند |
| ۲ | `02-devops-technical-spec.md` | `managedapp-devops-spec` | Gate B: DevOps بعد از تست در staging وضعیت را Approved می‌کند |
| ۳ | `03-landing-page-content-brief.md` | `managedapp-landing-content` | Gate C: Marketing، Product و Legal تأیید می‌کنند |

- فایل بعدی را فقط بعد از تأیید فایل قبلی از `templates/` کپی کنید. چک `validate` این ترتیب را بررسی می‌کند.
- بعد از سند بازار، pull request را به‌صورت **Draft** باز کنید تا بازبین‌ها از ابتدا در جریان باشند.
- داده‌های خام تحقیق (خروجی Apify، فایل‌های upstream) را در `apps/<app-slug>/research/` بگذارید.

## ۳. قواعد نگارش

- همه‌ی اسناد داخل پوشه‌ی هر برنامه (`apps/<app-slug>/`، از جمله `research/`) کامل فارسی نوشته می‌شوند: عنوان بخش‌ها، سرستون و برچسب جدول‌ها و متن. فقط نام نرم‌افزار، متغیرها، دستورها، کد، مسیر فایل، URL و فیلد `Status` با مقدارهایش (Draft، In review، Approved، Rejected) انگلیسی می‌مانند، چون چک `validate` آن‌ها را می‌خواند. برچسب‌ها: تأییدشده (Verified)، فرضی (Assumed)، نامشخص (Unknown)، تخمینی (Estimate).
- الگوها (`templates/`) و اسکیل‌ها (`.claude/skills/`) انگلیسی می‌مانند تا مدل‌های هوش مصنوعی از آن‌ها استفاده کنند؛ هنگام کپی الگو، عنوان‌ها را فارسی کنید.
- هر عدد منبع و تاریخ دارد؛ تخمین‌ها با برچسب Estimate و سطح اطمینان مشخص می‌شوند.
- قبل از Approved شدن یک سند، همه بلوک‌های `> **Guidance.**` و جاهای خالی `[...]` حذف می‌شوند.
- وضعیت (`Status`) را فقط بازبین مسئول آن دروازه Approved می‌کند.

## ۴. ادغام

- ردیف برنامه را در `apps/README.md` اضافه یا به‌روز کنید.
- متن [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) را در توضیح pull request بگذارید و چک‌لیست آن را کامل کنید.
- وقتی چک `validate` سبز است و بازبین‌ها تأیید کرده‌اند، pull request ادغام می‌شود.
- اگر تصمیم No-go باشد، فقط سند بازار با وضعیت Rejected ادغام می‌شود تا تصمیم ثبت بماند.

## ۵. تغییر الگوها یا اسکیل‌ها

تغییر در `templates/` یا `.claude/skills/` هم با یک pull request جدا (شاخه `managedapp/templates-<topic>`) انجام می‌شود. در توضیح pull request بنویسید چه چیزی تغییر کرد و چرا، و اگر سندهای برنامه‌های قبلی باید به‌روز شوند، آن‌ها را نام ببرید.

## بررسی محلی

```bash
python3 managedapp/scripts/validate_apps.py
```

همین چک در GitHub Actions روی هر pull request که پوشه `managedapp/` را تغییر دهد اجرا می‌شود (`.github/workflows/managedapp-validate.yml` در ریشه مخزن).

# managedapp

الگوها، اسکیل‌ها و سندهای برنامه‌های آماده (Managed Apps) ایران‌سرور.

هر برنامه آماده قبل از عرضه سه سند دارد که به ترتیب نوشته و تأیید می‌شوند:

| سند | هدف | مالک |
|---|---|---|
| [01 Market Validation Brief](templates/01-market-validation-brief.md) | آیا این دسته برنامه ارزش عرضه دارد و کدام نرم‌افزار انتخاب شود | Product و Marketing |
| [02 DevOps Technical Specification](templates/02-devops-technical-spec.md) | هرچه DevOps برای بسته‌بندی و اجرای نرم‌افزار روی Kubernetes و ArgoCD لازم دارد | Product با DevOps |
| [03 Landing Page Content Brief](templates/03-landing-page-content-brief.md) | محتوای صفحه فرود از روی داده‌های تأییدشده | Marketing و Content |

شناسنامه‌ی محصول برنامه‌های آماده (پلن‌ها، پرسوناها، رقبا، فلوها و راهنمای کاربر و ادمین): [PRODUCT_PROFILE.md](PRODUCT_PROFILE.md)

راهنمای کامل فرایند، دروازه‌ها و قراردادها: [templates/00-how-to-use.md](templates/00-how-to-use.md)

## ساختار پوشه

این پوشه بخشی از مخزن `iranserverproduct/sharifabadi` است و همه مسیرهای زیر نسبت به `managedapp/` هستند.

```text
templates/            الگوهای خالی سه سند و راهنمای استفاده
.claude/skills/       اسکیل‌ها برای تکمیل سندها با هوش مصنوعی
apps/<app-slug>/      سندهای هر برنامه و داده‌های خام تحقیق آن
apps/README.md        فهرست برنامه‌ها و وضعیت سندها
scripts/              چک خودکار سندها (در pull request اجرا می‌شود)
PRODUCT_PROFILE.md    شناسنامه‌ی محصول برنامه‌های آماده
PULL_REQUEST_TEMPLATE.md  متن پیشنهادی توضیح pull request
```

## اسکیل‌ها

| اسکیل | کار |
|---|---|
| [managedapp-new-app](.claude/skills/managedapp-new-app/SKILL.md) | کل فرایند برای یک برنامه، از شاخه تا pull request |
| [managedapp-market-validation](.claude/skills/managedapp-market-validation/SKILL.md) | تکمیل سند بازار با Apify، APIهای عمومی و اسکیل‌های تحلیل بازار |
| [managedapp-devops-spec](.claude/skills/managedapp-devops-spec/SKILL.md) | تکمیل سند فنی از روی فایل‌های upstream، با چک‌لیست مشکلات رایج |
| [managedapp-landing-content](.claude/skills/managedapp-landing-content/SKILL.md) | نوشتن محتوای فارسی لندینگ و چک ادعاها |

- **Claude Code:** وقتی Claude Code را در پوشه `managedapp/` باز کنید، این اسکیل‌ها خودکار در دسترس‌اند. برای شروع بگویید «یک برنامه جدید اضافه کن».
- **مدل‌های دیگر:** محتوای `SKILL.md` اسکیل مربوط را همراه با الگو به مدل بدهید.

## افزودن برنامه جدید

هر برنامه یا هر به‌روزرسانی با یک pull request به شاخه `main` مخزن وارد می‌شود. جزئیات در [CONTRIBUTING.md](CONTRIBUTING.md).

## نسخه Google Docs

نسخه اولیه الگوها در Google Docs هم هست، ولی از این به بعد مرجع اصلی همین مخزن است: [Iranserver Managed Apps – Document Templates](https://docs.google.com/document/d/1tlFR785ZYbL1Egy22JQgpy3HsgM4vnX_-2ohmRBwnE8/edit)

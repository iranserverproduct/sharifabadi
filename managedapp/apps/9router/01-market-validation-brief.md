# AI Gateway (9Router) - Market Validation Brief

Document details:

| Field | Value |
|---|---|
| App category | AI gateway (LLM router / LLM proxy) |
| Candidate software | 9Router برای پلن پایه؛ OmniRoute برای پلن حرفه‌ای و تیمی (آزمایشی) |
| Region | Foreign |
| Author | تیم Product ایران‌سرور |
| Reviewers | Product، Marketing |
| Date | 2026-11-04 |
| Status | Approved |
| Decision | Beta |
| Related documents | [02-devops-technical-spec.md](02-devops-technical-spec.md)؛ Landing Page Content Brief: بعد از Gate B |

## Executive summary

تصمیم پیشنهادی **Beta** است: یک Beta کم‌هزینه‌ی ۹۰ روزه فقط روی دیتاسنتر خارج، با 9Router برای پلن پایه. نیاز به دسترسی پایدار و ارزان به مدل‌های کدنویسی در ایران قوی است، ولی تقاضای پولی برای نسخه‌ی میزبانی‌شده کوچک است، چون هسته‌ی این ابزارها رایگان است و با یک دستور روی لپ‌تاپ نصب می‌شود. ارزش اصلی محصول به‌عنوان قیف جذب و فروش افزایشی به مشتریان VPS خارج و n8n است، نه به‌عنوان منبع درآمد مستقل. هزینه‌ی فنی ورود کم است (یک کانتینر و یک والیوم).

- **Decision:** Beta
- **Demand:** قوی برای نیاز. ویدیوهای فارسی «Claude Code رایگان» ۷۳ تا ۹۶ هزار بازدید دارند و سهم ایران در Google Trends برای 9router ۲۶٪ است، حدود ۱۳ برابر میانگین جهانی.
- **Willingness to pay for a managed version:** ضعیف ولی واقعی. قالب‌های یک‌کلیکی Railway برای 9Router با حدود ۵ دلار در ماه در مجموع حدود ۲۵۰ deploy دارند.
- **Recommended software:** 9Router برای پلن پایه (امتیاز ۸۶ از ۱۰۰)؛ OmniRoute (۷۴) برای پلن حرفه‌ای و تیمی آزمایشی.
- **Year-one obtainable market (SOM):** حدود ۶ تا ۱۸ هزار دلار در سال (Estimate، اطمینان کم).
- **Main risk:** وابستگی به تصمیم ارائه‌دهنده‌ها (بستن OAuth و تیرهای رایگان) و بار امنیتی upstream (۱۹ advisory منتشرشده برای 9Router در حدود ۵ ماه).
- **Next step:** بعد از تأیید این سند، سند فنی DevOps و اندازه‌گیری رم واقعی در staging؛ مالک: Product و DevOps؛ تاریخ: بعد از Gate A.

## Product definition

- **What it is:** گیت‌وی هوش مصنوعی یک سرویس واسط بین ابزارهای کاربر و ارائه‌دهنده‌های مدل‌های زبانی است. خودش مدل نیست و چیزی تولید نمی‌کند؛ درخواست را می‌گیرد، تصمیم می‌گیرد به کدام مدل و کدام حساب برود، به فرمت درست ترجمه می‌کند، می‌فرستد و پاسخ را برمی‌گرداند.
- **In plain terms:** مثل مودم‌روتر خانه. همه‌ی دستگاه‌ها به یک روتر وصل می‌شوند و روتر ترافیک را مدیریت می‌کند؛ اینجا همه‌ی ابزارهای AI به یک گیت‌وی وصل می‌شوند و گیت‌وی بین ده‌ها ارائه‌دهنده مسیریابی می‌کند.
- **How it works:**

```text
 ابزارهای کاربر                    گیت‌وی (سرور خارج ایران‌سرور)             ارائه‌دهنده‌های مدل
┌──────────────┐                 ┌──────────────────────────────┐        ┌────────────────────┐
│ Claude Code  │──┐              │  • احراز هویت با کلید API      │   ┌──▶│ اشتراک‌ها (OAuth)   │
│ Cursor/Cline │──┤              │  • انتخاب مدل و حساب           │   │   │ Claude/Codex/...   │
│ n8n / ایجنت  │──┼──▶ یک آدرس ──▶│  • ترجمه‌ی فرمت (OpenAI/Claude) │───┼──▶│ کلیدهای API         │
│ اپلیکیشن شما │──┘   /v1        │  • fallback و تعویض حساب       │   │   │ DeepSeek/GLM/...   │
└──────────────┘                 │  • ثبت مصرف و هزینه            │   └──▶│ تیرهای رایگان       │
                                 └──────────────────────────────┘        └────────────────────┘
```

- **What the managed version adds:** نصب با یک کلیک در پنل، دامنه و SSL، به‌روزرسانی امنیتی، بکاپ، منابع قابل‌افزایش، پشتیبانی فارسی، پرداخت ریالی، و اجرا روی دیتاسنتر خارج تا درخواست‌ها از IP غیرایرانی به ارائه‌دهنده‌ها بروند.

## End-user features

Features:

| Group | Feature | Value to the user | Risk or notes |
|---|---|---|---|
| اتصال یکپارچه | یک endpoint سازگار با OpenAI (و معمولاً Claude و Gemini) روی `/v1` | هر ابزاری که Base URL سفارشی بپذیرد وصل می‌شود؛ تنظیمات یک‌بار انجام می‌شود | – |
| اتصال یکپارچه | اتصال به ده‌ها ارائه‌دهنده با کلید API | DeepSeek، GLM، Kimi، OpenRouter، Groq و... همه در یک جا | – |
| اتصال یکپارچه | اتصال به اشتراک‌های شخصی (Claude Pro/Max، ChatGPT Plus، Copilot) با OAuth | از اشتراکی که خریده‌اید در ابزارهای دیگر هم استفاده کنید | با شرایط استفاده‌ی برخی ارائه‌دهنده‌ها مغایر است |
| اتصال یکپارچه | تیرهای رایگان | شروع بدون هزینه با مدل‌های رایگان | فهرست مدام عوض می‌شود؛ در تبلیغات وعده داده نشود |
| مسیریابی و پایداری | Fallback خودکار | وقتی سهمیه‌ی یک مدل تمام شد یا خطا داد، درخواست بی‌وقفه به مدل یا حساب بعدی می‌رود | – |
| مسیریابی و پایداری | Combo یا زنجیره‌ی مدل | مثلاً اول اشتراک، بعد API ارزان، بعد رایگان | – |
| مسیریابی و پایداری | چند حساب برای هر ارائه‌دهنده | پخش بار بین حساب‌ها | دور زدن محدودیت نرخ ممکن است با ToS ارائه‌دهنده مغایر باشد |
| مسیریابی و پایداری | ترجمه‌ی فرمت | ابزاری که فقط فرمت Claude را می‌فهمد می‌تواند از مدل OpenAI یا DeepSeek استفاده کند | – |
| هزینه و مصرف | داشبورد مصرف: توکن، درخواست، هزینه‌ی تخمینی، سهمیه‌ی باقی‌مانده | کاربر می‌داند پولش کجا می‌رود و کی سهمیه ریست می‌شود | – |
| هزینه و مصرف | فشرده‌سازی توکن (در برخی نرم‌افزارها) | ۲۰ تا ۴۰٪ صرفه‌جویی در توکن ورودی | ادعای سازندگان است و تأیید نشده |
| تیم و امنیت | کلید API جدا برای هر عضو تیم یا ابزار | لغو دسترسی یک نفر بدون عوض کردن کلید اصلی | – |
| تیم و امنیت | نگه‌داری کلیدهای اصلی فقط روی سرور | کلیدهای گران روی لپ‌تاپ اعضای تیم پخش نمی‌شود | – |
| تیم و امنیت | سقف مصرف و کاربر چندگانه (در برخی نرم‌افزارها) | کنترل هزینه‌ی تیم | – |
| دسترسی‌پذیری | اجرا روی سرور خارج و همیشه روشن | از هر دستگاه، بدون VPN روی دستگاه کاربر؛ مناسب ایجنت‌های ۲۴ ساعته | AUP دیتاسنتر خارجی بررسی شود |

## Target users and jobs to be done

Personas:

| Persona | Current situation | Main pain | Goal |
|---|---|---|---|
| برنامه‌نویس فریلنسر یا مستقل | از Claude Code، Cursor یا OpenCode با VPN و حساب‌های پراکنده استفاده می‌کند | سهمیه وسط کار تمام می‌شود؛ VPN قطع و وصل می‌شود؛ پرداخت ارزی سخت است | کدنویسی بی‌وقفه با کمترین هزینه |
| تیم نرم‌افزاری یا استارتاپ (۳ تا ۲۰ نفر) | هر نفر کلید و اشتراک خودش را دارد؛ هزینه نامعلوم است | کلیدها پخش شده‌اند؛ هزینه کنترل نمی‌شود؛ هر نفر تنظیمات جدا دارد | یک نقطه‌ی مرکزی با کلید جدا برای هر نفر و گزارش هزینه |
| سازنده‌ی ایجنت و اتوماسیون (n8n، OpenClaw، Hermes) | ایجنت روی سرور اجرا می‌شود و به مدل نیاز دارد | قطعی یک ارائه‌دهنده کل فرایند را می‌خواباند | backend پایدار و همیشه‌روشن با fallback |
| توسعه‌دهنده‌ی محصول AI (چت‌بات، اپ) | اپلیکیشنش به LLM وصل است | وابستگی به یک ارائه‌دهنده؛ تحریم؛ تغییر قیمت | جدا کردن اپ از ارائه‌دهنده و عوض کردن مدل بدون تغییر کد |

Jobs to be done:

- وقتی وسط کدنویسی سهمیه‌ی مدلم تمام می‌شود، می‌خواهم درخواست خودکار به مدل دیگری برود، تا کارم متوقف نشود.
- وقتی از ایران به ارائه‌دهنده‌های خارجی وصل می‌شوم، می‌خواهم دسترسی پایدار و بدون دردسر VPN داشته باشم، تا وقتم صرف دور زدن محدودیت نشود. گزارش Quera می‌گوید حدود ۱۰٪ زمان کاری برنامه‌نویسان ایرانی صرف همین کار می‌شود.
- وقتی چند ابزار AI دارم، می‌خواهم همه را یک‌بار تنظیم کنم، تا با تغییر مدل یا کلید مجبور نباشم همه‌جا را عوض کنم.
- وقتی تیمم از AI استفاده می‌کند، می‌خواهم بدانم هر نفر چقدر مصرف کرده، تا هزینه را کنترل کنم.
- وقتی ایجنتم شبانه‌روز کار می‌کند، می‌خواهم گیت‌وی همیشه روشن باشد، تا لپ‌تاپم مجبور نباشد روشن بماند.

**Ultimate user goal:** استفاده‌ی پیوسته، ارزان و بی‌دردسر از بهترین مدل‌های AI در کارهای روزمره، به‌خصوص کدنویسی، بدون درگیر شدن با محدودیت‌ها، قطعی‌ها و پراکندگی حساب‌ها.

## User flows

End-user flow:

| Step | What the user does | What the user sees or what happens | Support note |
|---|---|---|---|
| Purchase | در پنل ایران‌سرور پلن شخصی یا تیمی را انتخاب می‌کند و ریالی پرداخت می‌کند | – | – |
| Provisioning | حدود ۱ تا ۲ دقیقه منتظر می‌ماند | آدرس داشبورد و رمز اولیه | ArgoCD کانتینر، والیوم و Ingress را می‌سازد |
| First login | وارد داشبورد می‌شود و رمز را عوض می‌کند | داشبورد خالی با منوی Providers، Combos، Keys و Usage | رمز اولیه باید تصادفی باشد |
| Initial configuration | ارائه‌دهنده‌ها را وصل می‌کند: با کلید API (paste کلید) یا با اشتراک (Connect، لاگین در ارائه‌دهنده و paste آدرس بازگشت)؛ سپس یک Combo مثل `coding = Claude اشتراک → GLM → DeepSeek → رایگان` می‌سازد | وضعیت هر اتصال (سبز یا قرمز) و سهمیه‌ی باقی‌مانده؛ نام combo به‌عنوان یک مدل قابل انتخاب است | **پرتیکت‌ترین مرحله:** OAuth روی سرور دستی است و راهنمای تصویری لازم دارد |
| Connecting tools or integrations | برای هر ابزار یا عضو تیم کلید می‌سازد و Base URL و کلید را در ابزار تنظیم می‌کند، مثلاً `ANTHROPIC_BASE_URL=https://.../v1` برای Claude Code یا بخش OpenAI-compatible در Cursor، Cline و n8n | ابزار مثل قبل کار می‌کند، ولی پشتش گیت‌وی است | راهنمای جدا برای هر ابزار پرکاربرد |
| Daily use | کار عادی: کدنویسی، چت، ایجنت | وقتی یک مدل تمام شد، خودکار سراغ بعدی می‌رود | – |
| Monitoring | داشبورد مصرف را می‌بیند | توکن، هزینه، سهمیه، خطاها، و مصرف به تفکیک کلید و نفر | – |
| Maintenance | کاری نمی‌کند | به‌روزرسانی، بکاپ و افزایش منابع از پنل | تیم ایران‌سرور ایمیج‌ها را pin و به‌روز می‌کند |

Operator flow:

1. ثبت سفارش در پنل، Application را در ArgoCD از قالب Helm یا Kustomize می‌سازد.
1. Secret با رمز اولیه و کلیدهای امضا (تصادفی برای هر مشتری)، PVC، Service، Ingress با SSL و NetworkPolicy برای بستن دسترسی به شبکه‌ی داخلی ساخته می‌شود.
1. Health check و تحویل اطلاعات ورود به مشتری.
1. پایش advisoryهای امنیتی upstream و انتشار نسخه‌ی جدید pin‌شده از طریق Git.
1. بکاپ دوره‌ای والیوم و پشتیبانی تیکت.

Usage scenarios:

- برنامه‌نویس فریلنسر: Claude Code با Combo «اشتراک → GLM → رایگان»، نتیجه کدنویسی بی‌وقفه است.
- تیم ۵ نفره: ۵ کلید جدا روی کلیدهای API مشترک شرکت، نتیجه گزارش هزینه‌ی هر نفر است.
- سازنده‌ی ایجنت: ورک‌فلوهای AI در n8n به گیت‌وی وصل‌اند و با قطع یک ارائه‌دهنده ورک‌فلو نمی‌خوابد؛ فرصت بسته‌ی «n8n + گیت‌وی» همین‌جاست.

## Demand signals

Signals:

| Signal | Query or source | Value | Date | Interpretation |
|---|---|---|---|---|
| YouTube, Persian | `کلود کد رایگان ایران` (Apify YouTube Search Scraper) | Hozhi ۹۵٫۶K، Matin SenPai ۸۸٫۶K، Anbari ۷۳٫۵K در ۲ هفته، Hozhi «Claude Code بن شد؟» ۲۴K | 2026-11-03 | علاقه به نیاز خیلی بالاست |
| YouTube, Persian | ویدیوهای فارسی گیت‌وی‌ها | OmniRoute (Pmseo) ۷K؛ 9Router (dev.0_0) ۲٫۱K و (Hoosh Deck) ۲۶۵ | 2026-11-03 | آشنایی با برند ابزارها هنوز پایین است |
| YouTube, English | آموزش‌های انگلیسی 9Router | ۲۰ تا ۴۲K بازدید، اغلب ۱ تا ۳ ماه اخیر | 2026-11-03 | علاقه‌ی جهانی تازه و رو به رشد |
| Google Trends, worldwide | 9router، openrouter، litellm (۱۲ ماه) | ۲ : ۵۱ : ۱۳ | 2026-11-03 | گیت‌وی‌های self-hosted در سطح جهان کوچک‌اند |
| Google Trends, Iran share | 9router بر اساس کشور | اندونزی ۴۲٪، ویتنام ۳۴٪، ایران ۲۶٪؛ بیشتر کشورها ۰ تا ۵٪ | 2026-11-03 | ایران حدود ۱۳ برابر میانگین جهانی؛ جستجوهای رو به رشد: `omniroute`، `9router docker`، `9router proxy` |
| GitHub stars and activity | GitHub API | 9Router ۳۲K، OmniRoute ۸۴K، CLIProxyAPI ۵۷K، new-api ۵۱K، LiteLLM ۶۳K | 2026-11-03 | دسته‌ی فعال و پرطرفدار |
| Docker pulls and package downloads | Docker Hub و npm | 9Router: ۷۰۸K pull و ۲۲۵K دانلود npm در ۳۰ روز؛ OmniRoute: ۱٫۶۶M pull و ۲۸۰K دانلود npm | 2026-11-03 | بیشتر کاربران خودشان نصب می‌کنند |
| Hosted offer traction | قالب‌های Railway برای 9Router | حدود ۵ دلار در ماه؛ در مجموع حدود ۲۵۰ deploy | 2026-11-03 | تمایل به پرداخت برای میزبانی کم ولی واقعی است |

**Interpretation:** تقاضا حول «دسترسی بی‌وقفه به ایجنت‌های کدنویسی» است، نه حول یک برند خاص. بیشتر کاربران خودشان نصب می‌کنند، پس بازار نسخه‌ی میزبانی‌شده باریک است. کانال‌های فارسی (Matin SenPai، Hozhi، dev.0_0، Pmseo) مستقیم‌ترین مسیر بازاریابی هستند.

## Competitors and substitutes

Competitors and substitutes:

| Name | Type | Offer, price and payment | Strength | Weakness |
|---|---|---|---|---|
| هیچ هاستینگ ایرانی پیدا نشد | Direct | رقیب داخلی که گیت‌وی مدیریت‌شده بدهد پیدا نشد | – | مزیت اول بودن کوتاه است، چون هر هاستینگی در یکی دو روز می‌تواند عرضه کند |
| Railway (قالب‌های 9Router و OmniRoute) | Global SaaS or one-click | حدود ۵ دلار در ماه؛ پرداخت ارزی | یک‌کلیک و ارزان | پرداخت ارزی و پشتیبانی انگلیسی |
| Liara AI و Metis AI | Iranian substitute | API ریالی برای مدل‌ها؛ قیمت: Unknown | بدون نصب، پرداخت ریالی | کنترل کاربر روی ارائه‌دهنده و اشتراک‌های شخصی کمتر است |
| فروشندگان اکانت (مثل ParsPremium) | Iranian substitute | فروش اشتراک خارجی؛ قیمت: Unknown | آشنا برای کاربر | ریسک بن شدن حساب؛ fallback و گزارش مصرف ندارد |
| Self-install | Do-it-yourself | نصب محلی با یک دستور یا روی VPS؛ رایگان | رایگان، بدون واسطه | لپ‌تاپ باید روشن باشد؛ نیاز به VPN؛ نگهداری و امنیت با خود کاربر |

## Market scan

### SWOT

SWOT:

| Strengths (internal) | Weaknesses (internal) |
|---|---|
| زیرساخت آماده‌ی K8s و ArgoCD و پنل برنامه‌ی آماده؛ دیتاسنتر خارج با IP غیرایرانی؛ پرداخت ریالی و پشتیبانی فارسی؛ هزینه‌ی فنی کم (یک کانتینر) | برند ایران‌سرور در حوزه‌ی AI شناخته نیست؛ کنترلی روی upstream نیست؛ پروژه‌ها سریع تغییر می‌کنند و advisory امنیتی زیاد دارند؛ اتصال OAuth روی سرور دستی است |
| Opportunities (external) | Threats (external) |
| علاقه‌ی ۱۳ برابری ایران نسبت به میانگین جهانی؛ نبود رقیب داخلی؛ رشد ایجنت‌های ۲۴ ساعته؛ فروش افزایشی به مشتریان VPS خارج و n8n | جایگزین رایگان فقط یک دستور است؛ ارائه‌دهنده‌ها OAuth و تیرهای رایگان را می‌بندند (Qwen، iFlow و Gemini CLI در ۲۰۲۶)؛ APIهای ریالی؛ ریسک AUP دیتاسنتر خارجی |

### PESTLE

PESTLE:

| Factor | Current state | Impact | Trend | Timeframe |
|---|---|---|---|---|
| Political | ارائه‌دهنده‌های آمریکایی ایران را پشتیبانی نمی‌کنند؛ فیلترینگ و تحریم | بالا (هم محرک تقاضا و هم ریسک) | پایدار | دائمی |
| Economic | پرداخت ارزی دشوار است و ریال بی‌ثبات است؛ تمایل به رایگان یا ارزان بالاست | بالا | سخت‌تر می‌شود | کوتاه‌مدت |
| Social | حدود ۴۰٪ برنامه‌نویسان قصد مهاجرت دارند و حدود ۱۰٪ زمان کار صرف دور زدن محدودیت می‌شود (Quera) | متوسط | افزایشی | میان‌مدت |
| Technological | انتشار هفتگی نسخه‌ها؛ تیرهای رایگان مدام عوض می‌شوند؛ رقابت شدید بین پروژه‌ها | بالا | پرنوسان | ماهانه |
| Legal | استفاده از اشتراک شخصی در ابزار ثالث با ToS برخی ارائه‌دهنده‌ها مغایر است؛ AUP دیتاسنتر خارجی | بالا | سخت‌گیرانه‌تر می‌شود | کوتاه‌مدت |
| Environmental | ناچیز | کم | – | – |

### Porter's Five Forces

Five forces:

| Force | Intensity | Key drivers | Implication |
|---|---|---|---|
| Competitive rivalry | متوسط | قالب‌های Railway، APIهای ریالی، اجرای DIY روی VPS | تمایز باید روی سهولت، ریال و تیم باشد |
| Supplier power | بالا | ارائه‌دهنده‌ها می‌توانند دسترسی را قطع کنند؛ پروژه‌ها یک یا چند نگه‌دارنده دارند | ارزش محصول به تصمیم دیگران وابسته است |
| Buyer power | بالا | هزینه‌ی تغییر صفر است و نسخه‌ی رایگان وجود دارد | قیمت باید پایین باشد |
| Threat of substitutes | خیلی بالا | نصب محلی، VPS، API ریالی، فروش اکانت | بازار هدف باریک می‌شود |
| Threat of new entrants | بالا | همه‌ی نرم‌افزارها متن‌باز و Docker‌پذیرند | مزیت اول بودن کوتاه است |

**Industry attractiveness:** Low to Medium for revenue; Medium to High for customer acquisition.

### Ansoff matrix

Growth options:

| Strategy | Concrete opportunity | Risk | Investment | Priority |
|---|---|---|---|---|
| Market penetration | فروش به مشتریان فعلی VPS خارج، n8n و برنامه‌های آماده (بسته‌ی «n8n + گیت‌وی») | کم | کم | بالا |
| Market development | پلن تیمی برای شرکت‌ها و آژانس‌ها؛ فارسی‌زبانان خارج از ایران | متوسط | کم | متوسط |
| Product development | استک AI آماده: گیت‌وی به‌همراه رابط چت (Open WebUI)، بکاپ و دامنه‌ی اختصاصی | متوسط | متوسط | متوسط |
| Diversification | پلتفرم فروش API ریالی برای کسب‌وکارها (رقابت با Liara AI و Metis) | بالا (تحریم، نقدینگی ارزی) | بالا | کم |

### Synthesis

- **Converging signals:** همه‌ی چارچوب‌ها نشان می‌دهند نیاز قوی است ولی قدرت خریدار و جایگزین‌ها بالاست؛ پس محصول باید ارزان باشد و ارزشش در «بدون نصب، همیشه روشن، IP خارج، ریالی، فارسی» باشد.
- **Strategic imperatives:** قیمت پایین، تنظیمات امنیتی اجباری، به‌روزرسانی منظم ایمیج، راهنمای تصویری OAuth، و پیام بدون «رایگان».
- **Key risks:** بسته شدن دسترسی توسط ارائه‌دهنده‌ها، advisoryهای امنیتی upstream، و ریسک ToS و AUP.
- **Best opportunity:** نفوذ در بازار از طریق فروش افزایشی به مشتریان فعلی VPS خارج و n8n.

## Market sizing

**Market definition:** هزینه‌ی میزبانی گیت‌وی مدیریت‌شده برای برنامه‌نویسان و تیم‌های فارسی‌زبان داخل ایران، روی زیرساخت خارج. هزینه‌ی توکن مدل‌ها حساب نشده است.

Market size:

| Metric | Current estimate | Two to three year projection | Method |
|---|---|---|---|
| TAM | ۳ تا ۵ میلیون دلار در سال (Estimate، اطمینان کم) | ۶ تا ۹ میلیون دلار | بالا به پایین: بازار جهانی LLM Gateway در ۲۰۲۵ بین ۲٫۲ تا ۳٫۳ میلیارد دلار (Business Research Company، رشد سالانه حدود ۲۷٪) × سهم ایران ۰٫۰۵ تا ۰٫۱٪ = ۱ تا ۳ میلیون دلار. پایین به بالا: ۱۵۰ تا ۳۰۰ هزار برنامه‌نویس × ۶۰٪ استفاده از AI × ۶۰ دلار در سال = ۵٫۴ تا ۱۰٫۸ میلیون دلار. جمع‌بندی بین این دو |
| SAM | ۰٫۱ تا ۰٫۲۴ میلیون دلار در سال (Estimate، اطمینان کم) | ۰٫۲ تا ۰٫۴ میلیون دلار | دارندگان ایجنت CLI یا IDE (حدود ۲۵٪) × نیاز به مسیریابی چندارائه‌دهنده‌ای (حدود ۳۰٪) × ترجیح نسخه‌ی میزبانی‌شده (۱۵ تا ۲۵٪) = حدود ۱٫۷ تا ۴ هزار نمونه × ۵ دلار در ماه |
| SOM | ۶ تا ۱۸ هزار دلار در سال (Estimate، اطمینان کم) | ۲۰ تا ۴۰ هزار دلار با پلن تیمی | سال اول ۵ تا ۱۰٪ از SAM، یعنی ۱۰۰ تا ۳۰۰ نمونه |

نرخ تبدیل ریال: Unknown؛ هنگام قیمت‌گذاری نهایی ثبت شود (سؤال باز).

Assumptions:

| Number | Assumption | Confidence | How to validate |
|---|---|---|---|
| 1 | ۱۵۰ تا ۳۰۰ هزار برنامه‌نویس حرفه‌ای در ایران | کم | گزارش Quera و سازمان نظام صنفی رایانه‌ای |
| 2 | ۶۰٪ از AI استفاده می‌کنند و ۲۵٪ ایجنت CLI دارند | متوسط | نظرسنجی از مشتریان ایران‌سرور |
| 3 | ۱۵ تا ۲۵٪ نسخه‌ی میزبانی‌شده را ترجیح می‌دهند | کم | لیست انتظار دوهفته‌ای |
| 4 | ARPU حدود ۵ دلار در ماه | متوسط | تست قیمت در Beta |
| 5 | دسترسی ارائه‌دهنده‌ها از IP خارجی پایدار می‌ماند | کم | پایش ماهانه |

## Software selection

### Selection criteria

Criteria and weights:

| Criterion | Weight | Justified by |
|---|---|---|
| Fit with the platform model (one container, one volume, Kubernetes) | 15 | الزام زیرساخت ایران‌سرور |
| Resource cost per customer | 20 | Porter's Five Forces (قدرت خریدار بالا) و Market sizing (ARPU حدود ۵ دلار) |
| Fit with user jobs | 20 | Target users and jobs to be done: ابزارهای کدنویسی، OAuth، کلید API، تیر رایگان، fallback |
| Ease of use and Persian interface | 15 | User flows و SWOT (پشتیبانی فارسی) |
| Security and maintenance burden | 15 | SWOT و PESTLE (ریسک upstream) |
| Momentum and awareness in Iran | 10 | Demand signals (Google Trends و YouTube) |
| License allows commercial hosting | 5 | ارائه‌ی تجاری |

### Gate filter

Minimum requirements:

| Software | One container and one volume | Web interface for the user | License allows hosting | Maintained in last 90 days | Result |
|---|---|---|---|---|---|
| 9Router (Node) | ✅ SQLite در `/app/data` | ✅ | ✅ MIT | ✅ انتشارهای اخیر | Continue |
| OmniRoute (TypeScript؛ fork 9Router) | ✅ SQLite؛ Redis اختیاری؛ Helm رسمی | ✅ | ✅ MIT | ✅ | Continue |
| CLIProxyAPI (Go) | ✅ فایل config و پوشه‌ی auth روی یک والیوم | ⚠️ داشبورد کامل ندارد؛ GUI آن دسکتاپی است | ✅ MIT | Unknown | Continue با ملاحظه |
| new-api (Go) | ✅ با SQLite پیش‌فرض | ✅ چندکاربره با صورت‌حساب | ⚠️ AGPL؛ بررسی حقوقی لازم است | Unknown | Continue با ملاحظه |
| LiteLLM (Python) | ❌ برای داشبورد و کلیدها PostgreSQL لازم دارد | ✅ | ✅ | ✅ | Excluded |
| claude-code-router | ❌ روی سیستم کاربر اجرا می‌شود | ❌ | – | – | Excluded |

### Candidate facts

Technical facts per candidate:

| Item | 9Router | OmniRoute | CLIProxyAPI | new-api |
|---|---|---|---|---|
| Repository and license | [decolua/9router](https://github.com/decolua/9router)، MIT | [cheaper-inference/OmniRoute](https://github.com/cheaper-inference/OmniRoute)، MIT | [router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)، MIT | [QuantumNous/new-api](https://github.com/QuantumNous/new-api)، AGPL |
| Stack and database | Node، SQLite | TypeScript، SQLite، Redis اختیاری | Go، فایل config | Go، SQLite پیش‌فرض |
| Documented memory need | سبک؛ تخمین ۵۱۲MB تا ۱GB (اندازه‌گیری نشده) | طبق README حداقل ۲GB؛ با یک ایجنت کدنویسی حدود ۱۰GB | خیلی سبک | سبک |
| Image size | حدود ۳۰۰MB | حدود ۴۴۰MB (نسخه‌ی web حدود ۸۷۰MB) | کوچک | کوچک |
| Runs as non-root | ❌ نیاز به override | ✅ پیش‌فرض | Unknown | Unknown |
| Secure defaults | در نسخه‌ی `0.5.112` اجبار کلید API تنظیم دیتابیس است و پیش‌فرض روشن است (`requireApiKey: true`)؛ رمز و secretها مقدار پیش‌فرض ثابت دارند و باید برای هر مشتری ساخته شوند (سند فنی) | `REQUIRE_API_KEY=true` پیش‌فرض | Unknown | Unknown |
| Persian interface | ✅ `fa.json` و README فارسی | ⚠️ مستندات و CLI فارسی دارد؛ داشبورد فارسی تأیید نشد | ❌ | ❌ |
| Security advisories (count, worst severity) | ۱۹ مورد در حدود ۵ ماه؛ چند critical | ۱ مورد، critical؛ سطح حمله بزرگ‌تر | Unknown | Unknown |
| Release cadence | هفتگی | هفتگی | Unknown | Unknown |
| Adoption (stars, pulls, downloads) | ۳۲K ستاره، ۷۰۸K pull، ۲۲۵K npm در ۳۰ روز | ۸۴K ستاره، ۱٫۶۶M pull، ۲۸۰K npm در ۳۰ روز | ۵۷K ستاره | ۵۱K ستاره |

### Scoring

Scores from 1 to 5:

| Criterion (weight) | 9Router | OmniRoute | CLIProxyAPI | new-api |
|---|---|---|---|---|
| Platform fit (15) | 4 | 5 | 3 | 4 |
| Resource cost (20) | 5 | 2 | 5 | 5 |
| Fit with user jobs (20) | 5 | 5 | 4 | 2 |
| Ease of use and Persian (15) | 5 | 3 | 2 | 3 |
| Security and maintenance (15) | 2 | 3 | 4 | 3 |
| Momentum and awareness (10) | 4 | 4 | 3 | 3 |
| License (5) | 5 | 5 | 5 | 3 |
| Total out of 100 | **86** | 74 | 74 | 67 |

**Sensitivity:** اگر هزینه‌ی منابع مهم نباشد (پلن گران تیمی)، فاصله‌ی OmniRoute با 9Router کم می‌شود. اگر امنیت وزن بیشتری بگیرد، CLIProxyAPI بالا می‌آید، ولی نبود داشبورد برای کاربر عادی بزرگ‌ترین ضعفش می‌ماند. امتیازها بر اساس مستندات است و رم واقعی 9Router و OmniRoute باید در staging اندازه‌گیری شود.

**Decision:** 9Router برای پلن پایه (شخصی) در Beta، به شرط تنظیمات امنیتی اجباری و به‌روزرسانی منظم؛ OmniRoute برای پلن حرفه‌ای و تیمی آزمایشی، فقط در پلن ۴GB یا بیشتر؛ new-api برای یک محصول B2B جداگانه در آینده، بعد از بررسی AGPL؛ CLIProxyAPI فعلاً اولویت ندارد چون داشبورد ندارد؛ excluded: LiteLLM چون PostgreSQL لازم دارد و claude-code-router چون روی سیستم کاربر اجرا می‌شود.

## Pricing and packaging

Plans:

| Plan | Target persona | Resources | Price (USD equivalent) | Price (Rial) | Includes |
|---|---|---|---|---|---|
| شخصی (9Router) | برنامه‌نویس فریلنسر، سازنده‌ی ایجنت | حدود ۰٫۵ vCPU، ۵۱۲MB تا ۱GB رم، ۲GB دیسک | ۳ تا ۴ دلار در ماه | Unknown (بر اساس نرخ روز) | دامنه‌ی زیرمجموعه و SSL، به‌روزرسانی، پشتیبانی فارسی |
| تیمی و حرفه‌ای (OmniRoute، آزمایشی) | تیم نرم‌افزاری، توسعه‌دهنده‌ی محصول AI | ۲ تا ۴GB رم یا بیشتر | ۸ تا ۱۵ دلار در ماه | Unknown (بر اساس نرخ روز) | بکاپ روزانه، دامنه‌ی اختصاصی |

مرجع رقابتی: Railway حدود ۵ دلار در ماه، با پرداخت ارزی و پشتیبانی انگلیسی. منابع پلن‌ها بعد از بنچمارک staging در سند فنی نهایی می‌شوند.

**Beta tests:** قیمت ۳ در برابر ۴ دلار برای پلن شخصی؛ Beta رایگان ۷ روزه با لیست انتظار؛ بسته‌ی «n8n + گیت‌وی» برای مشتریان فعلی.

## Positioning and messaging

Positioning options:

| Option | Positioning statement | Against | Strength | Risk |
|---|---|---|---|---|
| 1 | یک آدرس برای همه‌ی مدل‌های AI، روی سرور خارج، همیشه روشن، با پرداخت ریالی | نصب محلی و VPN | مزیت واقعی و قابل‌دفاع | پیام کمی فنی است |
| 2 | گیت‌وی AI تیم شما: کلید جدا برای هر نفر، گزارش هزینه | API ریالی (Metis، Liara) | قیمت بالاتر را توجیه می‌کند | فقط برای تیم‌ها |
| 3 | سرور ایجنت ۲۴ ساعته (n8n، OpenClaw) | Railway | به روند در حال رشد وصل است | بازار هنوز کوچک است |

- **Recommended positioning:** گزینه‌ی ۱، چون مستقیم به JTBD اصلی (دسترسی بی‌وقفه بدون VPN) و مزیت‌های واقعی ایران‌سرور (IP خارج، ریال، فارسی) وصل است؛ گزینه‌ی ۲ برای پلن تیمی.
- **Tagline:** «همه‌ی مدل‌های AI، یک آدرس، روی سرور خارج.»
- **Elevator pitch:** «گیت‌وی هوش مصنوعی ایران‌سرور ابزارهایتان (Claude Code، Cursor، n8n و...) را با یک آدرس به ده‌ها مدل وصل می‌کند. وقتی سهمیه‌ی یک مدل تمام شد، خودکار سراغ بعدی می‌رود و مصرف همه را یک‌جا گزارش می‌کند. روی زیرساخت خارج، بدون نصب و نگهداری، با پرداخت ریالی.»
- **Claims to avoid:** «AI رایگان»، «نامحدود»، و هر وعده‌ای که به تیر رایگان یا اشتراک شخصی ارائه‌دهنده‌ها وابسته است (ریسک ToS، بن شدن حساب و اعتبار).

## Risks and compliance

Risks:

| Risk | Type | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| استفاده از اشتراک شخصی در ابزار ثالث با ToS ارائه‌دهنده مغایر است | Legal | بالا | بالا | در تبلیغات وعده داده نشود؛ مسئولیت در شرایط استفاده با کاربر باشد | Legal |
| مغایرت با AUP دیتاسنتر خارجی | Legal | متوسط | بالا | بررسی AUP قبل از عرضه | Legal |
| AGPL در صورت انتخاب new-api | Legal | متوسط | متوسط | بررسی حقوقی قبل از محصول B2B | Legal |
| advisoryهای امنیتی upstream (۱۹ مورد برای 9Router در حدود ۵ ماه) | Security | بالا | بالا | pin ایمیج، پایش هفتگی advisoryها، `REQUIRE_API_KEY` اجباری، اجرا بدون root، NetworkPolicy | DevOps |
| upstream رها شود یا نسخه‌ی ناسازگار منتشر کند | Operational | متوسط | متوسط | pin نسخه و تست در staging قبل از هر به‌روزرسانی؛ OmniRoute به‌عنوان جایگزین | DevOps |
| بسته شدن OAuth و تیرهای رایگان توسط ارائه‌دهنده‌ها | Commercial | بالا | متوسط | پیام روی پایداری و fallback، نه رایگان بودن | Product |
| تقاضای پولی کمتر از انتظار | Commercial | متوسط | متوسط | Beta کم‌هزینه با معیار توقف مشخص؛ اول فروش افزایشی | Product |

## Launch criteria and monitoring

- **Beta period:** ۹۰ روز از تاریخ عرضه‌ی Beta؛ تاریخ دقیق بعد از Gate B
- **Success criteria:** حداقل ۵۰ نمونه‌ی پولی فعال و ریزش ماهانه‌ی کمتر از ۲۰٪
- **Stop criteria:** کمتر از ۵۰ نمونه‌ی پولی فعال یا ریزش ماهانه‌ی بیشتر از ۲۰٪ در پایان Beta، یعنی توقف سرمایه‌گذاری بازاریابی

Monitoring plan:

| Signal | What to watch | Source | Frequency |
|---|---|---|---|
| Demand | سهم گیت‌وی‌ها در ایران و بازدید ویدیوهای «Claude Code ایران» | Google Trends و YouTube (Apify) | ماهانه |
| Upstream health | advisoryهای امنیتی، انتشارها، بسته شدن تیر رایگان یا بن OAuth | GitHub Security Advisories، changelog و Issues پروژه‌ها | هفتگی |
| Competitors | APIهای ریالی و قالب‌های یک‌کلیک | Liara، Metis، Railway | فصلی |
| Product usage | نمونه‌های فعال، ریزش، تیکت‌های OAuth | پنل ایران‌سرور | هفتگی |

## Open questions

- رم واقعی 9Router و OmniRoute با یک ایجنت کدنویسی واقعی چقدر است؟ - DevOps - در سند فنی، قبل از Gate B
- نرخ تبدیل ریال و قیمت ریالی پلن‌ها - Product و مالی - قبل از عرضه‌ی Beta
- قیمت Liara AI و Metis AI برای مقایسه - Marketing - قبل از عرضه‌ی Beta
- AUP دیتاسنتر خارجی با این سرویس سازگار است؟ - Legal - قبل از Gate C
- تاریخ آخرین انتشار CLIProxyAPI و new-api (شرط نگهداری در ۹۰ روز اخیر) - Product - قبل از Gate A
- آمار رسمی تعداد برنامه‌نویسان ایران برای اعتبارسنجی فرض ۱ - Product - در طول Beta

## Approval

Sign-off:

| Role | Name | Decision | Date |
|---|---|---|---|
| Product | مالک محصول managedapp (تأیید در گفتگو با تیم Product) | Approved (Gate A)، تصمیم Beta | 2026-11-04 |
| Marketing |   |   |   |
| DevOps lead |   |   |   |
| Legal and compliance |   |   |   |
| Management |   |   |   |

## Sources

گزارش کامل تحقیق: [research/ai-gateway-market-analysis.md](research/ai-gateway-market-analysis.md). همه‌ی منابع در تاریخ 2026-11-03 دیده شده‌اند. محدودیت داده: اعتبار Apify حدود ۰٫۳۶ دلار بود و اجرای Google SERP رد شد؛ به‌جای آن از جستجوی وب استفاده شد. هیچ‌کدام از نرم‌افزارها روی کلاستر واقعی اجرا نشد.

- 9Router - https://github.com/decolua/9router - 2026-11-03
- OmniRoute - https://github.com/cheaper-inference/OmniRoute - 2026-11-03
- CLIProxyAPI - https://github.com/router-for-me/CLIProxyAPI - 2026-11-03
- new-api - https://github.com/QuantumNous/new-api - 2026-11-03
- LiteLLM - https://github.com/BerriAI/litellm - 2026-11-03
- claude-code-router - https://github.com/musistudio/claude-code-router - 2026-11-03
- Docker Hub: 9Router - https://hub.docker.com/r/decolua/9router - 2026-11-03
- Docker Hub: OmniRoute - https://hub.docker.com/r/diegosouzapw/omniroute - 2026-11-03
- Railway: 9router-ai-gateway - https://railway.com/deploy/9router-ai-gateway - 2026-11-03
- Railway: 9router-openrouter-alternative - https://railway.com/deploy/9router-openrouter-alternative - 2026-11-03
- Railway: OmniRoute - https://railway.com/deploy/omniroute-ai-gatew-1 - 2026-11-03
- AlternativeTo: 9Router - https://alternativeto.net/software/9router/ - 2026-11-03
- Viblo: OmniRoute و 9Router - https://viblo.asia/p/omniroute-la-gi-ai-gateway-291-providers-so-voi-9router-thi-sao-k74a9pOk4eO - 2026-11-03
- Business Research Company: LLM Gateways - https://www.thebusinessresearchcompany.com/report/large-language-model-gateways-market-report - 2026-11-03
- Business Research Company: LLM Gateway Platform - https://www.thebusinessresearchcompany.com/report/large-language-model-llm-gateway-platform-market-report - 2026-11-03
- Virtue Market Research - https://virtuemarketresearch.com/report/enterprise-ai-gateway-model-routing-market - 2026-11-03
- Zoomit: گزارش Quera ۲۰۲۴ - https://www.zoomit.ir/tech-iran/432107-quera-event-report-2024 - 2026-11-03
- Iran International: مهاجرت برنامه‌نویسان - https://www.iranintl.com/fa/202505047775 - 2026-11-03
- Liara AI - https://docs.liara.ir/ai/about/ - 2026-11-03
- Metis AI - https://metisai.ir - 2026-11-03
- ParsPremium - https://parspremium.ir - 2026-11-03
- Apify YouTube dataset - `fRcbhXLLVkyg8CjnF` - 2026-11-03
- Apify Google Trends dataset - `i0RIJeQiaTRtSHFyy` - 2026-11-03

# AI Gateway (9Router، OmniRoute، new-api) - DevOps Technical Specification

Document details:

| Field | Value |
|---|---|
| App and category | گیت‌وی هوش مصنوعی (AI gateway)؛ سه نرم‌افزار انتخاب‌شده در سند بازار |
| Software and pinned version | 9Router `decolua/9router:0.5.112`؛ OmniRoute `diegosouzapw/omniroute:3.8.52`؛ new-api `calciumion/new-api:v1.0.0-rc.48` (digestها در Container specification) |
| Upstream repository | https://github.com/decolua/9router ؛ https://github.com/cheaper-inference/OmniRoute ؛ https://github.com/QuantumNous/new-api |
| License | 9Router: MIT؛ OmniRoute: MIT؛ new-api: AGPL-3.0 با شرایط اضافه‌ی بند 7(b) |
| Market Validation Brief | [01-market-validation-brief.md](01-market-validation-brief.md) (Approved) |
| Author | تیم Product ایران‌سرور |
| DevOps owner | تیم DevOps (تعیین نفر در بازبینی) |
| Region | Foreign |
| Plans covered | پلن شخصی: 9Router (شروع Beta)؛ پلن حرفه‌ای و تیمی: OmniRoute (آزمایشی)؛ محصول B2B: new-api (آینده) |
| Status | In review |

برچسب‌ها: **Verified** یعنی از فایل‌های upstream در تگ pin‌شده، GitHub API یا Docker Hub خوانده شده (2026-11-04). **Assumed** یعنی پیشنهاد ما است و باید در staging تأیید شود. اولویت اجرا به ترتیب نقش در سند بازار است: اول 9Router، بعد OmniRoute، بعد new-api.

## Summary

برای هر مشتری یک نمونه‌ی مستقل از یکی از سه نرم‌افزار روی دیتاسنتر خارج مستقر می‌شود: یک کانتینر، یک والیوم، یک namespace. هر سه stateful هستند و با SQLite داخلی کار می‌کنند، پس فقط یک replica با `strategy: Recreate` و والیوم ReadWriteOnce. هیچ‌کدام سرویس جانبی اجباری (دیتابیس خارجی یا Redis) ندارند.

نقش‌ها و تفاوت اصلی:

| | 9Router | OmniRoute | new-api |
|---|---|---|---|
| نقش در سبد | پلن شخصی، شروع Beta | پلن تیمی و حرفه‌ای، آزمایشی | محصول B2B برای فروش API به کاربران خود مشتری، آینده |
| اجرا بدون root | با override | پیش‌فرض (`USER node`) | با override (ایمیج USER ندارد) |
| حافظه | سبک؛ اندازه‌گیری نشده | سنگین: طبق upstream برای یک ایجنت کدنویسی حدود ۱۰GB | سبک (Go)؛ upstream عددی نداده |
| داشبورد فارسی | دارد | دارد | ندارد |
| مهم‌ترین ریسک | اعتماد به loopback و ۱۹ advisory | قابلیت‌های اجرای فرمان و دانلود باینری؛ اعتماد به loopback و LAN | `/api/setup` بدون احراز هویت در نمونه‌ی تازه؛ AGPL |

سه چیزی که DevOps در هر سه نباید از دست بدهد:

1. **هیچ sidecar یا پراکسی داخل پاد.** 9Router و OmniRoute درخواست بدون هدر forwarding از `127.0.0.1` را محلی و مورد اعتماد حساب می‌کنند. new-api به‌طور پیش‌فرض هدر IP را از همه‌ی رنج‌های خصوصی قبول می‌کند.
2. **کانتینر هر مشتری غیرقابل‌اعتماد است:** Pod Security سطح restricted، بدون توکن ServiceAccount، NetworkPolicy ورودی فقط از ingress و خروجی بدون دسترسی به شبکه‌ی داخلی و metadata. هر سه URL دلخواه کاربر را صدا می‌زنند و 9Router و OmniRoute قابلیت اجرای فرمان دارند.
3. **secretها برای هر مشتری ساخته و هرگز عوض نمی‌شوند.** کلیدهای امضا و رمزنگاری (`API_KEY_SECRET`، `STORAGE_ENCRYPTION_KEY`، `CRYPTO_SECRET`) اگر عوض یا گم شوند، کلیدهای API یا اعتبارنامه‌های ذخیره‌شده‌ی مشتری از دست می‌روند.

## Software overview for DevOps

Overview:

| Item | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Purpose | گیت‌وی LLM شخصی و تیمی برای ابزارهای کدنویسی با داشبورد وب (Verified) | همان، با قابلیت‌های بیشتر: MCP، ایجنت‌ها، پلاگین، حافظه، فشرده‌سازی (Verified) | پلتفرم توزیع API چندکاربره با کاربر، سهمیه، قیمت‌گذاری و پرداخت (Verified) |
| Language and runtime | Node.js 22، Next.js 16 standalone، `node custom-server.js` (Verified) | Node.js 26 (`node:26-trixie-slim`)، Next.js؛ `run-standalone.mjs` یک پروسه‌ی فرزند `server-ws.mjs` می‌سازد (Verified) | Go (باینری استاتیک `/new-api`) روی `debian:bookworm-slim`؛ UI ساخته‌شده با Bun داخل باینری (Verified) |
| Processes | یک پروسه؛ پروسه‌های فرزند فقط با قابلیت‌های اختیاری (Verified) | دو پروسه‌ی Node؛ پروسه‌های فرزند با قابلیت‌های اختیاری در حدود ۶۶ فایل (Verified) | یک پروسه؛ اجرای پروسه‌ی فرزند ندارد (Verified) |
| Listening ports | `20128`؛ callbackهای OAuth روی `127.0.0.1`؛ MITM روی `443` که در استقرار ما کار نمی‌کند (Verified) | `20128` (داشبورد، API و WebSocket روی همین پورت)؛ live WS داخلی `127.0.0.1:20132`؛ callbackهای OAuth روی `0.0.0.0` با پورت‌های `1455`، `56121`، `56122`، `5959` تا `5968` (Verified) | `3000`؛ pprof روی `8005` فقط با `ENABLE_PPROF=true` (Verified) |
| Data store | SQLite در `DATA_DIR/db/data.sqlite` (Verified) | SQLite با WAL در `DATA_DIR/storage.sqlite` (Verified) | SQLite با WAL در `/data/one-api.db`؛ اختیاری MySQL یا PostgreSQL با `SQL_DSN` (Verified) |
| Optional components | Headroom (کانتینر جدا) حذف؛ SearXNG حذف (Verified) | Redis، qdrant، bifrost، cliproxyapi، Chromium CDP، codex app-server همه اختیاری و حذف (Verified) | Redis و دیتابیس خارجی اختیاری و حذف؛ ClickHouse برای لاگ اختیاری و حذف (Verified) |
| Traffic pattern | SSE طولانی؛ بدنه‌ی بزرگ؛ `h2c` upgrade (Verified) | SSE و WebSocket (`/v1/responses` و `/live-ws`)؛ بدنه تا ۵۰MiB (Verified) | SSE با `X-Accel-Buffering: no` و ping؛ WebSocket برای `/v1/realtime` و `/v1/responses`؛ بدنه تا ۱۲۸MB (Verified) |
| Release cadence | چند تگ در هفته (`0.5.86` تا `0.5.112` بین 2026-09-23 و 2026-10-28)؛ GitHub Releases از `v0.5.35` به‌روز نشده (Verified) | ابتدای جولای چند نسخه در هفته، بعد هر ۳ تا ۵ هفته؛ آخرین `v3.8.52` در 2026-10-19 (Verified) | هر ۲ تا ۱۰ روز؛ همه با نام `v1.0.0-rc.N` ولی بدون برچسب prerelease؛ آخرین `v1.0.0-rc.48` در 2026-11-04 (Verified) |
| Image registry and our mirror | Docker Hub `decolua/9router`، حدود ۳۰۱MB فشرده (Verified) | Docker Hub `diegosouzapw/omniroute` (هنوز با namespace قدیمی؛ مخزن به `cheaper-inference` منتقل شده)، حدود ۴۲۲MiB فشرده؛ نسخه‌ی `-web` با Chromium حدود ۸۷۳MB استفاده نشود (Verified) | Docker Hub `calciumion/new-api`، حدود ۷۴MiB فشرده، با امضای cosign (Verified) |

هر سه ایمیج در رجیستری ایران‌سرور mirror و با digest pin می‌شوند (Assumed: مسیر `<iranserver-registry>/mirror/...`).

## Platform fit

Checks:

| Check | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Single container | ✅ بدون Headroom | ✅ بدون Redis و سرویس‌های اختیاری؛ Redis فقط rate limit را در حافظه نگه می‌دارد | ✅ بدون Redis و دیتابیس خارجی |
| Single persistent volume | ✅ `/app/data`؛ اگر قابل نوشتن نباشد بی‌صدا به `~/.9router` برمی‌گردد | ✅ `/app/data`؛ اگر قابل نوشتن نباشد بی‌صدا به `/home/node/.omniroute` برمی‌گردد؛ مسیر پلاگین‌ها بدون `OMNIROUTE_PLUGINS_DIR` زیر HOME است | ✅ `/data` (دیتابیس و لاگ) |
| External database required | ❌ | ❌ | ❌ برای مقیاس کوچک؛ برای B2B بزرگ PostgreSQL پیشنهاد upstream است (سؤال باز) |
| Can run more than one replica | ❌ | ❌ (upstream صریحاً منع می‌کند) | ❌ با SQLite؛ چند نود فقط با دیتابیس و Redis مشترک |
| Runs as non-root | ⚠️ entrypoint با root `chown` و `su-exec` می‌کند؛ command override لازم است | ✅ `USER node`، UID 1000 طبق کامنت Dockerfile | ⚠️ ایمیج `USER` ندارد و با root اجرا می‌شود؛ باینری به root نیاز ندارد و با `runAsUser` اجرا می‌شود |
| Needs privileged or host access | ❌ (فقط MITM که غیرفعال است) | ❌ (sandbox مهارت‌ها و VNC به docker نیاز دارند و در استقرار ما کار نمی‌کنند؛ MITM در Docker stub است) | ❌ |
| Works behind a TLS-terminating ingress | ✅ با `AUTH_COOKIE_SECURE=true`؛ IP کلاینت همیشه IP ingress دیده می‌شود | ✅ با `AUTH_COOKIE_SECURE=true` و `LIVE_WS_ALLOWED_ORIGINS`؛ ingress با XFF «remote» حساب می‌شود | ✅ با `SESSION_COOKIE_SECURE=true`، `SESSION_COOKIE_TRUSTED_URL` و `TRUSTED_PROXIES` |

همه‌ی مقادیر این جدول Verified از فایل‌های upstream هستند، به‌جز ستون «External database» برای B2B که Assumed است.

## Container specification

Container:

| Field | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Image | `<iranserver-registry>/mirror/decolua/9router` | `<iranserver-registry>/mirror/diegosouzapw/omniroute` | `<iranserver-registry>/mirror/calciumion/new-api` |
| Tag and digest | `0.5.112`؛ index `sha256:fab111d99b23bde6c8944ca22982603ab0b09e917a0b1e4ce42a24b05753bec9`؛ amd64 `sha256:ae94cb5b37e1852343d7cdbe3bd0bdf13cb400a7fcf08c59ca50fb11876b879f` (Verified) | `3.8.52`؛ index `sha256:b08a12e876baa8a5ccadd1ebbe346fe7267dba3b1c9f4fd6bb02070fae41ab6c`؛ amd64 `sha256:90f903d7e9245973dc23f7f0a3afc0c63502c9bd25961097843361689df6474b` (Verified) | `v1.0.0-rc.48`؛ index `sha256:51401a46510bf110ffafdf2cd7177e0b80bbcf02439e69b665c696f330e87ae5`؛ amd64 `sha256:bb3e67e3c3f06278fcd801bef69499862e2de79db88c627816d0cd6277b5ed40` (Verified) |
| Command or entrypoint override | `command` برابر `node custom-server.js` با `workingDir: /app`؛ حتماً `custom-server.js` اجرا شود، چون پاک‌سازی هدرها و توکن peer در آن است (Verified) | بدون override؛ entrypoint `/app/check-permissions.sh` فقط هشدار می‌دهد و CMD `node dev/run-standalone.mjs` را اجرا می‌کند (Verified) | بدون override در entrypoint؛ `args` شامل `--log-dir=` (خالی، تا لاگ فایلی روی والیوم نوشته نشود) (Verified اثر، Assumed انتخاب) |
| runAsUser, runAsGroup, fsGroup | `1000`، `1000`، `1000`؛ `fsGroupChangePolicy: OnRootMismatch` (Assumed؛ UID در staging تأیید شود) | `1000`، `1000`، `1000` (Verified از کامنت Dockerfile؛ با `id` در staging تأیید شود) | `10001`، `10001`، `10001` (Assumed؛ ایمیج کاربر ندارد، هر UID غیرصفر کار می‌کند) |
| Container ports | `20128` | `20128` | `3000` |
| Liveness probe | `httpGet /api/health`؛ period 20، timeout 5، failure 3 (مسیر Verified، مقادیر Assumed) | `httpGet /livez`؛ period 15، timeout 3، failure 6؛ از `/api/monitoring/health` استفاده نشود چون سنگین است (Verified، توصیه‌ی upstream) | `httpGet /api/status`؛ period 20، timeout 5، failure 3 (مسیر Verified؛ دیتابیس را بررسی نمی‌کند) |
| Readiness probe | `httpGet /api/health`؛ period 10، failure 3 (Assumed) | `httpGet /healthz`؛ period 5، timeout 2، failure 6 (Verified، توصیه‌ی upstream) | `httpGet /api/status`؛ period 10، failure 3 (Assumed) |
| Startup probe | `httpGet /api/health`؛ period 5، failure 36 (Assumed) | `httpGet /healthz`؛ period 5، failure 30 (Verified، توصیه‌ی upstream) | `httpGet /api/status`؛ period 5، failure 24 (Assumed) |
| Graceful shutdown (signal, grace period) | `SIGTERM`؛ `terminationGracePeriodSeconds: 60` (signal Verified، مدت Assumed) | `SIGTERM`؛ `preStop` با `sleep 15` و `terminationGracePeriodSeconds: 90` (Verified، توصیه‌ی upstream) | `SIGTERM`؛ برنامه تا ۱۲۰ ثانیه streamها را تخلیه می‌کند (`SHUTDOWN_TIMEOUT_SECONDS`)؛ `terminationGracePeriodSeconds: 150` (Verified مقدار برنامه، Assumed grace) |
| Deployment strategy | `replicas: 1`، `strategy: Recreate` | `replicas: 1`، `strategy: Recreate` | `replicas: 1`، `strategy: Recreate` |

## Configuration

متغیرهای هر نرم‌افزار جدا آمده‌اند. «Secret» یعنی برای هر مشتری در provisioning ساخته می‌شود؛ «ConfigMap» یعنی ثابت برای همه؛ «per-customer» یعنی مقدار مخصوص هر مشتری مثل دامنه.

### 9Router

Environment variables:

| Variable | Required | Upstream default | Our value or source | Notes |
|---|---|---|---|---|
| `DATA_DIR` | بله | `/app/data` در ایمیج | `/app/data` (ConfigMap) | Verified |
| `JWT_SECRET` | بله | اگر نباشد، تصادفی در `DATA_DIR/jwt-secret`؛ نسخه‌های تا `0.4.41` مقدار ثابت داشتند (CVE-2026-49352) | Secret | Verified |
| `INITIAL_PASSWORD` | بله | `123456` | Secret | فقط تا اولین تغییر رمز. Verified |
| `API_KEY_SECRET` | بله | `endpoint-proxy-api-key-secret` | Secret | امضای کلیدهای API؛ **هرگز عوض نشود**. Verified |
| `MACHINE_ID_SALT` | بله | `endpoint-proxy-salt` | Secret | ثابت بماند. Verified |
| `NODE_ENV`، `PORT`، `HOSTNAME` | بله | `production`، `20128`، `0.0.0.0` | همان (ConfigMap) | در development هدر `Host` برای تشخیص محلی پذیرفته می‌شود. Verified |
| `AUTH_COOKIE_SECURE` | بله | `false` | `true` (ConfigMap) | Verified |
| `BASE_URL`، `NEXT_PUBLIC_BASE_URL` | بله | `http://localhost:20128` | `https://<customer-host>` (per-customer) | Verified |
| `CLOUD_URL`، `NEXT_PUBLIC_CLOUD_URL` | خیر | `https://9router.com` | تنظیم نشود | همگام‌سازی ابری خاموش (`cloudEnabled: false`). Verified |
| `ENABLE_REQUEST_LOGS` | خیر | `false` | `false` | اگر روشن شود، prompt و کد مشتری در دیتابیس ذخیره می‌شود. Verified |
| `OBSERVABILITY_ENABLED` | خیر | `true` در `.env.example` | `false` | کاهش رشد دیتابیس. Assumed |
| `NODE_OPTIONS` | بله | – | `--max-old-space-size=<75% of memory limit in MB>` (هر پلن) | Assumed |
| `HOME` | بله | `/home/node` | `/tmp` (emptyDir) | Assumed |

`REQUIRE_API_KEY` در `.env.example` هست، ولی در کد `0.5.112` خوانده نمی‌شود؛ اجبار کلید API تنظیم دیتابیس با پیش‌فرض `requireApiKey: true` است. (Verified)

### OmniRoute

Environment variables:

| Variable | Required | Upstream default | Our value or source | Notes |
|---|---|---|---|---|
| `DATA_DIR` | بله | `/app/data` در ایمیج | `/app/data` (ConfigMap) | Verified |
| `JWT_SECRET` | بله | خالی؛ تصادفی ساخته و در `DATA_DIR/server.env` ذخیره می‌شود | Secret | Verified |
| `API_KEY_SECRET` | بله | مثل بالا | Secret | **هرگز عوض نشود**. Verified |
| `STORAGE_ENCRYPTION_KEY` | بله | مثل بالا | Secret | رمزنگاری اعتبارنامه‌های ارائه‌دهنده‌ها. گم شدنش یعنی از دست رفتن همه‌ی اعتبارنامه‌ها؛ برنامه اگر داده‌ی رمزشده وجود داشته باشد کلید جدید نمی‌سازد. در Secret و بکاپ جداگانه‌ی Secretها نگه داشته شود. Verified |
| `INITIAL_PASSWORD` | بله | `.env.example`: `CHANGEME`؛ ایمیج: خالی | Secret | بدون آن، درخواست loopback در نصب تازه بدون احراز هویت مدیریت را باز می‌کند. Verified |
| `MACHINE_ID_SALT` | بله | `endpoint-proxy-salt` | Secret | Verified |
| `REQUIRE_API_KEY` | بله | کد: `false`؛ ایمیج: `true` | `true` (ConfigMap) | ترتیب اولویت: دیتابیس، بعد env، بعد پیش‌فرض؛ مشتری می‌تواند از داشبورد خاموشش کند. Verified |
| `AUTH_COOKIE_SECURE` | بله | `false` | `true` | Verified |
| `NEXT_PUBLIC_BASE_URL` | بله | `http://localhost:20128` | `https://<customer-host>` (per-customer) | `BASE_URL` داخلی بماند. Verified |
| `LIVE_WS_ALLOWED_ORIGINS` | بله | فقط originهای loopback | `https://<customer-host>` (per-customer) | بدون آن فید زنده‌ی داشبورد کار نمی‌کند. Verified |
| `OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS` | بله | `true` | `false` | با `true`، URL ارائه‌دهنده می‌تواند loopback و LAN باشد. تنظیم داشبورد بر env اولویت دارد؛ NetworkPolicy خروجی کنترل اصلی است. Verified |
| `OMNIROUTE_MEMORY_MB` | بله | `1024` | از جدول Resources per plan | heap را فقط همین تنظیم می‌کند (به `--max-old-space-size` تبدیل می‌شود). Verified |
| `APP_LOG_TO_FILE` | خیر | `true` | `false` | وگرنه تا ۲۰ فایل ۵۰MB در `DATA_DIR/logs` نوشته می‌شود. Verified |
| `APP_LOG_FORMAT` | خیر | `text` | `json` | Verified (گزینه)، Assumed (انتخاب) |
| `OMNIROUTE_PLUGINS_DIR` | بله | `~/.omniroute/plugins` | `/app/data/plugins` | تا پلاگین‌ها خارج از والیوم نباشند. Verified |
| `CALL_LOG_RETENTION_DAYS`، `CALL_LOGS_TABLE_MAX_ROWS` | خیر | `7`، `100000` | `3`، `20000` | بدنه‌ی هر call log تا ۱MB است و دیسک را پر می‌کند. Verified (متغیرها)، Assumed (مقادیر) |
| `DB_BACKUP_MAX_FILES` | خیر | `20` | `5` | بکاپ‌های داخلی روی همان والیوم. Verified (متغیر)، Assumed (مقدار) |
| `REDIS_URL` | خیر | خالی | تنظیم نشود | Verified |
| `CLOUD_URL` | خیر | خالی | خالی | Verified |
| `OMNIROUTE_TRUST_PROXY`، `OMNIROUTE_TRUSTED_PROXIES` | خیر | خالی | خالی | پیش‌فرض، ingress خصوصی را که XFF می‌فرستد پراکسی حساب می‌کند. Verified |
| `HOME` | بله | `/home/node` | `/tmp` (emptyDir) | تنظیمات ابزارهای CLI زیر HOME نوشته می‌شوند. Assumed |

### new-api

Environment variables:

| Variable | Required | Upstream default | Our value or source | Notes |
|---|---|---|---|---|
| `SQL_DSN` | خیر | خالی، یعنی SQLite در `/data/one-api.db` | خالی | Verified |
| `SQLITE_PATH` | خیر | پیش‌فرض بالا با pragmaهای WAL و `busy_timeout` | تنظیم نشود | مقدار سفارشی کل DSN و pragmaها را جایگزین می‌کند. Verified |
| `SESSION_SECRET` | بله | UUID تصادفی در هر اجرا؛ مقدار `random_string` باعث خروج برنامه می‌شود | Secret | بدون آن هر restart همه را logout می‌کند. Verified |
| `CRYPTO_SECRET` | بله | برابر `SESSION_SECRET` | Secret جدا | عوض شدنش URLهای artifact و کش امضاشده را باطل می‌کند. Verified |
| `SESSION_COOKIE_SECURE` | بله | `false` | `true` | Verified |
| `SESSION_COOKIE_TRUSTED_URL` | بله | خالی | `https://<customer-host>` (per-customer) | با Secure الزامی است. Verified |
| `TRUSTED_PROXIES` | بله | خالی، یعنی loopback، همه‌ی RFC1918 و `fc00::/7` مورد اعتمادند | CIDR پادهای ingress-nginx (ConfigMap) | با پیش‌فرض، هر پاد کلاستر می‌تواند IP خود را جعل کند؛ با `none`، rate limit سراسری روی IP ingress و برای همه‌ی کاربران مشترک می‌شود. اگر CNI از `100.64.0.0/10` استفاده می‌کند صریحاً اضافه شود. Verified (رفتار)، Assumed (مقدار) |
| `TZ` | خیر | ایمیج | `Asia/Tehran` | Assumed |
| `ENABLE_PPROF` | خیر | `false` | `false` | با `true`، pprof بدون احراز هویت روی `8005`. Verified |
| `REDIS_CONN_STRING` | خیر | خالی | خالی | Verified |
| `MEMORY_CACHE_ENABLED` | خیر | `false` | `false` | Assumed |
| `ERROR_LOG_ENABLED` | خیر | `false` | `true` | Assumed |
| `GENERATE_DEFAULT_TOKEN` | خیر | `false` | `false` | Verified |
| `TASK_PLUGIN_ENABLED` | خیر | `true` | `false` | پلاگین‌های JavaScript در خود پروسه اجرا می‌شوند. Verified (رفتار)، Assumed (انتخاب) |
| `GOOGLE_ANALYTICS_ID`، `UMAMI_*` | خیر | خالی | خالی | اسکریپت شخص ثالث به UI تزریق می‌کنند. Verified |
| `GOMEMLIMIT` | بله | – | `<90% of memory limit>` (هر پلن) | runtime heap برای Go. Assumed |

### Secret generation rules

- 9Router `JWT_SECRET`، `API_KEY_SECRET`؛ OmniRoute `JWT_SECRET`، `API_KEY_SECRET`، `STORAGE_ENCRYPTION_KEY`؛ new-api `SESSION_SECRET`، `CRYPTO_SECRET`: `<generated: 32 bytes hex>`، در provisioning ساخته می‌شوند، به مشتری داده نمی‌شوند و در طول عمر نمونه ثابت می‌مانند.
- `MACHINE_ID_SALT` (9Router و OmniRoute): `<generated: 16 bytes hex>`، ثابت.
- `INITIAL_PASSWORD` (9Router و OmniRoute) و رمز root (new-api، از طریق `/api/setup`): `<generated: 20 chars, letters and digits>`، یک‌بار در پنل ایران‌سرور به مشتری نمایش داده می‌شود.
- Secretها به‌جز snapshot والیوم، جداگانه در vault پلتفرم بکاپ می‌شوند، چون بازیابی داده‌ی OmniRoute بدون `STORAGE_ENCRYPTION_KEY` ممکن نیست.

## Persistent storage

Storage:

| Item | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Mount path | `/app/data` | `/app/data` | `/data` |
| Contents | `db/data.sqlite` (ارائه‌دهنده‌ها، توکن‌های OAuth و کلیدهای API ارائه‌دهنده‌ها به‌صورت متن، کلیدهای گیت‌وی، مصرف)، `db/backups/`، `machine-id`، `auth/cli-secret`؛ در صورت استفاده: `bin/`، `tunnel/`، `tailscale/`، `pxpipe/`، `headroom/`، `mitm/` (Verified) | `storage.sqlite` با WAL (اعتبارنامه‌ها رمزشده)، `server.env`، `db_backups/`، `call_logs`، `cache/`، `plugins/`، مدل‌های دانلودشده از HuggingFace، باینری CLIProxyAPI اگر version manager استفاده شود (Verified) | `one-api.db` با WAL: کاربران، توکن‌ها، کانال‌ها با کلید ارائه‌دهنده، قیمت‌ها، پرداخت‌ها و **لاگ هر درخواست** (Verified) |
| Size per plan | شخصی: ۲GB (Assumed) | تیمی: ۱۰GB (Assumed) | B2B: ۲۰GB (Assumed) |
| Access mode and storage class | ReadWriteOnce؛ storage class بلوکی با snapshot؛ پیشنهاد `mountOptions` شامل `noexec` تا باینری دانلودشده روی والیوم اجرا نشود (Assumed، در staging تست شود) | مثل 9Router؛ `noexec` جلوی اجرای باینری CLIProxyAPI و ابزارهای دانلودی را می‌گیرد (Assumed) | ReadWriteOnce؛ `noexec` (Assumed) |
| What makes it grow | سوابق مصرف و observability، request logs اگر روشن شود، بکاپ‌های داخلی، باینری‌های اختیاری (Verified)؛ نرخ Unknown | call logs (تا ۱MB هر کدام)، WAL (سقف ۲۵۶MB)، بکاپ‌های داخلی، مدل‌های HuggingFace، لاگ فایلی اگر خاموش نشود (Verified)؛ نرخ Unknown | لاگ مصرف هر درخواست در دیتابیس بدون حذف خودکار؛ برای B2B با کاربران زیاد سریع رشد می‌کند (Verified)؛ نرخ Unknown |
| Backup method and frequency | snapshot روزانه‌ی CSI با نگهداری ۷ روز؛ چون SQLite است، یا قبل از snapshot از بکاپ داخلی استفاده شود یا بازیابی snapshot crash-consistent در staging تست شود (Assumed) | مثل 9Router، به‌اضافه‌ی بکاپ Secretها (Assumed) | مثل 9Router؛ برای B2B snapshot هر ۶ ساعت، چون داده‌ی مالی دارد (Assumed) |
| Restore procedure and last test date | PVC از snapshot، scale به ۰، جایگزینی PVC، scale به ۱، بررسی ورود و ارائه‌دهنده‌ها؛ هنوز تست نشده | همان؛ با همان `STORAGE_ENCRYPTION_KEY`؛ هنوز تست نشده | همان؛ بررسی موجودی و سوابق پرداخت؛ هنوز تست نشده |
| Data retention after cancellation | scale به ۰، نگهداری PVC و آخرین snapshot برای ۷ روز، بعد حذف قطعی (Assumed، تأیید Legal) | همان | همان؛ مدت نگهداری سوابق مالی را Legal تعیین کند |

## Resources per plan

Resources:

| Plan | CPU request and limit | Memory request and limit | Runtime heap setting | Disk | Expected concurrent use |
|---|---|---|---|---|---|
| شخصی (9Router) | `250m` / `1000m` (Assumed) | `384Mi` / `1Gi` (Assumed) | `--max-old-space-size=768` (Assumed) | ۲GB | ۱ کاربر، ۱ تا ۳ ایجنت کدنویسی |
| تیمی (OmniRoute) | `500m` / `2000m` (Assumed) | `2Gi` / `4Gi` با upstream ناسازگار است؛ پیشنهاد آزمایش: `3Gi` / `10Gi` (Assumed) | `OMNIROUTE_MEMORY_MB=2048` برای پلن ۴GB؛ `8192` برای پلن ۱۰GB (Verified توصیه‌های upstream، Assumed انتخاب) | ۱۰GB | ۳ تا ۱۰ کاربر؛ upstream بیش از دو context بلند هم‌زمان را روی یک پروسه توصیه نمی‌کند |
| B2B (new-api) | `250m` / `2000m` (Assumed) | `256Mi` / `1Gi` (Assumed) | `GOMEMLIMIT=900MiB` (Assumed) | ۲۰GB | ده‌ها کاربر نهایی مشتری؛ Unknown تا بنچمارک |

**ناسازگاری مهم با سند بازار:** پلن تیمی در سند بازار ۲ تا ۴GB رم و ۸ تا ۱۵ دلار در ماه فرض شده است. مستندات OmniRoute برای یک ایجنت کدنویسی heap ۸۱۹۲MB و حداقل ۱۰GiB حافظه‌ی کانتینر توصیه می‌کند. راهنمای self-host خود پروژه ۲۰۴۸MB را برای یک کاربر Claude Code «امن» می‌داند. تا وقتی بنچمارک تکلیف را روشن نکند، قیمت پلن تیمی نهایی نیست و ممکن است OmniRoute فقط در پلن ۸GB یا بیشتر عرضه شود.

قیمت همه‌ی پلن‌ها در سند بازار تا پر شدن این جدول با عدد بنچمارک نهایی نیست.

**Benchmark:** workload برای هر سه: نمونه‌ی تازه با ۳ ارائه‌دهنده (یک اشتراک OAuth یا کانال، دو کلید API) و یک combo یا گروه سه‌مرحله‌ای؛ کلاینت‌های Claude Code یا OpenCode هم‌زمان (9Router: ۳، OmniRoute: ۵، new-api: ۲۰ کلید با درخواست‌های کوتاه و ۵ stream بلند) به مدت ۲ ساعت با streaming و context بیش از ۱۰۰ هزار توکن؛ یک fallback اجباری با از کار انداختن ارائه‌دهنده‌ی اول؛ داشبورد مصرف باز. نتیجه: peak memory، peak CPU و رشد والیوم در ۲ ساعت. تاریخ: توسط DevOps در staging پر شود.

## Networking

Network:

| Item | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Service type and port | `ClusterIP`، `80` به `20128` | `ClusterIP`، `80` به `20128` | `ClusterIP`، `80` به `3000` |
| Ingress host pattern | `<instance>.<managed-app-domain>` (Assumed) | همان | همان؛ دامنه‌ی اختصاصی مشتری برای B2B (Assumed) |
| TLS | cert-manager با Let's Encrypt یا wildcard؛ redirect اجباری به HTTPS (Assumed) | همان | همان |
| Ingress annotations | `proxy-buffering: "off"`، `proxy-request-buffering: "off"`، `proxy-read-timeout: "3600"`، `proxy-send-timeout: "3600"`، `proxy-body-size: "50m"` (upstream `proxy_buffering off` و `proxy_read_timeout 86400` را برای SSE حیاتی می‌داند) | همان، به‌اضافه‌ی پشتیبانی WebSocket؛ upstream: `client_max_body_size 100M`، buffering خاموش، timeout ۶۰۰ ثانیه | همان، با `proxy-body-size: "128m"` و WebSocket؛ timeoutها بیشتر از `RELAY_RESPONSE_HEADER_TIMEOUT=1800` |
| Public paths, and paths to restrict | عمومی: `/v1`، `/v1beta`، `/api/v1`، `/api/v1beta`، `/codex`، `/responses` (با کلید)، `/api/health`، `/api/init`، `/api/locale`، `/api/auth/*`، `/api/version`؛ بقیه پشت ورود. rate limit روی `/api/auth/login` در ingress (Verified مسیرها) | عمومی: `/v1/*`، `/healthz`، `/livez`؛ `/api/monitoring/health` در ingress بسته شود؛ rate limit روی مسیر ورود (Assumed) | عمومی: `/v1/*`، `/api/status`، `/api/uptime/status`، صفحات UI، webhookهای پرداخت (`/api/stripe/webhook` و مشابه). **`/api/setup` تا کامل شدن setup در ingress بسته باشد** (Verified مسیرها، Assumed کنترل) |
| Outbound destinations | API ارائه‌دهنده‌ها روی HTTPS 443؛ ارائه‌دهنده‌ی سفارشی با URL دلخواه (Verified) | همان، به‌اضافه‌ی huggingface.co برای مدل‌ها و GitHub برای باینری‌ها و پلاگین‌ها (Verified) | API ارائه‌دهنده‌ها، درگاه‌های پرداخت، SMTP، `api.github.com` (فهرست مدل‌های codex)، فهرست پلاگین‌ها (Verified) |
| Outbound proxy | ندارد (Assumed) | ندارد | ندارد |
| NetworkPolicy, ingress | فقط از namespace کنترلر ingress به پورت سرویس (Assumed) | همان؛ ضروری‌تر است، چون مسیرهای LOCAL_ONLY به پادهای با IP خصوصی که هدر forwarding نمی‌فرستند اعتماد می‌کنند | همان؛ ضروری است، چون `TRUSTED_PROXIES` به IP پادها اعتماد می‌کند |
| NetworkPolicy, egress | مجاز: DNS به kube-dns و TCP 443 و 80 به `0.0.0.0/0` **به‌جز** `10.0.0.0/8`، `172.16.0.0/12`، `192.168.0.0/16`، `100.64.0.0/10`، `169.254.0.0/16` و CIDR پادها و سرویس‌ها (Assumed CIDRها) | همان | همان؛ به‌اضافه‌ی پورت SMTP (۵۸۷) اگر ایمیل فعال است؛ upstream URL کانال‌ها را عمداً از SSRF محافظت نمی‌کند |

## Security hardening

Controls:

| Control | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Pod Security level | `restricted` | `restricted` | `restricted` |
| securityContext (non-root, read-only root filesystem, dropped capabilities) | `runAsNonRoot: true`، `allowPrivilegeEscalation: false`، `capabilities.drop` شامل `ALL`، `seccompProfile: RuntimeDefault`، `readOnlyRootFilesystem: true` با emptyDir برای `/tmp` و `/app/.next/cache` (Assumed) | همان؛ سازگاری با root فقط‌خواندنی Unknown است و در staging تست شود؛ entrypoint برای `OMNIROUTE_BASE_PATH` باندل را patch می‌کند، پس آن متغیر تنظیم نشود (Verified) | همان، با emptyDir برای `/tmp` (Assumed) |
| automountServiceAccountToken | `false` | `false` | `false` |
| Default credentials replaced | `INITIAL_PASSWORD`، `JWT_SECRET`، `API_KEY_SECRET`، `MACHINE_ID_SALT` (Verified پیش‌فرض‌های ثابت) | `INITIAL_PASSWORD`، `JWT_SECRET`، `API_KEY_SECRET`، `STORAGE_ENCRYPTION_KEY`، `MACHINE_ID_SALT` (Verified) | رمز پیش‌فرض ندارد، ولی `/api/setup` بدون احراز هویت است؛ provisioning آن را با رمز تولیدشده کامل می‌کند (Verified رفتار) |
| API authentication enforced | `requireApiKey: true` و `requireLogin: true` پیش‌فرض دیتابیس؛ مشتری می‌تواند خاموش کند (Verified) | `REQUIRE_API_KEY=true` در env؛ تنظیم داشبورد اولویت دارد؛ رد کردن مرحله‌ی رمز در onboarding ورود را برای کل نصب خاموش می‌کند (Verified) | هر درخواست relay توکن `sk-` لازم دارد (Verified)؛ **ثبت‌نام آزاد است** (`RegisterEnabled=true`، بدون تأیید ایمیل)؛ provisioning آن را خاموش می‌کند تا مشتری خودش تصمیم بگیرد (Assumed) |
| Forwarded header trust | XFF فقط از peer روی loopback؛ پشت ingress، IP کلاینت همیشه IP ingress است؛ قفل brute-force برای همه‌ی کاربران نمونه مشترک است؛ rate limit ingress جبران می‌کند (Verified) | محلی بودن از peer واقعی TCP تعیین می‌شود؛ هر peer خصوصی یا loopback با هدر forwarding «remote» است؛ IP کلاینت از راست‌ترین hop غیرقابل‌اعتماد XFF (Verified) | `TRUSTED_PROXIES` روی CIDR ingress تنظیم شود؛ IP کلاینت در rate limit، `allow_ips` توکن‌ها و سوابق audit استفاده می‌شود (Verified) |
| Sidecar proxies allowed | **خیر.** درخواست loopback بدون هدر forwarding بدون کلید به `/v1` دسترسی دارد؛ `kubectl port-forward` هم همین‌طور؛ port-forward فقط برای DevOps (Verified) | **خیر.** sidecar یا port-forward بدون XFF «loopback» است و در نصب تازه مدیریت بدون احراز هویت را باز می‌کند؛ اینکه Envoy یا Istio XFF اضافه کند Unknown (Verified) | **خیر**، برای یکسان بودن سیاست؛ برنامه loopback bypass ندارد (Verified) |
| Risky features disabled | tunnel و pxpipe باینری دانلود و اجرا می‌کنند؛ MCP stdio فرمان اجرا می‌کند؛ MITM کار نمی‌کند؛ updater با root فقط‌خواندنی شکست می‌خورد. متغیر env برای خاموش کردن قطعی پیدا نشد؛ کنترل: non-root، root فقط‌خواندنی، `noexec` روی والیوم، NetworkPolicy (Verified قابلیت‌ها، Assumed کنترل) | اجرای CLI ایجنت‌ها، ACP agents، پلاگین‌ها، middleware با `vm.Script`، auto-update با git و npm، version manager که CLIProxyAPI دانلود و اجرا می‌کند، tunnel (cloudflared، tailscale، ngrok)، MCP روی `/api/mcp/*`. sandbox مهارت‌ها و VNC بدون docker کار نمی‌کنند. کنترل‌ها مثل 9Router (Verified قابلیت‌ها، Assumed کنترل) | `TASK_PLUGIN_ENABLED=false`؛ `ENABLE_PPROF=false`؛ تنظیمات محافظت SSRF برای URLهای کاربر روشن بماند (پیش‌فرض) (Verified) |
| Image scanning | Trivy روی ایمیج mirror قبل از هر ارتقا؛ آسیب‌پذیری critical بدون اصلاح، ارتقا را متوقف می‌کند (Assumed) | همان؛ base `node:26-trixie-slim` با digest pin نشده و هر build ممکن است لایه‌ی متفاوت داشته باشد | همان؛ امضای cosign قبل از mirror بررسی شود |
| Time to apply security updates | critical: ۴۸ ساعت؛ high: ۷ روز (Assumed) | همان | همان؛ advisoryهای مالی و سهمیه برای B2B مثل critical رفتار شوند |

### Known advisories

**9Router** (۱۹ advisory منتشرشده؛ همه در نسخه‌های پایین‌تر از `0.5.112`؛ بر اساس بازه‌ی اعلام‌شده هیچ‌کدام روی نسخه‌ی pin‌شده اثر ندارند):

- GHSA-fhh6-4qxv-rpqj (CVE-2026-46339) - critical - fixed in 0.4.37 - affects pinned version: no
- GHSA-g6g7-pvmx-m74p - critical - fixed in 0.4.44 - affects pinned version: no
- GHSA-jphh-m39h-6gwx (CVE-2026-49352) - critical - fixed in 0.4.44 - affects pinned version: no
- GHSA-vjc7-jrh9-9j86 - critical - بازه تا 0.4.41؛ نسخه‌ی اصلاح ثبت نشده - affects pinned version: no (بر اساس بازه)
- GHSA-6g2f-w7g3-77vf (CVE-2026-49353) - high - بازه تا 0.4.55؛ نسخه‌ی اصلاح ثبت نشده - affects pinned version: no (بر اساس بازه)
- GHSA-qvfm-67h2-2qfx (CVE-2026-55500) - critical - بازه تا 0.4.71؛ نسخه‌ی اصلاح ثبت نشده - affects pinned version: no (بر اساس بازه)
- GHSA-7cfm-pqrj-xgq7 (CVE-2026-55501) - high - fixed in 0.4.77 - affects pinned version: no
- GHSA-4922-8r65-fq26 - critical - fixed in 0.4.60 - affects pinned version: no
- GHSA-qj3v-64wj-q825 - high - fixed in 0.4.72 - affects pinned version: no
- GHSA-8gmq-j984-vp4r (CVE-2026-55638) - high - fixed in 0.4.82 - affects pinned version: no
- GHSA-86m2-fcxq-5q7c (CVE-2026-55641) - high - fixed in 0.4.82 - affects pinned version: no
- GHSA-cmhj-wh2f-9cgx (CVE-2026-56676) - high - fixed in 0.5.2 - affects pinned version: no
- GHSA-x5c9-v98j-722r (CVE-2026-56675) - high - fixed in 0.5.2 - affects pinned version: no
- GHSA-vmjq-hvgq-2wv4 (CVE-2026-56679) - high - fixed in 0.5.4 - affects pinned version: no
- GHSA-63p9-g54h-prrp (CVE-2026-62312) - high - fixed in 0.5.2 - affects pinned version: no
- GHSA-6mwv-4mrm-5p3m (CVE-2026-56678) - medium - fixed in 0.5.6 - affects pinned version: no
- GHSA-8g4w-4ffg-8vgx (CVE-2026-56677) - high - fixed in 0.5.6 - affects pinned version: no
- GHSA-5mj8-gf6m-fhw8 (CVE-2026-56681) - high - fixed in 0.5.6 - affects pinned version: no
- GHSA-32gc-64m7-hj7v (CVE-2026-56682) - medium - fixed in 0.5.6 - affects pinned version: no

الگوی تکرارشونده: دور زدن تشخیص «درخواست محلی» با `Host` یا `X-Forwarded-For`، SSRF، و RCE از مسیر پلاگین‌های MCP.

**OmniRoute** (۱ advisory منتشرشده در مخزن):

- GHSA-hf57-cqmx-p4gr (CVE-2026-88062) - critical، RCE در ACP custom agents (`POST /api/acp/agents`) - fixed in 3.8.49 طبق مخزن؛ پایگاه سراسری GitHub بازه را تا 3.8.50 بدون نسخه‌ی اصلاح ثبت کرده - affects pinned version: no طبق مخزن؛ در کد `3.8.52` مسیر LOCAL_ONLY است و آرگومان‌ها محدود شده‌اند، ولی LOCAL_ONLY پادهای با IP خصوصی را هم می‌پذیرد. حدود ۴۰ شناسه‌ی GHSA دیگر در کامنت‌های کد آمده که در فهرست منتشرشده نیستند و وضعیتشان Unknown است.

**new-api** (۱۵ advisory در مخزن؛ هیچ‌کدام بازه‌ای شامل `v1.0.0-rc.48` ندارند):

- GHSA-xxv6-m6fx-vfhh (CVE-2025-59146) - high، SSRF - fixed in v0.9.0.5 - affects pinned version: no
- GHSA-9f46-w24h-69w4 (CVE-2025-62155) - high، دور زدن SSRF - fixed in v0.9.6 - affects pinned version: no
- GHSA-299v-8pq9-5gjq (CVE-2026-25802) - high، XSS - fixed in v0.10.8-alpha.9 - affects pinned version: no
- GHSA-w6x6-9fp7-fqm4 (CVE-2026-25591) - high، DoS - fixed in v0.10.8-alpha.10 - affects pinned version: no
- GHSA-f35r-v9x5-r8mc (CVE-2026-30886) - medium، IDOR - fixed in v0.11.4-alpha.2 - affects pinned version: no
- GHSA-5353-f8fq-65vc (CVE-2026-32879) - medium، دور زدن passkey - در مخزن نسخه‌ی اصلاح ثبت نشده؛ پایگاه سراسری بازه را تا 0.11.9-alpha.1 می‌داند - affects pinned version: no (بر اساس بازه‌ی سراسری؛ تست دستی لازم)
- GHSA-xff3-5c9p-2mr4 (CVE-2026-41432) - high، دور زدن امضای webhook استرایپ - fixed in v0.12.10 - affects pinned version: no
- GHSA-v5c3-6wvc-pc2q (CVE-2026-42339) - high، دور زدن فیلتر SSRF - بازه تا v0.11.9-alpha.1 - affects pinned version: no
- GHSA-6x2c-phff-wx57 (CVE-2026-64859) - critical، نشت توکن root - fixed in v1.0.0-rc.7 - affects pinned version: no
- GHSA-26v7-h57m-gh9m (CVE-2026-44342) - medium، CSRF - fixed in v0.12.0-alpha.1 - affects pinned version: no
- GHSA-6qcr-qxgr-m7fv (CVE-2026-33655) - high، دور زدن SSRF - fixed in v0.12.0-alpha.1 - affects pinned version: no
- GHSA-v828-m3pf-vq9q (CVE-2026-64868) - high، DoS از webhookهای پرداخت - fixed in v1.0.0-rc.11 - affects pinned version: no
- GHSA-p845-629j-rcj6 (CVE-2026-64866) - medium، reset passkey کاربر بالاتر - fixed in v1.0.0-rc.7 - affects pinned version: no
- GHSA-8r8v-xf7q-rcpr (CVE-2026-71479) - critical، شارژ منفی و افزایش اعتبار خودکار در billing - fixed in 1.0.0-rc.18 - affects pinned version: no
- GHSA-j6gc-4893-qwmp (CVE-2026-64865) - high، بازنویسی سهمیه در کش Redis - fixed in v1.0.0-rc.16 - affects pinned version: no

## ArgoCD packaging

Packaging:

| Item | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Source (chart or Kustomize, Git path) | upstream چارت ندارد؛ چارت پایه‌ی برنامه‌های آماده؛ `managed-apps/9router/` (Assumed) | upstream چارت ندارد (فقط نمونه‌ی probe و strategy در مستندات)؛ چارت پایه؛ `managed-apps/omniroute/` (Assumed) | upstream چارت ندارد؛ چارت پایه؛ `managed-apps/new-api/` (Assumed) |
| Chart version | چارت پایه؛ `appVersion: 0.5.112` | چارت پایه؛ `appVersion: 3.8.52` | چارت پایه؛ `appVersion: v1.0.0-rc.48` |
| Per-customer parameters | `instanceName`، `host`، `plan`، `secretRef`، `storageSize` | همان | همان، به‌اضافه‌ی `customDomain` |
| Values per plan | `resources`، `NODE_OPTIONS`، `storageSize` | `resources`، `OMNIROUTE_MEMORY_MB`، `storageSize` | `resources`، `GOMEMLIMIT`، `storageSize` |
| Sync policy (automated, prune, selfHeal) | `automated: {prune: true, selfHeal: true}`؛ PVC با `Prune=false` و `Delete=false` | همان | همان |
| Sync waves or hooks | wave `-1`: Secret و PVC؛ wave `0`: Deployment، Service، NetworkPolicy، Ingress؛ hook پیش از ارتقا: snapshot | همان | wave `0`: Deployment، Service، NetworkPolicy؛ hook `PostSync`: Job که `POST /api/setup` را از داخل namespace با رمز تولیدشده صدا می‌زند و ثبت‌نام را خاموش می‌کند؛ wave `1`: Ingress فقط بعد از موفقیت Job (Assumed) |
| Namespace and naming convention | `ma-9router-<instance>`، منابع `9router-<instance>` (Assumed) | `ma-omniroute-<instance>`، منابع `omniroute-<instance>` | `ma-newapi-<instance>`، منابع `newapi-<instance>` |
| Labels and annotations for billing and monitoring | `app.kubernetes.io/name`، `app.kubernetes.io/version`، `iranserver.com/plan`، `iranserver.com/customer-id`، `iranserver.com/region: foreign` (Assumed) | همان | همان |

برای Job setup در new-api، NetworkPolicy ورودی باید دسترسی همان Job به پورت `3000` را هم بدهد.

## Lifecycle procedures

### Provisioning

1. سفارش در پنل ثبت می‌شود و `instanceName`، `host`، `plan` و نرم‌افزار (بر اساس پلن) مشخص می‌شوند.
1. Secretها طبق Secret generation rules ساخته می‌شوند.
1. Application در ArgoCD با values پلن ساخته می‌شود: namespace، Secret، PVC، Deployment، Service، NetworkPolicy.
1. 9Router و OmniRoute: Ingress با TLS ساخته می‌شود و پنل بعد از Healthy شدن صفحه‌ی ورود را بررسی می‌کند.
1. new-api: Job setup حساب root را با رمز تولیدشده می‌سازد و ثبت‌نام را خاموش می‌کند؛ بعد Ingress ساخته می‌شود. تا این مرحله نمونه از اینترنت در دسترس نیست.
1. اطلاعات ورود به مشتری تحویل داده می‌شود.

### First run and handover

مشتری در پنل ایران‌سرور این‌ها را می‌گیرد: آدرس داشبورد، نام کاربری (برای new-api)، رمز اولیه (یک‌بار نمایش) و پیوند راهنماها.

- **9Router و OmniRoute:** اتصال ارائه‌دهنده با کلید API، اتصال اشتراک با OAuth و paste آدرس بازگشت، ساخت combo و کلید API، اتصال Claude Code، Cursor و n8n. در اولین ورود رمز را عوض کند و گزینه‌های «Require API key» و «Require login» را خاموش نکند. در OmniRoute مرحله‌ی رمز در onboarding را رد نکند.
- **new-api:** تغییر رمز root، فعال کردن 2FA، تعریف کانال‌ها و قیمت مدل‌ها، و تصمیم درباره‌ی ثبت‌نام عمومی (با تأیید ایمیل یا Turnstile). راهنما توضیح دهد که UI فارسی ندارد.

### Upgrade

1. نسخه‌ها فقط با tag و digest pin می‌شوند؛ `latest` هرگز (در new-api، `latest` با هر rc جابه‌جا می‌شود).
1. هر نسخه‌ی جدید upstream یا advisory جدید در staging با یک نمونه‌ی دارای داده‌ی واقعی تست می‌شود: migration، ورود، ارائه‌دهنده‌ها یا کانال‌ها، یک درخواست streaming، و تست‌های امنیتی بخش Acceptance tests.
1. ارتقای عادی هر دو هفته یک‌بار و دسته‌ای؛ اصلاح امنیتی طبق مهلت بخش Security hardening (Assumed).
1. قبل از ارتقای هر نمونه: snapshot از PVC با hook ArgoCD.
1. ارتقا با تغییر tag و digest در Git؛ `Recreate` چند ثانیه قطعی دارد.
1. Rollback: برگرداندن commit؛ اگر migration برگشت‌ناپذیر بود، بازیابی PVC از snapshot قبل از ارتقا.
1. new-api: یادداشت‌های انتشار هر rc برای تغییرات شکننده خوانده شود (مثلاً rc.48 کش Redis را امضاشده کرده است).

### Deprovisioning

با لغو سرویس، Deployment به ۰ scale و Ingress حذف می‌شود. PVC و آخرین snapshot ۷ روز نگه داشته می‌شوند؛ بعد namespace، PVC، snapshotها و Secretها حذف می‌شوند. برای new-api مدت نگهداری سوابق مالی را Legal تعیین می‌کند. (Assumed)

## Observability

Monitoring:

| Item | 9Router | OmniRoute | new-api |
|---|---|---|---|
| Logs (format and destination) | متن ساده روی stdout و stderr (Verified)؛ جمع‌آوری با agent سطح node، نه sidecar؛ نگهداری ۱۴ روز (Assumed) | pino روی stdout؛ با `APP_LOG_FORMAT=json` و `APP_LOG_TO_FILE=false` (Verified گزینه‌ها) | متن ساده روی stdout: خط برنامه با سطح لاگ، تاریخ، شناسه‌ی درخواست و پیام، و خط دسترسی با پیشوند `GIN`؛ فایل با `--log-dir=` خاموش (Verified) |
| Metrics endpoint | ندارد (Verified) | ندارد؛ upstream برای v3.9 برنامه‌ریزی کرده (Verified) | ندارد (Verified) |
| Dashboards | داشبورد Grafana مشترک برنامه‌های آماده: CPU، حافظه، restart، PVC، 5xx و مدت پاسخ ingress (Assumed) | همان؛ به‌اضافه‌ی پایش heap نسبت به `OMNIROUTE_MEMORY_MB` | همان |
| Alerts (restarts, disk above 80 percent, 5xx rate, certificate expiry) | restart بیش از ۳ بار در ۱۵ دقیقه؛ PVC بیش از ۸۰٪؛ 5xx بیش از ۵٪ در ۱۰ دقیقه؛ انقضای گواهی کمتر از ۱۴ روز؛ OOMKilled (Assumed) | همان | همان؛ به‌اضافه‌ی هشدار رشد سریع دیتابیس (لاگ مصرف) |
| Upstream release and advisory watch | هفتگی برای تگ‌های Docker Hub و GitHub؛ روزانه برای Security Advisories `decolua/9router` | همان برای `cheaper-inference/OmniRoute` و پایگاه سراسری GitHub (این دو در یک مورد ناسازگارند) | همان برای `QuantumNous/new-api` |

## Known limitations

Limitations:

| Feature | Status in our deployment | Reason | Customer-facing note |
|---|---|---|---|
| ورود OAuth با callback خودکار (9Router، OmniRoute) | با مرحله‌ی دستی | سرورهای callback داخل پاد باز می‌شوند و مرورگر کاربر به آن‌ها نمی‌رسد | «بعد از ورود در سایت ارائه‌دهنده، آدرس صفحه‌ی بازگشت را کپی و در داشبورد paste کنید.» |
| MITM (9Router، OmniRoute) | کار نمی‌کند | به پورت 443، نصب گواهی و تغییر DNS روی سیستم کاربر نیاز دارد | «این قابلیت فقط در نسخه‌ی نصب‌شده روی سیستم خودتان کار می‌کند.» |
| Tunnel (9Router، OmniRoute) | لازم نیست | نمونه آدرس عمومی با SSL دارد | «نمونه‌ی شما از قبل آدرس اینترنتی امن دارد.» |
| Headroom (9Router) | غیرفعال | کانتینر جدا لازم دارد | «فشرده‌سازی توکن Headroom در این نسخه ارائه نمی‌شود.» |
| ابزارهای CLI و auto-import تنظیمات از سیستم کاربر (9Router، OmniRoute) | کار نمی‌کند | به فایل‌های سیستم کاربر دسترسی ندارد | «ابزارها را با Base URL و کلید API تنظیم کنید؛ راهنما را ببینید.» |
| sandbox مهارت‌ها، VNC، اجرای ایجنت‌های CLI داخل سرور (OmniRoute) | کار نمی‌کند | به docker یا باینری ایجنت‌ها نیاز دارد که در کانتینر ما نیست | «اجرای ایجنت روی سرور در این نسخه پشتیبانی نمی‌شود.» |
| Redis و rate limit مشترک (OmniRoute) | rate limit در حافظه | Redis حذف شده | لازم نیست |
| به‌روزرسانی از داخل داشبورد (هر سه) | غیرفعال | ارتقا با نسخه‌های pin‌شده توسط ایران‌سرور | «به‌روزرسانی‌ها را تیم ایران‌سرور انجام می‌دهد.» |
| خاموش کردن «Require API key» یا «Require login» (9Router، OmniRoute) | ممکن، توصیه نمی‌شود | تنظیم در دست مشتری است | «اگر این گزینه‌ها را خاموش کنید، هر کسی آدرس شما را داشته باشد از اعتبار ارائه‌دهنده‌هایتان استفاده می‌کند.» |
| IP واقعی کاربران در گزارش‌ها (9Router) | IP ingress دیده می‌شود | هدر forwarding فقط از loopback پذیرفته می‌شود | «IP نمایش‌داده‌شده در گزارش‌ها IP سرور ایران‌سرور است.» |
| رابط فارسی (new-api) | ندارد | upstream فارسی ندارد؛ ترجمه یعنی تغییر کد و تعهدات AGPL | «پنل مدیریت به زبان انگلیسی است.» |
| پلاگین‌های JavaScript (new-api) | غیرفعال | در خود پروسه اجرا می‌شوند | «پلاگین‌های task در این نسخه فعال نیستند.» |
| چند نود و مقیاس افقی (هر سه) | پشتیبانی نمی‌شود | SQLite تک‌نویسنده | «برای بار بیشتر، پلن بالاتر را انتخاب کنید.» |

## Acceptance tests

Tests (هر تست برای هر سه نرم‌افزار اجرا می‌شود، مگر نام نرم‌افزار آمده باشد):

| Test | Expected result | Result | Date |
|---|---|---|---|
| Fresh provisioning from the panel | نمونه در کمتر از ۳ دقیقه Healthy می‌شود؛ هیچ پروسه‌ای با root نیست |   |   |
| Login with generated credentials and password change | ورود با رمز اولیه موفق؛ بعد از تغییر، رمز اولیه کار نمی‌کند؛ کوکی `Secure` است |   |   |
| new-api: setup قبل از عمومی شدن | قبل از ساخت Ingress، `/api/setup` کامل شده؛ بعد از آن `POST /api/setup` رد می‌شود؛ ثبت‌نام خاموش است |   |   |
| Core user flow end to end: اتصال یک ارائه‌دهنده یا کانال با کلید API (و در 9Router و OmniRoute یکی با OAuth و paste دستی)، ساخت combo یا گروه و کلید، درخواست streaming از Claude Code با fallback | پاسخ streaming بدون بافر؛ fallback به ارائه‌دهنده‌ی بعدی؛ مصرف در داشبورد ثبت می‌شود |   |   |
| Data persists after pod restart and node drain | تنظیمات، کلیدها و رمز باقی‌اند؛ هیچ فایلی خارج از والیوم و emptyDirها نوشته نشده؛ لاگ هشدار fallback مسیر داده (`~/.9router` یا `~/.omniroute`) وجود ندارد |   |   |
| Backup and restore | بازیابی از snapshot نمونه‌ی سالم برمی‌گرداند؛ `PRAGMA integrity_check` موفق؛ در OmniRoute اعتبارنامه‌های رمزشده با همان Secret خوانده می‌شوند |   |   |
| Upgrade to the next version and roll back | ارتقا و migration موفق؛ rollback با snapshot موفق |   |   |
| Unauthenticated access to API and admin paths is refused | `/v1/chat/completions` و `/v1/models` بدون کلید ۴۰۱؛ با هدرهای جعلی `Host: localhost`، `X-Forwarded-For: 127.0.0.1`، `X-Real-IP: 127.0.0.1` و `X-9r-Real-Ip: 127.0.0.1` هم ۴۰۱؛ مسیرهای مدیریتی بدون ورود رد می‌شوند |   |   |
| OmniRoute: LOCAL_ONLY از داخل کلاستر | یک پاد در namespace دیگر نمی‌تواند به سرویس وصل شود (NetworkPolicy)؛ `/api/acp/agents` و `/api/mcp/*` از اینترنت رد می‌شوند |   |   |
| Egress to internal ranges is blocked | ارائه‌دهنده یا کانال سفارشی با `http://169.254.169.254/`، IP سرویس کلاستر و IP خصوصی شکست می‌خورد؛ دانلود و اجرای باینری از والیوم با `noexec` شکست می‌خورد |   |   |
| Resource use stays within plan limits under the benchmark | peak حافظه زیر ۸۰٪ limit؛ بدون OOMKilled |   |   |
| Deprovisioning follows the retention policy | بعد از لغو، Ingress حذف و پاد ۰؛ بعد از ۷ روز PVC، snapshotها و Secretها حذف شده‌اند |   |   |

## Open questions and sign-off

- OmniRoute: حافظه‌ی واقعی برای ۵ کاربر تیمی چقدر است، و پلن تیمی با ۴GB عملی است یا باید ۸ تا ۱۰GB باشد؟ - DevOps و Product - قبل از Gate B (روی قیمت سند بازار اثر دارد)
- UID و سازگاری root فقط‌خواندنی در هر سه ایمیج (9Router: Next.js؛ OmniRoute: patch باندل در entrypoint) - DevOps - قبل از Gate B
- آیا storage class فعلی `mountOptions` با `noexec` را پشتیبانی می‌کند؟ - DevOps - قبل از Gate B
- آیا snapshot crash-consistent برای SQLite کافی است؟ - DevOps - قبل از Gate B
- آیا می‌توان قابلیت‌های اجرای فرمان و دانلود باینری را در 9Router و OmniRoute با تنظیم اولیه‌ی دیتابیس غیرفعال کرد، بدون اینکه مشتری دوباره روشنشان کند؟ - DevOps و Product - قبل از Gate B
- آیا ingress-nginx کلاستر خارج annotationهای buffering و timeout را برای هر Ingress مجاز می‌کند؟ - DevOps - قبل از Gate B
- تست دستی advisoryهایی که نسخه‌ی اصلاح ثبت نکرده‌اند: 9Router (GHSA-vjc7، GHSA-6g2f، GHSA-qvfm)، OmniRoute (GHSA-hf57 در بازه‌ی سراسری)، new-api (GHSA-5353) - Security - قبل از Gate B
- new-api: SQLite برای B2B با چند ده کاربر نهایی کافی است، یا PostgreSQL مدیریت‌شده (خارج از مدل یک کانتینر) لازم است؟ - DevOps و Product - قبل از تصمیم عرضه‌ی B2B
- new-api: AGPL و شرایط بند 7(b) (حفظ عبارت انتساب و پیوند GitHub در UI)، الزام انتشار کد در صورت تغییر (مثلاً ترجمه‌ی فارسی)، و گزینه‌ی مجوز تجاری - Legal - قبل از تصمیم عرضه‌ی B2B
- new-api: تعهدات قانونی اپراتور سرویس عمومی AI و درگاه‌های پرداخت خارجی برای مشتری ایرانی - Legal - قبل از تصمیم عرضه‌ی B2B
- مدت نگهداری داده بعد از لغو - Legal - قبل از Gate C

Sign-off:

| Role | Name | Date | Notes |
|---|---|---|---|
| Product |   |   |   |
| DevOps |   |   |   |
| Security |   |   |   |

## References

خلاصه‌های upstream: [9Router](research/upstream-v0.5.112-notes.md)، [OmniRoute](research/omniroute-v3.8.52-facts.md)، [new-api](research/new-api-v1.0.0-rc.48-facts.md)

- 9Router Dockerfile، docker-compose.yml، .env.example، custom-server.js - https://github.com/decolua/9router/tree/v0.5.112 - v0.5.112
- 9Router src/dashboardGuard.js، src/lib/dataDir.js، src/lib/db/repos/settingsRepo.js، src/lib/auth/dashboardSession.js، src/shared/utils - https://github.com/decolua/9router/tree/v0.5.112/src - v0.5.112
- 9Router security advisories - https://github.com/decolua/9router/security/advisories - دیده‌شده 2026-11-04
- OmniRoute Dockerfile، docker-compose*.yml، .env.example - https://github.com/cheaper-inference/OmniRoute/tree/v3.8.52 - v3.8.52 (commit `ad6f33f66bda34eba98645d3bfdabbde294bc843`)
- OmniRoute docs/guides/DOCKER_GUIDE.md، docs/ops/MONITORING_GUIDE.md، docs/ops/VM_DEPLOYMENT_GUIDE.md - https://github.com/cheaper-inference/OmniRoute/tree/v3.8.52/docs - v3.8.52
- OmniRoute src/server/authz/routeGuard.ts، src/lib/dataPaths.ts، scripts/build/bootstrap-env.mjs - https://github.com/cheaper-inference/OmniRoute/tree/v3.8.52 - v3.8.52
- OmniRoute security advisories - https://github.com/cheaper-inference/OmniRoute/security/advisories - دیده‌شده 2026-11-04
- new-api Dockerfile، docker-compose.yml، .env.example، NOTICE، README.en.md - https://github.com/QuantumNous/new-api/tree/v1.0.0-rc.48 - v1.0.0-rc.48 (commit `706144769e5bed5a47b78721e3bb11da3cf4c0b9`)
- new-api src/common/init.go، src/common/trusted_proxies.go، src/controller/setup.go، src/docs/authentication.md - https://github.com/QuantumNous/new-api/tree/v1.0.0-rc.48 - v1.0.0-rc.48
- new-api security advisories - https://github.com/QuantumNous/new-api/security/advisories - دیده‌شده 2026-11-04
- Docker Hub tags - https://hub.docker.com/r/decolua/9router/tags ، https://hub.docker.com/r/diegosouzapw/omniroute/tags ، https://hub.docker.com/r/calciumion/new-api/tags - دیده‌شده 2026-11-04

# new-api (QuantumNous/new-api): یافته‌های upstream برای مشخصات استقرار روی Kubernetes

گردآوری‌شده در 2026-11-04. درخت سورسی که خوانده شد: tarball تگ `v1.0.0-rc.48` (https://codeload.github.com/QuantumNous/new-api/tar.gz/refs/tags/v1.0.0-rc.48). هیچ چیزی build یا اجرا نشد. در این فایل، «src/» به همان پوشه اشاره دارد.
«نامشخص» یعنی آن را در upstream پیدا نکردیم یا نخواندیم. هر چیزی که با «(برداشت ما)» مشخص شده، خوانش ما است، نه گفته‌ی upstream.

## 1. نسخه، ریتم انتشار، مجوز، محبوبیت

- **آخرین نسخه: `v1.0.0-rc.48`.** `releases/latest` در GitHub همین را برمی‌گرداند (`prerelease: false`). زمان انتشار 2026-11-04T15:40:15Z. کامیت تگ `706144769e5bed5a47b78721e3bb11da3cf4c0b9`، تاریخ committer برابر 2026-11-04T14:58:20Z، پیام "fix(auth): 校验 Redis 鉴权缓存完整性 (#8200)" (بررسی یکپارچگی کش احراز هویت Redis). منبع: `GET /repos/QuantumNous/new-api/releases/latest`، `/tags`، `/commits/v1.0.0-rc.48`.
  - نکته‌ی احتیاط: همه‌ی نسخه‌ها از 2026-04-28 به بعد نام `v1.0.0-rc.N` دارند ولی به‌عنوان prerelease علامت **نخورده‌اند**. آخرین نسخه‌ی semver ساده `v0.13.2` (2026-04-27) است. `v1.0.0-alpha.1` (2026-04-28) تنها نسخه‌ای است که prerelease علامت خورده. منبع: `GET /releases?per_page=100` (صفحه‌های 1-3).
  - `src/VERSION` در tarball خالی است. CI نسخه را هنگام build تزریق می‌کند (ldflags در `src/Dockerfile`: `-X common.Version=$(cat VERSION)`).
  - یادداشت تغییر ناسازگار (breaking change) در متن release نسخه‌ی rc.48: کش‌های user، token و session در Redis اکنون امضا می‌شوند و همه‌ی نودهای یک استقرار چندنودی باید هم‌زمان ارتقا داده شوند.
- **ریتم انتشار (8 نسخه‌ی آخر):** rc.48 در 2026-11-04، rc.47 در 2026-10-25، rc.46 در 2026-10-21، rc.45 در 2026-10-17، rc.44 در 2026-10-12، rc.43 در 2026-10-10، rc.42 در 2026-10-08، rc.41 در 2026-09-30. یعنی تقریباً هر 2-10 روز یک نسخه. همه روی شاخه‌ی `main` هستند.
- **مجوز:** GNU AGPL v3.0 (`spdx_id: AGPL-3.0`)، به‌همراه شرایط افزوده طبق بخش 7 از AGPLv3 (بخش 13 همین سند را ببینید). منابع: فیلد `license` در API مخزن، `src/LICENSE`، `src/NOTICE`.
- **ستاره‌ها:** 51,365. فورک‌ها: 12,472. بایگانی (archived) نشده. صفحه‌ی اصلی https://www.newapi.ai. منبع: `GET /repos/QuantumNous/new-api`.

## 2. ایمیج کانتینر

- **رجیستری و تگ:** Docker Hub `calciumion/new-api:v1.0.0-rc.48` (تأییدشده). CI فقط به Docker Hub پوش می‌کند و GHCR ندارد. تگ‌های هر معماری `-amd64` و `-arm64` در یک index چندمعماری ترکیب می‌شوند. ایمیج‌ها با cosign امضا شده‌اند و با SBOM و provenance `mode=max` ساخته می‌شوند. منبع: `src/.github/workflows/docker-build.yml`.
  - `latest` با هر push تگ، از جمله تگ‌های rc، دوباره جابه‌جا می‌شود. README توصیه می‌کند نسخه را pin کنید (`src/README.en.md` خط 251).
- **digest ایندکس (v1.0.0-rc.48):** `sha256:51401a46510bf110ffafdf2cd7177e0b80bbcf02439e69b665c696f330e87ae5` (media type از نوع OCI image index). زمان push برابر 2026-11-04T15:46:48Z.
- **digest ایمیج amd64:** `sha256:bb3e67e3c3f06278fcd801bef69499862e2de79db88c627816d0cd6277b5ed40`، حجم فشرده 78,044,763 B (حدود 74.4 MiB).
- **digest ایمیج arm64:** `sha256:8b34b5101f42c5039249a08dfa8f6ed8bc15743996bd636a8895c7869d38fa37`، حجم 75,664,967 B.
- منابع digest: `https://hub.docker.com/v2/repositories/calciumion/new-api/tags?page_size=8&ordering=last_updated` و `/tags/v1.0.0-rc.48`.
- **Dockerfile** (`src/Dockerfile`):
  - مراحل (stages): `oven/bun:1.4.4@sha256:1d22…` رابط وب را build می‌کند، سپس `golang:1.26.10-alpine@sha256:9ce2…` باینری Go را build می‌کند (`CGO_ENABLED=0`)، و بعد مرحله‌ی runtime می‌آید.
  - ایمیج پایه‌ی runtime: **`debian:bookworm-slim@sha256:f06537653ac770703bc45b4b113475bd402f451e85223f0f2837acbf89ab020a`**.
  - بسته‌های apt: `ca-certificates tzdata libasan8 wget`.
  - مسیر باینری: `/new-api`. فایل‌های مجوز در `/licenses/` کپی می‌شوند.
  - `EXPOSE 3000`
  - `WORKDIR /data`
  - `ENTRYPOINT ["/new-api"]`، **بدون CMD**
  - **دستور `USER` وجود ندارد، پس کانتینر به‌طور پیش‌فرض با root (UID 0) اجرا می‌شود.** هیچ UID غیر root در upstream تعریف نشده است.
  - **بدون `VOLUME`**
  - **بدون `ENV`** در مرحله‌ی runtime
  - **بدون `HEALTHCHECK`.** فایل compose یک healthcheck تعریف می‌کند (بخش 7).
- **فلگ‌های CLI** (`src/common/init.go`): `--port` (پیش‌فرض 3000؛ متغیر محیطی `PORT` آن را override می‌کند، `src/main.go` را ببینید)، `--log-dir` (پیش‌فرض `./logs`)، `--version`، `--help`.
- **مسیرهایی که پروسه در آن‌ها می‌نویسد (بر اساس کد):**
  - پایگاه‌داده‌ی SQLite با نام `one-api.db`، نسبت به پوشه‌ی کاری. یعنی `/data/one-api.db`، به‌علاوه‌ی فایل‌های WAL و SHM.
  - پوشه‌ی لاگ `./logs` که به `/data/logs` می‌رسد. پروسه آن را با `os.Mkdir(..., 0777)` می‌سازد.
  - `os.TempDir()` (`/tmp`) برای کش بدنه‌ی درخواست روی دیسک (`common/disk_cache.go`، فقط وقتی فعال باشد؛ پیش‌فرض `DiskCacheEnabled` برابر false است) و برای فایل‌های موقت (`relay/channel/dify/relay-dify.go`، `common/utils.go`).
  - `./pprof/` فقط وقتی `ENABLE_PPROF=true` باشد.
  - امکان اجرای non-root و `readOnlyRootFilesystem` (برداشت ما): یک PVC قابل‌نوشتن در `/data` به‌علاوه‌ی یک emptyDir در `/tmp` باید کافی باشد. **آزمایش نشده است.**

## 3. Helm chart / manifestهای Kubernetes

- **در upstream وجود ندارد.** نه `Chart.yaml`، نه `kind: Deployment|StatefulSet|Service`، و نه پوشه‌ی k8s در درخت تگ.
- فایل‌های استقرار موجود در upstream: `src/docker-compose.yml`، `src/docker-compose.dev.yml`، یک systemd unit به نام `src/new-api.service`، و راهنمای پنل BaoTa در `src/docs/installation/BT.md`.

## 4. docker-compose و پایگاه‌داده‌ها

- **سرویس‌های `src/docker-compose.yml`:**
  - `new-api`: `calciumion/new-api:latest`، `command: --log-dir /app/logs`، volumeهای `./data:/data` و `./logs:/app/logs`، پورت 3000.
  - `redis`: `redis:latest --requirepass 123456`
  - `postgres`: `postgres:15`، کاربر root، رمز عبور 123456
  - گزینه‌های جایگزینِ کامنت‌شده: `mysql:8.2` و `clickhouse/clickhouse-server:24.8` (فقط برای لاگ‌ها).
- **سرویس‌های خارجی اختیاری‌اند.** اگر `SQL_DSN` تنظیم نشده باشد از SQLite استفاده می‌شود (جدول README: "Main database | SQLite, MySQL ≥ 5.7.8, or PostgreSQL ≥ 9.6"؛ "Cache | Optional Redis plus in-memory caching"). کد هم با این هم‌خوان است: `chooseDB()` در `src/model/main.go` وقتی `SQL_DSN` خالی باشد یا با `local` شروع شود به SQLite برمی‌گردد. `src/common/redis.go` وقتی `REDIS_CONN_STRING` خالی باشد Redis را غیرفعال می‌کند.
- **SQLite برای production:** README در بخش quick start، SQLite را به‌صورت "a single instance with SQLite" (یک نمونه‌ی تکی با SQLite) معرفی می‌کند و آن را جزو پایگاه‌داده‌های اصلی پشتیبانی‌شده فهرست می‌کند. **هیچ گفته‌ای در upstream استفاده از SQLite در production را تأیید یا منع نمی‌کند.** فراتر از این: نامشخص.
  - کد برای هم‌زمانی، WAL، `busy_timeout(30000)` و `_txlock=immediate` را تنظیم می‌کند (کامنت روی `SQLitePath` در `src/common/database.go`).
  - درایور: `github.com/glebarez/sqlite` که تماماً با Go نوشته شده (modernc).
- **محل فایل SQLite:**
  - DSN پیش‌فرض: `one-api.db?_pragma=busy_timeout(30000)&_pragma=journal_mode(WAL)&_txlock=immediate`، نسبت به پوشه‌ی کاری، پس `/data/one-api.db`.
  - تغییر مسیر: `SQLITE_PATH` (`src/common/init.go`). این مقدار کل DSN را جایگزین می‌کند، پس یک مقدار سفارشی آن pragmaها را از دست می‌دهد مگر اینکه دوباره اضافه‌شان کنید (برداشت ما از کد).
- **پوشه‌ی لاگ:**
  - پیش‌فرض `./logs` که در ایمیج برابر `/data/logs` است، یعنی روی PVC داده.
  - compose از `--log-dir /app/logs` استفاده می‌کند.
  - مقدار خالی برای `--log-dir` لاگ‌نویسی در فایل را غیرفعال می‌کند (`if *LogDir != ""` در `src/logger/logger.go` و `src/common/init.go`).
- **چندنودی:** همه‌ی نودها پایگاه‌داده‌ی اصلی، `SESSION_SECRET` و `CRYPTO_SECRET` را مشترک دارند، وقتی Redis مشترک داشته باشند (`src/docs/authentication.md`، `src/README.en.md`). نود slave از `NODE_TYPE=slave` استفاده می‌کند.

## 5. متغیرهای محیطی

منابع: `src/common/init.go`، `src/common/redis.go`، `src/model/main.go`، `src/main.go`، `src/.env.example`، `src/docker-compose.yml`، `src/README.en.md`.

| متغیر | پیش‌فرض (در کد) | توضیحات / نکته‌ها |
|---|---|---|
| `PORT` | 3000 (از طریق `--port`) | |
| `SQL_DSN` | تنظیم‌نشده، پس SQLite | `postgres://`/`postgresql://` پایگاه‌داده‌ی PG را انتخاب می‌کند. `local*` پایگاه‌داده‌ی SQLite را انتخاب می‌کند. ClickHouse برای پایگاه‌داده‌ی اصلی پذیرفته نمی‌شود. هر مقدار دیگری MySQL در نظر گرفته می‌شود (`parseTime=true` به آن اضافه می‌شود). |
| `LOG_SQL_DSN` | تنظیم‌نشده، پس همان پایگاه‌داده‌ی اصلی | می‌تواند ClickHouse باشد. `LOG_SQL_CLICKHOUSE_TTL_DAYS` (0 یعنی بدون حذف). |
| `SQLITE_PATH` | بخش 4 را ببینید | |
| `SQL_MAX_IDLE_CONNS` / `SQL_MAX_OPEN_CONNS` / `SQL_MAX_LIFETIME` | 100 / 1000 / 60 s | |
| `REDIS_CONN_STRING` | تنظیم‌نشده، پس Redis خاموش است | روشن بودن Redis، `MEMORY_CACHE_ENABLED=true` را اجباری می‌کند (`src/main.go` خط 82-85). پیش‌فرض `REDIS_POOL_SIZE` برابر 10 است. |
| `SESSION_SECRET` | **یک UUID تصادفی در هر بار شروع پروسه** (`src/common/constants.go:35`) | اگر تنظیم نشود، هر ری‌استارت لاگین‌ها، جریان‌های احراز هویت موقت و security proofها را باطل می‌کند. مقدار تحت‌اللفظی `random_string` باعث می‌شود پروسه با خطای fatal خارج شود. README: "set a persistent random `SESSION_SECRET` (generate one with `openssl rand -hex 32`)". |
| `CRYPTO_SECRET` | = `SESSION_SECRET` | برای MACهای یکپارچگی کش احراز هویت و URLهای capability مربوط به task-artifact استفاده می‌شود. چرخاندن (rotate) آن، URLهای artifact صادرشده را باطل می‌کند (`src/docs/plugin-api/README.md`). |
| `NODE_TYPE` | master (هر مقداری غیر از `slave`) | |
| `SYNC_FREQUENCY` | 60 s | |
| `MEMORY_CACHE_ENABLED` | false (اگر Redis فعال باشد true) | |
| `BATCH_UPDATE_ENABLED` / `BATCH_UPDATE_INTERVAL` | false / 5 s | compose آن را true می‌کند. |
| `TZ` | پیش‌فرض ایمیج (نامشخص) | compose و README از `Asia/Shanghai` استفاده می‌کنند. tzdata نصب است. |
| `DEFAULT_LANGUAGE` | en | en، zh-CN یا zh-TW، برای لاگ‌ها، ایمیل‌ها و اعلان‌ها. |
| `ERROR_LOG_ENABLED` | false | compose آن را true می‌کند. |
| `TRUSTED_PROXIES` | تنظیم‌نشده، پس loopback، RFC1918 و fc00::/7 مورد اعتمادند، همراه با یک هشدار هنگام شروع | بخش 8 را ببینید. |
| `SESSION_COOKIE_SECURE` | false | **پیش‌فرض ناامن برای HTTPS.** مقدار false، OriginGuard مربوط به refresh/logout را غیرفعال می‌کند و "仅用于本地 HTTP" (فقط برای HTTP محلی) است. آن را true کنید. |
| `SESSION_COOKIE_TRUSTED_URL` | تنظیم‌نشده | وقتی Secure=true باشد لازم است: originهای دقیق HTTPS، بدون wildcard. |
| `PASSWORD_LOGIN_ENCRYPTION_ENABLED` | false | |
| `ACCOUNT_PASSWORD_HASH_ALGORITHM` | نامشخص (نمونه argon2id را نشان می‌دهد؛ کامنت، مهاجرت از bcrypt به argon2id را توضیح می‌دهد) | |
| `USER_SESSION_ACTIVE_LIMIT` / `_ISSUANCE_LIMIT` / `_ISSUANCE_WINDOW_SECONDS` / `_REVOKED_RETENTION_DAYS` / `_HOURLY_ALERT_THRESHOLD` | 50 / 100 / 86400 / 7 / 5000 (طبق کامنت‌های compose و .env.example) | |
| `TLS_INSECURE_SKIP_VERIFY` | false | اگر true باشد، بررسی TLS برای همه‌ی ارتباطات خروجی نادیده گرفته می‌شود. |
| `SMTP_STARTTLS_ENABLE` / `SMTP_INSECURE_SKIP_VERIFY` | false / false | |
| `ENABLE_PPROF` | false | اگر true باشد، **pprof بدون احراز هویت روی 0.0.0.0:8005 گوش می‌دهد** (`src/main.go`). |
| `DEBUG` | false | |
| `RELAY_TIMEOUT` | 0 (نامحدود) | |
| `STREAMING_TIMEOUT` | 300 s | کامنت compose می‌گوید "default 120s". کد می‌گوید 300. |
| `RELAY_RESPONSE_HEADER_TIMEOUT` | 1800 s | |
| `RELAY_IDLE_CONN_TIMEOUT` | 90 | |
| `RELAY_HTTP2_PING_IDLE_TIMEOUT` / `_PING_TIMEOUT` | 0 (خاموش) / 15 | |
| `RELAY_MAX_IDLE_CONNS` / `_PER_HOST` | 500 / 100 | |
| `MAX_REQUEST_BODY_MB` | 128 | |
| `ANONYMOUS_REQUEST_BODY_LIMIT_KB` | 512 | |
| `MAX_FILE_DOWNLOAD_MB` | 64 | |
| `STREAM_SCANNER_MAX_BUFFER_MB` | 128 | |
| `SHUTDOWN_TIMEOUT_SECONDS` | 120 | تخلیه‌ی آرام (graceful drain) برای SSE؛ پس `terminationGracePeriodSeconds` را دست‌کم برابر این مقدار بگذارید. |
| `GLOBAL_API_RATE_LIMIT_ENABLE` / `_NUM` / `_DURATION` | true / 360 / 180 s | |
| `GLOBAL_WEB_RATE_LIMIT_*` | true / 120 / 180 s | |
| `CRITICAL_RATE_LIMIT_*` | true / 20 / 1200 s | |
| `GLOBAL_STATIC_RATE_LIMIT_*` | false / 1000 / 180 | |
| `SEARCH_RATE_LIMIT_*` | true / 10 / 60 | |
| `UPDATE_TASK` | true | |
| `TASK_PLUGIN_ENABLED` | true | |
| `TASK_TIMEOUT_MINUTES` | 4320 | |
| `TASK_POLL_MAX_FAILURES` | 20 | |
| `GENERATE_DEFAULT_TOKEN` | false | |
| `GEMINI_SAFETY_SETTING` / `COHERE_SAFETY_SETTING` | BLOCK_NONE / NONE | |
| `DIFY_DEBUG` | true | |
| `FORCE_STREAM_OPTION` | true | |
| `FRONTEND_BASE_URL` | تنظیم‌نشده | |
| `NODE_NAME` | پیش‌فرض نامشخص | شناسه‌ی نود در audit log. |
| `TRUSTED_REDIRECT_DOMAINS` | تنظیم‌نشده | فهرست مجاز (allowlist) ریدایرکت پس از موفقیت/لغو پرداخت. |
| `GOOGLE_ANALYTICS_ID` / `UMAMI_WEBSITE_ID` / `UMAMI_SCRIPT_URL` | تنظیم‌نشده | اسکریپت‌های شخص ثالث را به UI تزریق می‌کنند. |
| `PYROSCOPE_*` | تنظیم‌نشده | |
| `LINUX_DO_TOKEN_ENDPOINT` / `LINUX_DO_USER_ENDPOINT` | در `.env.example` تنظیم شده (کامنت نشده) | |

**اولین حساب ادمین:**
- **در این تگ هیچ root/123456 پیش‌فرضی وجود ندارد.** `createRootAccountIfNeed()` (که root/123456 را می‌سازد) هنوز در `src/model/main.go` هست ولی هیچ‌جا فراخوانی نمی‌شود (grep فقط تعریف آن را نشان می‌دهد).
- به‌جای آن، یک ویزارد راه‌اندازی اجرا می‌شود: `GET/POST /api/setup` بدون احراز هویت (`src/router/api-router.go` خط 26-27، `src/controller/setup.go`). درخواست POST کاربر root را با نام کاربری و رمز عبور داده‌شده می‌سازد (نام کاربری حداکثر 12 کاراکتر)، به‌علاوه‌ی `SelfUseModeEnabled` و `DemoSiteEnabled`. پس از کامل شدن راه‌اندازی (`constant.Setup`) این درخواست رد می‌شود.
- **ریسک: روی یک نمونه‌ی تازه، هر کسی که اول به `/api/setup` برسد root می‌شود.** راه‌اندازی را پیش از عمومی شدن ingress کامل کنید، یا `/api/setup` را در ingress مسدود کنید (برداشت ما).

**سایر پیش‌فرض‌های ناامن یا نمونه:**
- رمزهای عبور compose برای Postgres، Redis، MySQL و ClickHouse برابر `123456` است.
- `SESSION_SECRET` وقتی تنظیم نشده باشد موقت (ephemeral) است.
- `SESSION_COOKIE_SECURE` برابر false است.
- `TRUSTED_PROXIES` به همه‌ی بازه‌های خصوصی اعتماد می‌کند.
- ثبت‌نام باز است (بخش 8).

## 6. راهنمای حافظه / CPU

- **نامشخص. هیچ راهنمایی درباره‌ی اندازه‌ی حافظه، CPU یا تعداد replica** در فایل‌های README، `docs/` یا `.env.example` پیدا نشد.
- فقط تنظیمات غیرمستقیم: `MAX_REQUEST_BODY_MB=128`، `STREAM_SCANNER_MAX_BUFFER_MB=128`، `MAX_FILE_DOWNLOAD_MB=64`، کش دیسک در `setting/performance_setting/config.go`، و `SQL_MAX_OPEN_CONNS=1000`.

## 7. سلامت، متریک‌ها، لاگ‌ها

- **سلامت (Health):** `GET /api/status` عمومی است (`src/router/api-router.go:28`).
  - handler آن (`GetStatus` در `src/controller/misc.go`) پاسخ را از تنظیمات درون حافظه می‌سازد و **هیچ فراخوانی DB یا Redis ندارد**. مقدار `{"success": true, ...}` را برمی‌گرداند، پس نشان می‌دهد پروسه زنده است ولی آماده بودن پایگاه‌داده را ثابت نمی‌کند.
  - healthcheck در compose: `wget -q -O - http://localhost:3000/api/status | grep -o '"success":\s*true'`.
  - `GET /api/uptime/status` هم عمومی است (وضعیت Uptime-Kuma).
  - `GET /api/status/test` نیاز به دسترسی ادمین دارد.
- **متریک‌ها: اپلیکیشن هیچ endpoint ‏Prometheus `/metrics` ارائه نمی‌دهد.** `prometheus/common` فقط برای scrape کردن سرورهای inference در upstream استفاده می‌شود (`src/controller/channel_inference.go`).
  - pprof فقط با `ENABLE_PPROF=true` روی `:8005` در دسترس است.
  - push به Pyroscope اختیاری است.
  - `/api/perf-metrics` یک JSON از عملکرد مدل‌ها در سطح اپلیکیشن است که با یک تنظیم ماژول UI کنترل می‌شود.
- **فرمت لاگ:** متن ساده، نه JSON.
  - خطوط اپلیکیشن: `[LEVEL] 2006/01/02 - 15:04:05 | <request-id or SYSTEM> | msg` (`src/logger/logger.go`).
  - خطوط دسترسی (access): `[GIN] ... | status | latency | ip | method path` (`src/middleware/logger.go`).
- **فایل لاگ:** لاگ‌ها به stdout/stderr **و همچنین** به `<log-dir>/oneapi-YYYYMMDDHHMMSS.log` می‌روند. log-dir پیش‌فرض `./logs` است که همان **`/data/logs`، یعنی روی volume داده** است.
  - پس از حدود 1,000,000 خط لاگ، فایل جدیدی شروع می‌شود (`maxLogCount`).
  - upstream فایل‌های قدیمی را خودکار حذف نمی‌کند. یک API ادمین می‌تواند آن‌ها را حذف کند (`DELETE /api/performance/logs`، `controller/performance.go`).
  - برای اینکه لاگ‌ها روی PVC نروند، `--log-dir=` (خالی) بدهید یا آن را به یک emptyDir اشاره دهید.
- لاگ‌های درخواست و مصرف هم در DB ذخیره می‌شوند (DB اصلی یا `LOG_SQL_DSN`).

## 8. مدل احراز هویت و اعتماد به هدرها

- **نقش‌ها:** guest 0، common 1، admin 10، root 100 (`src/common/constants.go:202-205`).
- **ورود ادمین:** نام کاربری و رمز عبور. اختیاری: 2FA (TOTP و کدهای پشتیبان)، passkey (WebAuthn)، و یک مرحله‌ی تأیید تکمیلی "secure verification" برای عملیات حساس.
- **نشست‌ها (Sessions):** جدول `user_sessions` سمت سرور، یک access token به‌همراه یک کوکی refresh (`src/docs/authentication.md`). توکن‌های دسترسی شخصی هم پشتیبانی می‌شوند (`/api/user/self/access_tokens`).
- **کلیدهای API:**
  - رکوردهای `Token` که به‌صورت `sk-<key>` ارائه می‌شوند (`src/model/token.go`).
  - فیلدهای هر کلید: وضعیت، تاریخ انقضا (`-1` یعنی هرگز)، `remain_quota`، `unlimited_quota`، فهرست مجاز مدل‌ها، `allow_ips`، گروه، retry بین گروه‌ها، `allow_user_quota_query`.
- **صورتحساب / سهمیه (Billing / quota):**
  - هر کاربر یک سهمیه دارد. کاربران جدید `QuotaForNewUser = 0` می‌گیرند.
  - ادمین‌ها قیمت‌گذاری و ضرایب مدل‌ها، گروه‌ها، کدهای redemption و اشتراک‌ها را تنظیم می‌کنند.
  - شارژ حساب و پرداخت: Stripe، Creem، Waffo، Waffo Pancake، Epay (`src/controller/topup_*.go`، `subscription_payment_*.go`).
- **ثبت‌نام به‌طور پیش‌فرض باز است:** `RegisterEnabled=true`، `PasswordRegisterEnabled=true`، `EmailVerificationEnabled=false`، `TurnstileCheckEnabled=false` (`src/common/constants.go:67-76`). این‌ها در UI ادمین قابل تغییرند و در جدول options پایگاه‌داده ذخیره می‌شوند.
- **گزینه‌های ورود** (`src/oauth/` و router):
  - تأیید ایمیل و بازنشانی رمز عبور (SMTP)
  - OAuth از طریق GitHub، Discord، OIDC، LinuxDO و Telegram
  - ارائه‌دهندگان OAuth سفارشی عمومی (`/api/custom-oauth-provider`)
  - WeChat (از طریق یک سرور احراز هویت WeChat خارجی)
  - Cloudflare Turnstile
- **اعتماد به هدرها** (`src/common/trusted_proxies.go`، `src/middleware/trusted_proxies.go`، `src/docs/authentication.md` بخش "可信代理与 IP 限流" (پراکسی‌های مورد اعتماد و محدودسازی نرخ بر اساس IP)):
  - از `SetTrustedProxies` در gin استفاده می‌کند. با `RemoteIPHeaders` پیش‌فرض gin، هدرهای `X-Forwarded-For` و `X-Real-IP` فقط از peerهای مورد اعتماد پذیرفته می‌شوند. upstream پیش‌فرض‌های gin را override نمی‌کند.
  - **پیش‌فرض در صورت تنظیم نشدن: اعتماد به `127.0.0.0/8`، `::1`، `10.0.0.0/8`، `172.16.0.0/12`، `192.168.0.0/16`، `fc00::/7`.** مستندات به ریسک باقی‌مانده اذعان می‌کنند: هر میزبان یا کانتینری در همان شبکه‌ی خصوصی می‌تواند این هدرها را جعل کند.
  - در Kubernetes این یعنی هر podی در یک pod CIDR از بازه‌ی 10.x یا 172.16/12 (برداشت ما). `TRUSTED_PROXIES` را روی CIDR یا IPهای podهای ingress-nginx، یا روی `none` تنظیم کنید. بازه‌ی CNI ‏`100.64.0.0/10` باید صریحاً فهرست شود (مستندات این را می‌گویند).
  - IP کلاینت مبنای rate limitها، `allow_ips` توکن‌ها، و رکوردهای نشست و audit است.
  - OriginGuard در حالت secure به هدر `X-Forwarded-Proto` ارسالی از کلاینت اعتماد نمی‌کند.
- **اعتماد به loopback:** فقط loopback به‌عنوان بخشی از فهرست پراکسی پیش‌فرض بالا. هیچ راه دور زدن احراز هویت از طریق loopback پیدا نشد. فراتر از grep روی `IsLoopback`/`IsPrivate` (که فقط در ابزارهای IP و کد SSRF استفاده می‌شوند): نامشخص.

## 9. قابلیت‌های پرریسک

- **Base URL کانال‌ها: سطح حمله‌ی SSRF، تحت کنترل admin/root.**
  - کلاینت relay عمداً محافظت SSRF را روی base URLهای provider اعمال **نمی‌کند**. کامنت در `GetHttpClient` در `src/service/http_client.go`: base URLهای provider توسط root/اپراتور مدیریت می‌شوند و "may legitimately point at private networks" (ممکن است به‌طور مشروع به شبکه‌های خصوصی اشاره کنند). فقط ریدایرکت‌ها بررسی می‌شوند (`checkRedirect`).
  - پراکسی جداگانه برای هر کانال (http/socks) پشتیبانی می‌شود.
  - نتیجه: یک ادمین tenant می‌تواند pod را وادار کند آدرس‌های داخلی کلاستر را فراخوانی کند. NetworkPolicy برای egress لازم است (برداشت ما).
- **دریافت URLهای ارائه‌شده توسط کاربر** (URLهای تصویر، فایل یا ویدیو در درخواست‌ها، webhookها، اعلان‌های Bark/Gotify، دانلودها) از کلاینت محافظت‌شده در برابر SSRF عبور می‌کنند (`src/service/protected_fetch_client.go`، `download.go`، `webhook.go`، `user_notify.go`).
  - پیش‌فرض‌های `fetch_setting`: محافظت روشن، IPهای خصوصی مسدود (فهرست‌های 0.0.0.0/8 و 100.64/10 در `src/common/ssrf_protection.go` هستند)، پورت‌های مجاز 80، 443، 8080 و 8443، و فیلتر IP روی دامنه‌ها هم اعمال می‌شود.
  - ادمین‌ها می‌توانند این تنظیمات را در UI شل یا غیرفعال کنند.
  - حالت worker (`DoWorkerRequest`) درخواست‌ها را از طریق یک worker خارجی پراکسی می‌کند.
- **webhookهای خروجی:** webhook اعلان کاربر همراه با secret (`src/service/webhook.go`).
- **webhookهای ورودی بدون احراز هویت:** `POST /api/stripe/webhook`، `/api/creem/webhook`، `/api/waffo/webhook`، `/api/waffo-pancake/webhook/:env`، هر کدام با محدودیت بدنه‌ی درخواست ناشناس.
- **پرداخت‌ها:** Stripe، Creem، Waffo، Waffo Pancake، Epay.
- **پلاگین‌های task: کد JavaScript قابل آپلود که درون همان پروسه اجرا می‌شود** (موتور JS تعبیه‌شده `github.com/Calcium-Ion/moejs`).
  - آپلود و فعال‌سازی فقط برای root مجاز است (`/api/plugin/task`، `middleware.RootAuth()`).
  - marketplace از `https://www.newapi.ai/api/v1/plugins/index.json` یا `https://raw.githubusercontent.com/QuantumNous/new-api-plugins/main/index.json` دریافت می‌کند، و منابع قابل پیکربندی‌اند (`src/setting/task_plugin.go`).
  - میزبان، URLهایی را که پلاگین می‌سازد در برابر میزبان کانال اعتبارسنجی می‌کند (`src/docs/plugin-api/README.md`).
  - استحکام sandbox جاوااسکریپت: نامشخص (ممیزی نشده).
- **ایجاد پروسه:** فقط `xdg-open`/`open` در `common/utils.go` (یک helper به نام `OpenBrowser`). اینکه مسیر سرور آن را فراخوانی می‌کند یا نه: نامشخص (فرض بر استفاده در دسکتاپ/Electron). هیچ استفاده‌ی دیگری از `os/exec` نیست.
- **آپلود فایل:** هیچ handler از نوع multipart با `FormFile` در `controller/` وجود ندارد. بدنه‌های درخواست تا 128 MB برای relay پذیرفته می‌شوند. آپلودهای Dify به فایل‌های موقت می‌روند.
- **سایر فراخوانی‌های خروجی پیش‌فرض:** `api.github.com/repos/openai/codex/releases/latest` (`service/codex_models.go`)، endpointهای OAuth در GitHub، ایندکس marketplace پلاگین‌ها، و اسکریپت‌های Umami/GA در صورت پیکربندی. فهرست کامل فراخوانی‌های phone-home پیش‌فرض: نامشخص.
- **تزریق analytics:** `UMAMI_*` و `GOOGLE_ANALYTICS_ID` اسکریپت‌ها را به `index.html` تزریق می‌کنند. HTML همیشه نشانگر کامنت `<!--Umami QuantumNous-->` را دریافت می‌کند.

## 10. Streaming / ingress

- پاسخ‌های SSE هدرهای `Content-Type: text/event-stream`، `Cache-Control: no-cache`، `Connection: keep-alive` و `X-Accel-Buffering: no` را تنظیم می‌کنند و پینگ keep-alive می‌فرستند (`src/relay/helper/common.go`).
- gzip عمداً به‌صورت سراسری اعمال نمی‌شود چون "This will cause SSE not to work!!!" (این کار باعث می‌شود SSE کار نکند) (`src/main.go`). فقط روی `/api` اعمال می‌شود.
- ارتقای اتصال به WebSocket: `GET /v1/realtime` و `GET /v1/responses` (جدول قابلیت‌های README).
- README: "configure your reverse proxy for streaming and WebSocket upgrades" (reverse proxy را برای streaming و ارتقای WebSocket پیکربندی کنید).
- **هیچ پیکربندی nginx یا ingress در مخزن ارائه نشده است.** سایت مستندات خارجی (docs.newapi.ai) خوانده نشد: نامشخص.
- timeoutهای مرتبط اپلیکیشن: `STREAMING_TIMEOUT` برابر 300 s، `RELAY_RESPONSE_HEADER_TIMEOUT` برابر 1800 s، `SHUTDOWN_TIMEOUT_SECONDS` برابر 120 s. timeoutهای read و send در ingress باید از این‌ها بیشتر باشند (برداشت ما).
- TLS: README می‌گوید کنسول را پشت HTTPS قرار دهید و `SESSION_COOKIE_SECURE=true` و `SESSION_COOKIE_TRUSTED_URL=https://<public-origin>` را تنظیم کنید.

## 11. هشدارهای امنیتی (Security advisories)

منابع: `GET /repos/QuantumNous/new-api/security-advisories?state=published&per_page=100` (15 مورد) و `GET /advisories?affects=github.com/QuantumNous/new-api` (14 مورد؛ اکوسیستم `go`، همان 14 مورد).

| GHSA | CVE | شدت | تاریخ انتشار (در repo) | نسخه‌های آسیب‌پذیر | نسخه‌ی اصلاح‌شده | خلاصه | آیا rc.48 را درگیر می‌کند؟ |
|---|---|---|---|---|---|---|---|
| GHSA-xxv6-m6fx-vfhh | CVE-2025-59146 | بالا | 2025-10-09 | <= v0.9.0.4 | v0.9.0.5 | SSRF با کاربر احرازهویت‌شده | خیر (در پایگاه‌داده‌ی global نیست) |
| GHSA-9f46-w24h-69w4 | CVE-2025-62155 | بالا | 2025-11-23 | <= v0.9.5 | v0.9.6 | دور زدن محافظت SSRF | خیر |
| GHSA-299v-8pq9-5gjq | CVE-2026-25802 | بالا | 2026-02-22 | <= v0.10.8-alpha.8 | v0.10.8-alpha.9 | XSS در MarkdownRenderer | خیر |
| GHSA-w6x6-9fp7-fqm4 | CVE-2026-25591 | بالا | 2026-02-22 | <= v0.10.8-alpha.9 | v0.10.8-alpha.10 | DoS با wildcard در SQL LIKE هنگام جستجوی توکن | خیر |
| GHSA-f35r-v9x5-r8mc | CVE-2026-30886 | متوسط | 2026-03-23 | <= v0.11.4-alpha.1 | v0.11.4-alpha.2 | IDOR در VideoProxy | خیر |
| GHSA-5353-f8fq-65vc | CVE-2026-32879 | متوسط (4.9) | 2026-03-23 | repo: `>= v0.10.0`، بدون نسخه‌ی اصلاح‌شده؛ global: `>= 0.10.0, <= 0.11.9-alpha.1` | اعلام نشده | دور زدن مرحله‌ی تأیید تکمیلی passkey که secretهای کانال مخصوص root را افشا می‌کند | طبق بازه‌ی global، خیر. advisory مخزن هنوز اصلاحی اعلام نمی‌کند. در کد rc.48، `/api/verify` روش `passkey` را با `ErrVerificationFlowRequired` رد می‌کند و مسیر passkey تابع `wa.ValidateLogin` را اجرا می‌کند (`src/service/security_verification.go:611`، `src/controller/passkey.go`)، پس به نظر اصلاح شده است (برداشت ما از کد) |
| GHSA-xff3-5c9p-2mr4 | CVE-2026-41432 | بالا | 2026-04-22 | < v0.12.10 | v0.12.10 | دور زدن بررسی امضای webhook در Stripe با secret خالی | خیر |
| GHSA-v5c3-6wvc-pc2q | CVE-2026-42339 | بالا | 2026-05-06 | <= v0.11.9-alpha.1 | اعلام نشده | دور زدن فیلتر SSRF با 0.0.0.0 | طبق بازه، خیر. `privateIPv4Nets` در rc.48 شامل 0.0.0.0/8 است |
| GHSA-6x2c-phff-wx57 | CVE-2026-64859 | **بحرانی** | 2026-07-03 | < v1.0.0-rc.7 | v1.0.0-rc.7 | API فهرست کاربران access token کاربر root را افشا می‌کند؛ ارتقای سطح دسترسی | خیر |
| GHSA-26v7-h57m-gh9m | CVE-2026-44342 | متوسط | 2026-07-03 | < v0.12.0-alpha.1 | v0.12.0-alpha.1 | CSRF در اتصال ایمیل به حساب | خیر |
| GHSA-6qcr-qxgr-m7fv | CVE-2026-33655 | بالا | 2026-07-03 | < v0.12.0-alpha.1 | v0.12.0-alpha.1 | دور زدن SSRF با hostname حل‌نشده در URLهای اعلان | خیر |
| GHSA-v828-m3pf-vq9q | CVE-2026-64868 | بالا | 2026-07-03 | < v1.0.0-rc.11 | v1.0.0-rc.11 | webhookهای پرداخت بدون احراز هویت: DoS حافظه و دیسک | خیر |
| GHSA-p845-629j-rcj6 | CVE-2026-64866 | متوسط | 2026-07-03 | >= v0.9.1.3, < v1.0.0-rc.7 | v1.0.0-rc.7 | ادمین می‌تواند passkey کاربران هم‌سطح یا با دسترسی بالاتر را بازنشانی کند | خیر |
| GHSA-8r8v-xf7q-rcpr | CVE-2026-71479 | **بحرانی** | 2026-07-09 | <= 1.0.0-rc.17 | 1.0.0-rc.18 | سرریز عدد صحیح در محاسبه‌ی هزینه‌ی سهمیه که هزینه‌ی منفی ایجاد می‌کند (افزایش اعتبار به نفع خود) | خیر |
| GHSA-j6gc-4893-qwmp | CVE-2026-64865 | بالا (repo) / متوسط (global) | 2026-08-07 | <= v1.0.0-rc.15 | v1.0.0-rc.16 | بازنویسی کش سهمیه‌ی کاربر در Redis از طریق PUT /api/user/self | خیر |

- **هیچ advisory منتشرشده‌ای بازه‌ی آسیب‌پذیری‌ای ندارد که v1.0.0-rc.48 را شامل شود.**
- الگو: 15 advisory در حدود 13 ماه، از جمله 2 مورد بحرانی در خط v1.0.0-rc (صورتحساب و ارتقای سطح دسترسی). چند مورد به صورتحساب و سهمیه مربوط‌اند، که مستقیماً برای یک محصول فروش مجدد (resale) اهمیت دارد.

## 12. زبان‌های رابط کاربری

- رابط وب (`supportedLngs` در `src/web/src/i18n/config.ts`): `en`، `zhCN`، `fr`، `ru`، `ja`، `vi`، `zhTW`. فایل‌های locale در `src/web/src/i18n/locales/` هستند.
- پیام‌های بک‌اند (`src/i18n/locales/`): `en`، `zh-CN`، `zh-TW`.
- **فارسی (fa) وجود ندارد.** پشتیبانی RTL پیدا نشد (جستجو جامع نبود).

## 13. شرایط مجوز فراتر از AGPL ساده

از `src/NOTICE` و بخش License در `src/README.en.md`:

- **شرایط افزوده‌ی AGPLv3 §7(b):**
  - نسخه‌های تغییریافته باید عبارت "Frontend design and development by New API contributors." را در Appropriate Legal Notices **و در هر محل برجسته‌ی about، legal، footer یا attribution در UI** حفظ کنند.
  - نسخه‌های تغییریافته‌ای که UI ارائه می‌دهند باید یک **لینک قابل‌مشاهده به https://github.com/QuantumNous/new-api** نگه دارند.
  - نباید منشأ نرم‌افزار را نادرست معرفی کنند و باید تغییرات را طبق §7(c) علامت‌گذاری کنند.
- NOTICE درخواست می‌کند که همراه با ایمیج‌های Docker و باینری‌ها حفظ شود. ایمیج فایل‌های `/licenses/LICENSE`، `/licenses/NOTICE` و `/licenses/THIRD-PARTY-LICENSES.md` را همراه دارد.
- README مجوز تجاری پیشنهاد می‌دهد: "If your organization's policies do not permit the use of AGPLv3-licensed software, or if you wish to avoid the open-source obligations of AGPLv3, please contact us at support@quantumnous.com".
- پروژه بر پایه‌ی One API (MIT) است.
- نکته‌ی انطباق در README: اپراتورهای سرویس‌های عمومی هوش مصنوعی مولد باید تعهدات حوزه‌ی قضایی خود در زمینه‌ی ثبت، مجوز، ایمنی محتوا، احراز هویت با نام واقعی، نگهداری لاگ، مالیات و مجوز upstream را رعایت کنند و کلیدهای upstream را به‌طور قانونی تهیه کنند.
- بند شبکه‌ای AGPL (§13): ارائه‌ی یک نسخه‌ی تغییریافته روی شبکه مستلزم ارائه‌ی سورس آن به کاربران است. این یک واقعیت کلی AGPL است، نه گفته‌ی اضافه‌ای از upstream.

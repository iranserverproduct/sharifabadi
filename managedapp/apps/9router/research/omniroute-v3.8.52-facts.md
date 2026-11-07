# OmniRoute: یافته‌های upstream برای مشخصات استقرار روی Kubernetes

گردآوری‌شده در 2026-11-04. منبع = tarball تگ انتشار **v3.8.52** (فقط خواندن و grep؛ هیچ چیزی اجرا یا build نشد)،
GitHub REST API، و Docker Hub API به‌همراه manifest و config رجیستری (فقط متادیتا).
در ادامه، `S/` یعنی `https://github.com/cheaper-inference/OmniRoute/blob/v3.8.52/`.
«نامشخص» = از هیچ فایل یا API در upstream خوانده نشده است.

## 0. هویت
- مخزن: `cheaper-inference/OmniRoute` (شناسهٔ مخزن 1157102282، ساخته‌شده در 2026-02-13). `api.github.com/repos/diegosouzapw/OmniRoute` پاسخ **301 Moved Permanently** را به همان شناسهٔ مخزن برمی‌گرداند، پس مخزن جابه‌جا شده است. منبع: GitHub API.
- فایل‌های upstream هنوز به نام قدیمی اشاره می‌کنند: برچسب ایمیج `org.opencontainers.image.source=https://github.com/diegosouzapw/OmniRoute`، لینک‌های issue در مستندات، و `docker-publish.yml` که اجراهای زمان‌بندی‌شده را مشروط به `github.repository == 'diegosouzapw/OmniRoute'` کرده است. منبع: `S/Dockerfile` L242-246، `S/.github/workflows/docker-publish.yml` L56.
- مجوز: **MIT** (GitHub API؛ `S/LICENSE`؛ برچسب ایمیج). ستاره‌ها: **84,535**، فورک‌ها 12,700، issueهای باز 561 (GitHub API، 2026-11-04).
- شاخهٔ پیش‌فرض: `release/v3.8.53`. این شاخه کارهای منتشرنشده را در خود دارد؛ تگ v3.8.53 وجود ندارد.

## 1. انتشار / آهنگ انتشار
- آخرین نسخهٔ پایدار: **v3.8.52**. همین نسخه `releases/latest` است. شیء تگ annotated با شناسهٔ `cac024bcf3999e46092a763a18eefced77e36acf` (تاریخ tagger 2026-10-19T20:02:28Z، `verified: false`) به کامیت **`ad6f33f66bda34eba98645d3bfdabbde294bc843`** اشاره می‌کند (کامیت‌شده در 2026-10-19T15:22:25Z، با پیام "Release v3.8.52"). انتشار در 2026-10-19T20:02:45Z منتشر شد. نسخه در `S/package.json` = 3.8.52.
- ۸ انتشار آخر (published_at): v3.8.52 2026-10-19 · v3.8.51 2026-09-30 · v3.8.50 2026-08-26 · v3.8.49 2026-07-30 · v3.8.48 2026-07-13 · v3.8.47 2026-07-13 · v3.8.46 2026-07-07 · v3.8.45 2026-07-06. یک انتشار غیرنسخه‌ای به نام `radar-export-latest` (2026-08-20) هم وجود دارد. آهنگ انتشار: در اوایل ژوئیه چند انتشار در هفته، و پس از آن تقریباً هر 3–5 هفته یک انتشار. (انتشارهای GitHub API)
- نسخه‌های پشتیبانی‌شده: 3.8.x فعال، 3.7.x فقط وصله‌های امنیتی، 3.9.x به‌عنوان LTS برنامه‌ریزی‌شده (`stable/v3`). منبع: `S/SECURITY.md` L19-26.

## 2. ایمیج
- رجیستری: Docker Hub `docker.io/diegosouzapw/omniroute` (هنوز زیر namespace قدیمی؛ 1.67M pull). workflow همچنین `ghcr.io/diegosouzapw/omniroute` را push می‌کند (`docker-publish.yml` L223). digestهای GHCR: **نامشخص** (پرس‌وجو نشد).
- تگ **`3.8.52`** (push‌شده در 2026-10-20T02:54Z؛ `latest` همان digest را دارد):
  - digest ایندکس `sha256:b08a12e876baa8a5ccadd1ebbe346fe7267dba3b1c9f4fd6bb02070fae41ab6c`
  - linux/amd64 `sha256:90f903d7e9245973dc23f7f0a3afc0c63502c9bd25961097843361689df6474b`، حجم فشرده **442,855,586 B (~422 MiB)**، 13 لایه (مجموع از روی manifest بررسی شد)
  - linux/arm64 `sha256:fb7f91836fd95f382a5a04af740d859e2e9731804b5c0ba43f5d2e7f9ad64794`، 442,240,532 B
  - گونه‌ها: `3.8.52-web` (ایندکس `sha256:d0d63c53…c779147`، amd64 `sha256:69a1b16c…2fd2980` با حجم 873 MB، که Playwright، Chromium و Xvfb را اضافه می‌کند). `3.8.52-bun` و `-web-bun` فقط amd64 هستند و "best-effort" (بدون تضمین).
  - کانال‌ها: `:X.Y.Z` تغییرناپذیر؛ `:latest` = بالاترین نسخهٔ پایدار؛ `:next` = شاخهٔ انتشار (push‌شده در 2026-11-04)؛ `:main` = توسعه. منبع: `S/docs/guides/DOCKER_GUIDE.md` L506-515.
  - ایمیج برچسب `org.opencontainers.image.revision` ندارد، پس ارتباط digest→commit **نامشخص** است. امضای ایمیج/cosign: **نامشخص**.
- پایه: `node:26-trixie-slim` (فقط با تگ، بدون pin کردن digest). config منتشرشده NODE_VERSION=26.12.0 را نشان می‌دهد. منبع: `S/Dockerfile` L2؛ blob کانفیگ رجیستری.
- مرحله‌ها (stages): `runner-base` → `:X.Y.Z`؛ `runner-web` → `-web`؛ `runner-cli` (مرحلهٔ **آخر**، پس یک `docker build .` ساده همین را می‌سازد) که git، **docker.io و docker-compose**، و نیز codex، claude-code، droid، openclaw و qodercli را به‌صورت سراسری نصب می‌کند. docker-publish فقط `runner-base`/`runner-web` را build می‌کند. منبع: `S/Dockerfile` L363-403، workflow L261/281.
- config منتشرشدهٔ amd64 (رجیستری، منطبق با `S/Dockerfile` L248-316):
  - `User=node`. کامنت Dockerfile مقدار UID/GID را **1000** می‌گوید (L298-299)؛ `/etc/passwd` بررسی نشد، پس UID عددی فقط از روی همین کامنت است.
  - `WorkingDir=/app`، `Entrypoint=["/app/check-permissions.sh"]`، `Cmd=["node","dev/run-standalone.mjs"]`
  - فقط `ExposedPorts=20128/tcp`
  - `Healthcheck: node healthcheck.mjs` (30s/5s/15s/3)
  - متغیرهای محیطی: `NODE_ENV=production PORT=20128 HOSTNAME=0.0.0.0 OMNIROUTE_MEMORY_MB=1024 NODE_OPTIONS=--max-old-space-size=1024 DATA_DIR=/app/data REQUIRE_API_KEY=true OMNIROUTE_MIGRATIONS_DIR=/app/migrations`
- اجرا به‌صورت غیر root به‌طور پیش‌فرض: **بله** (USER node). مالکیت `/app` و `/app/data` به node:node داده شده است. entrypoint اگر DATA_DIR قابل نوشتن نباشد فقط *هشدار* می‌دهد و سپس CMD را `exec` می‌کند. همچنین `docker/ensure-docker-base-path.mjs` را اجرا می‌کند که وقتی `OMNIROUTE_BASE_PATH` تنظیم شده باشد، bundle را هنگام شروع وصله می‌کند. منبع: `S/scripts/check-permissions.sh`، `S/docs/guides/DOCKER_GUIDE.md` L400-401.
- `run-standalone.mjs` فایل `server-ws.mjs` را به‌صورت پروسس فرزند اجرا می‌کند؛ این یک wrapper است که WS، مهر زدن IP همتا (peer-IP stamping) و WebDAV را اضافه می‌کند. TLS بومی اختیاری: `OMNIROUTE_TLS_CERT`/`OMNIROUTE_TLS_KEY`. منبع: `S/scripts/dev/run-standalone.mjs` L31-38، `S/scripts/dev/standalone-server-ws.mjs` L107-118.
- سازگاری با readOnlyRootFilesystem: **نامشخص** (هیچ اظهارنظری در upstream نیست).

## 3. چارت Helm
- **در v3.8.52 وجود ندارد.** هیچ `Chart.yaml` یا پوشهٔ helm در هیچ جای درخت پروژه نیست. راهنمای upstream برای K8s فقط یک تکه در مستندات است. منبع: `S/docs/guides/DOCKER_GUIDE.md` L650-700، `S/docs/ops/MONITORING_GUIDE.md` بخش «Kubernetes probe recommendations»:
  - `replicas: 1`، `strategy: Recreate` (الزامی: "do not raise replicas against one SQLite file" (تعداد replica را روی یک فایل SQLite بالا نبرید)، چون چند نویسنده DB را خراب می‌کنند)؛ HA پشتیبانی نمی‌شود
  - `terminationGracePeriodSeconds: 90`، `preStop: sleep 15`؛ تخلیهٔ SSE با `SHUTDOWN_TIMEOUT_MS` که پیش‌فرض آن 30s است
  - startupProbe `GET /healthz` (failureThreshold 30، period 5)؛ readinessProbe `GET /healthz` (period 5، timeout 2، failureThreshold 6)؛ livenessProbe `GET /livez` یا **TCP 20128** (period 10–20، timeout 3، failureThreshold 6). برای liveness از `/api/monitoring/health` استفاده **نکنید**.
  - مقیاس‌دهی افقی = N پاد مستقل، هر کدام با DATA_DIR/volume خودش؛ `QUOTA_STORE_DRIVER=redis` به‌صورت اختیاری برای شمارنده‌های سهمیهٔ مشترک
- securityContext / قالب‌های PVC: نامشخص (در upstream وجود ندارد).

## 4. فایل‌های docker-compose
- `S/docker-compose.yml` از profileها استفاده می‌کند: base، web، cli، host، memory، bifrost، cliproxyapi، codex-app-server.
  - `redis:8.6.5-alpine` (بدون requirepass، publish‌شده روی loopback) در همهٔ profileها هست، اما اپ به آن `depends_on` ندارد.
  - سرویس‌های اختیاری: `chatgpt-web-codex-browser` (web)، `qdrant` (memory)، `bifrost`، `cliproxyapi`، `codex-app-server`.
  - profile `cli` فایل **/var/run/docker.sock** را mount می‌کند.
  - profile `host` مسیرهای `~/.codex`، `~/.claude` و چند مسیر دیگر میزبان را به‌صورت read-write mount می‌کند.
  - پورت‌ها به `APP_BIND_HOST:-127.0.0.1` bind می‌شوند: 20128 داشبورد، 20129 API، 20132 live WS. compose مقدار `NODE_OPTIONS=--max-old-space-size=2048` را تنظیم می‌کند.
- `S/docker-compose.selfhost.yml`: redis + `omniroute:latest` (`depends_on redis healthy`، `REDIS_URL=redis://redis:6379`).
- `S/docker-compose.prod.yml`: redis + یک build از `runner-cli` + chatgpt-web-codex-browser.
- `S/docker-compose.ollama-local.yml`: یک کانتینر omniroute تنها، بدون redis.
- **Redis اختیاری است**: "optional, soft dependency … degrades gracefully (in-memory fallbacks)" (وابستگی نرم و اختیاری؛ در نبودش با جایگزین‌های درون‌حافظه‌ای کار می‌کند) (`S/docs/ops/REDIS_PRODUCTION_CONFIG.md` L10). `.env.example` L114-120 متغیر REDIS_URL را "OPT-IN" (اختیاری با فعال‌سازی دستی) علامت زده است. بدون آن، محیط production یک هشدار لاگ می‌کند و rate limiting درون‌حافظه‌ای انجام می‌شود (`S/src/shared/utils/rateLimiter.ts` L3-11). اگر REDIS_URL به میزبانی از کار افتاده اشاره کند، لاگ‌ها پر می‌شوند (#4878).
- **چیز دیگری لازم نیست.** SQLite به‌صورت embedded است (better-sqlite3).

## 5. داده / دیسک
- DB: SQLite با WAL در **`$DATA_DIR/storage.sqlite`** (+ `-wal`، `-shm`). در Docker مسیر `/app/data`. منبع: `S/src/lib/db/core.ts` L120، `S/docs/ops/DATABASE_GUIDE.md` L60-74.
- `DATA_DIR` (پیش‌فرض ایمیج `/app/data`)؛ نام مستعار `OMNIROUTE_DATA_DIR` (فقط برای PromptQL). پیش‌فرض در نبود DATA_DIR = `~/.omniroute` (یا `$XDG_CONFIG_HOME/omniroute`). منبع: `S/src/lib/dataPaths.ts`.
- **بازگشت بی‌صدا**: اگر DATA_DIR پیکربندی‌شده قابل نوشتن نباشد (EACCES/EPERM)، اپ *هشدار می‌دهد و به `~/.omniroute` برمی‌گردد* (= `/home/node/.omniroute`، که در پاد ناپایدار است)، پس خطای دسترسی PVC باعث شکست راه‌اندازی نمی‌شود. منبع: `S/src/lib/dataPaths.ts` `resolveWritableDataDir` L174-190.
- رازهای خودکار تولیدشده: `JWT_SECRET`، `STORAGE_ENCRYPTION_KEY`، `API_KEY_SECRET` و `STORAGE_ENCRYPTION_KEY_VERSION` اگر تنظیم نشده باشند در اولین بوت تولید و در **`$DATA_DIR/server.env`** ذخیره می‌شوند. از دست رفتن این فایل یعنی از دست رفتن کلید رمزنگاری؛ اگر اعتبارنامه‌های رمزشده وجود داشته باشند، اپ از تولید دوبارهٔ کلید خودداری می‌کند. ترتیب بارگذاری: تولیدشده < `server.env` < `$DATA_DIR/.env` (سپس `~/.omniroute/.env`، `./.env`) < process.env (مقدارهای خالی نادیده گرفته می‌شوند). منبع: `S/scripts/build/bootstrap-env.mjs` L5-18، L247-320.
- مسیرهای مبتنی بر HOME بیرون از DATA_DIR (HOME=/home/node):
  - پوشهٔ پلاگین `<HOME>/.omniroute/plugins` مگر اینکه `OMNIROUTE_PLUGINS_DIR` تنظیم شده باشد (`S/src/lib/plugins/scanner.ts` L46-56)
  - پوشه‌های قواعد/فیلترهای فشرده‌سازی به `~/.omniroute` برمی‌گردند (`open-sse/services/compression/ruleLoader.ts` L75، `engines/rtk/filterLoader.ts` L66)
  - کانفیگ‌های ابزارهای CLI: `~/.codex`، `~/.claude`، `~/.cline`، `~/.continue`، `~/.hermes`، `~/.config/*`، `~/.aws/sso/cache`، `~/.local/share/kiro-cli` و غیره (حدود 66 فایل از `homedir()` استفاده می‌کنند)
  - `-web`: `PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright`
  - `os.tmpdir()` برای نصب پلاگین‌ها و پوشه‌های تست استفاده می‌شود
  - بیشتر کاربران دیگر DATA_DIR فقط وقتی DATA_DIR تنظیم نشده باشد به `~/.omniroute` برمی‌گردند.
- آنچه در DATA_DIR رشد می‌کند:
  - `storage.sqlite` + WAL (محافظ WAL `OMNIROUTE_WAL_GUARD_MAX_MB=256`)
  - `db_backups/` (`DB_BACKUP_MAX_FILES=20`، `DB_BACKUP_RETENTION_DAYS=0`؛ پشتیبان‌گیری روتین روشن است مگر `DISABLE_SQLITE_AUTO_BACKUP=true`)
  - `logs/application/app.log` (پیش‌فرض `APP_LOG_TO_FILE` برابر **true** است؛ 50M × حداکثر 20 فایل، 7 روز)
  - جدول/آرتیفکت‌های `call_logs` (`CALL_LOG_RETENTION_DAYS=7`، `CALL_LOGS_TABLE_MAX_ROWS=100000`، بدنهٔ هر کدام تا 1 MB)
  - `models/llmlingua` (دانلود مدل از HuggingFace) و دانلود مدل‌های embedding حافظه (`HF_HUB_ENDPOINT` با پیش‌فرض huggingface.co)
  - `cache/`، `runtime/mcp-heartbeat.json`، `server.env`
  - باینری‌های version-manager (CLIProxyAPI) زیر DATA_DIR
  - منابع: `S/.env.example` L96-112، L2148-2230، L3276-3279؛ `S/src/lib/db/backup.ts` L65؛ `open-sse/services/compression/engines/llmlingua/modelStore.ts` L31-44؛ `S/src/lib/memory/embedding/staticPotion.ts` L19-71.
- اندازهٔ مورد انتظار PVC: نامشخص (هیچ عددی در upstream نیست).

## 6. متغیرهای محیطی (از `S/.env.example`، 3,865 خط؛ مرجع کامل `S/docs/reference/ENVIRONMENT.md`)
متغیرهای مرتبط با استقرار همراه با پیش‌فرض‌هایشان:

| متغیر | پیش‌فرض | توضیح |
|---|---|---|
| JWT_SECRET / API_KEY_SECRET / STORAGE_ENCRYPTION_KEY | خالی، تولید خودکار → `server.env` | برای هر مشتری مقدار خودتان را از طریق یک Secret بدهید، وگرنه PVC نگه‌دارندهٔ آن‌ها خواهد بود |
| INITIAL_PASSWORD | در `.env.example`: **`CHANGEME`**؛ در ایمیج: تنظیم‌نشده | **پیش‌فرض ناامن.** `CHANGEME` با یک هشدار پذیرفته می‌شود و فقط برای ورودهای غیر loopback رد می‌شود (`S/src/lib/auth/managementPassword.ts` L7-9، L48-53، L84-90) |
| REQUIRE_API_KEY | پیش‌فرض کد **false** (`featureFlagDefinitions.ts` L17-22)؛ `.env.example` false؛ **ENV ایمیج true** | **اولویت: DB (کلید داشبورد) > env > پیش‌فرض** (`S/src/shared/utils/featureFlags.ts` L10)، پس یک ادمین داشبورد می‌تواند آن را خاموش کند |
| requireLogin (تنظیم DB) | true (`S/src/lib/db/settings.ts` L176) | رد کردن مرحلهٔ رمز عبور در onboarding مقدار requireLogin=false را تنظیم می‌کند که احراز هویت را در کل نصب خاموش می‌کند (`S/.env.selfhost.example`، `apiAuth.ts` L533-537) |
| AUTH_COOKIE_SECURE | **false** | پشت TLS باید true باشد |
| MACHINE_ID_SALT | `endpoint-proxy-salt` | پیش‌فرض ثابت و عمومی؛ "change per-deployment" (برای هر استقرار تغییر دهید) |
| ALLOW_API_KEY_REVEAL | false | |
| OMNIROUTE_WS_BRIDGE_SECRET | خودکار با `randomUUID()` برای هر پروسس در `server-ws.mjs` L118 | DOCKER_GUIDE L354 می‌گوید "required in production" (در production الزامی است)، که با کدی که آن را خودکار تولید می‌کند تناقض دارد |
| OMNIROUTE_PEER_STAMP_TOKEN | خودکار در هر بوت | تنظیم نکنید |
| PORT / DASHBOARD_PORT / API_PORT | 20128 / =PORT / =PORT | تک‌پورتی است مگر اینکه API_PORT تنظیم شود (`S/src/lib/runtime/ports.ts` L22-28) |
| LIVE_WS_PORT / LIVE_WS_HOST | 20132 / 127.0.0.1 | درون همان پروسس روی پورت اصلی در مسیر `/live-ws` پروکسی می‌شود |
| LIVE_WS_ALLOWED_ORIGINS | originهای loopback | origin عمومی خودتان را اضافه کنید |
| NEXT_PUBLIC_BASE_URL / BASE_URL | `http://localhost:20128` | origin عمومی https را تنظیم کنید؛ BASE_URL را داخلی نگه دارید |
| OMNIROUTE_BASE_PATH | "" | زمان build؛ وصلهٔ زمان اجرا هنگام شروع |
| OMNIROUTE_TRUST_PROXY | تنظیم‌نشده | `true`/`loopback`، `private`/`lan` |
| OMNIROUTE_TRUSTED_PROXIES | تنظیم‌نشده | IP/CIDRهای اضافی پروکسی (عمومی) |
| CORS_ALLOWED_ORIGINS / CORS_ALLOW_ALL | تنظیم‌نشده / false | |
| OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS | **true** | URLهای provider می‌توانند LAN/loopback را هدف بگیرند؛ فقط 169.254/metadata مسدود است |
| OMNIROUTE_ALLOW_PRIVATE_PROVIDER_URLS | false | کلید DB بر env اولویت دارد |
| REDIS_URL / REDIS_KEY_PREFIX / QUOTA_STORE_DRIVER | تنظیم‌نشده / `omniroute:` / sqlite | |
| OMNIROUTE_MEMORY_MB | 1024 (ایمیج) | |
| APP_LOG_LEVEL / APP_LOG_FORMAT / APP_LOG_TO_FILE | info / text / true | |
| SHUTDOWN_TIMEOUT_MS | 30000 | |
| ENABLE_SOCKS5_PROXY | true | |
| CLOUD_URL | خالی | همگام‌سازی ابری خاموش |
| DISABLE_SQLITE_AUTO_BACKUP | false | |
| SKILLS_SANDBOX_NETWORK_ENABLED / SKILLS_SANDBOX_RUNTIME | 0 / auto | |

- شناسه‌های کلاینت OAuth برای providerها در `.env.example` آمده‌اند (Claude، Codex، GitHub، Kimi). این‌ها شناسه‌های کلاینت عمومی هستند، نه راز.
- آیا احراز هویت با کلید API به‌طور پیش‌فرض الزامی است؟ در **ایمیج منتشرشده، بله** (`REQUIRE_API_KEY=true`). در npm/سورس/.env.example، **نه**. یک محافظ راه‌اندازی وقتی اپ روی آدرس غیر loopback bind شود و این گزینه خاموش باشد هشدار می‌دهد (`S/src/lib/startup/nonLoopbackApiKeyGuard.ts`).

## 7. حافظه
- heap ایمیج 1024 MB است و این‌طور توصیف شده: "a dashboard/light-chat floor, not a production size" (کف لازم برای داشبورد/چت سبک، نه اندازهٔ production). از جدول `S/docs/guides/DOCKER_GUIDE.md` L327-340 و `S/README.md` L1096-1108:

  | بار کاری | هیپ | کانتینر |
  |---|---|---|
  | داشبورد / چت سبک | 1024 | ≥2 GiB |
  | یک عامل کدنویسی (coding agent) | **8192** | **≥10 GiB** |
  | دو `/v1/responses` طولانی هم‌زمان | 10240–12288 | ≥12–16 GiB |
  | سه یا بیشتر | نه روی یک پروسس | — |

  یک abort در V8 در حدود 12 GiB heap اندازه‌گیری شد (#7849). حافظهٔ native بیرون از heap است.
- مستندات با هم تناقض دارند: `S/docs/getting-started/SELF_HOST_GUIDE.md` L185 و `.env.selfhost.example` از `OMNIROUTE_MEMORY_MB=2048` به‌عنوان "a safe default for a single user who runs Claude Code / Codex" (پیش‌فرضی امن برای یک کاربر که Claude Code / Codex اجرا می‌کند) استفاده می‌کنند. راهنمای VM: حداقل 1 GB، پیشنهادی 2 GB RAM (`S/docs/ops/VM_DEPLOYMENT_GUIDE.md` L17-20).
- heap از طریق `OMNIROUTE_MEMORY_MB` تنظیم می‌شود که entrypoint و launcher آن را به‌صورت `--max-old-space-size` اضافه می‌کنند (آخرین flag برنده است). کالیبراسیون خودکار bare-metal (35% از RAM، محدودشده بین 512–4096) هرگز در Docker اجرا نمی‌شود. پذیرش درخواست‌ها با `OMNIROUTE_CHAT_MAX_INFLIGHT_BYTES` (به‌صورت خودکار محاسبه می‌شود)، `OMNIROUTE_CHAT_ADMISSION_HEAP_SHED_RATIO=0.75` و `OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT` (قدیمی) کنترل می‌شود. workerهای اختیاری فشرده‌سازی: `OMNI_COMPRESSION_WORKER_MAX_OLD_MB=1024`.

## 8. سلامت / متریک‌ها / لاگ‌ها
- `GET|HEAD /healthz`: پاسخ 200 `ok`، یا 503 `starting`/`stopping`؛ بدون دسترسی به DB (`S/src/app/healthz/route.ts`). `GET /livez`: زنده بودن پروسس (`S/src/app/livez/route.ts`). `GET /api/monitoring/health`: بررسی عمیق (DB، heap، providerها)، سنگین. HEALTHCHECK کانتینر مسیر `/healthz` را روی 127.0.0.1، localhost، ::1 و IP شبکهٔ bridge بررسی می‌کند (`S/scripts/dev/healthcheck.mjs`). مسیرهای سلامت با OMNIROUTE_BASE_PATH پیشوند می‌گیرند.
- متریک‌ها: **هیچ endpoint برای Prometheus وجود ندارد**. "Prometheus/OpenTelemetry export is planned for v3.9 … scrape `/api/monitoring/health` with … blackbox exporter" (خروجی Prometheus/OpenTelemetry برای v3.9 برنامه‌ریزی شده؛ فعلاً `/api/monitoring/health` را با blackbox exporter بخوانید) (`S/docs/ops/MONITORING_GUIDE.md` L495-501).
- لاگ‌ها: stdout به‌علاوهٔ فایل (`$DATA_DIR/logs/application/app.log`، به‌طور پیش‌فرض روشن). `APP_LOG_FORMAT=text|json` (پیش‌فرض text، که `open-sse/utils/logger.ts` L53 از آن استفاده می‌کند). لاگر اصلی سرور pino است با timestampهای ISO و یک hook برای حذف اطلاعات حساس (`S/src/shared/utils/logger.ts`). شکل دقیق خروجی stdout **نامشخص** است: اینکه خروجی pino به‌صورت pretty است یا JSON، و نحوهٔ آمیختگی آن با خطوط `console.*`.

## 9. مدل احراز هویت و اعتماد بر پایهٔ محلی بودن
- داشبورد: رمز عبور (bcrypt) یا OIDC. کوکی نشست JWT. پیش‌فرض `requireLogin` برابر true است. API مدیریتی همچنین کلیدهای API با scope `manage`/`admin`، توکن‌های دسترسی CLI با پیشوند `oma_`، و یک توکن CLI ماشین که فقط از loopback کار می‌کند را می‌پذیرد. پروکسی /v1 وقتی REQUIRE_API_KEY روشن باشد از کلیدهای API استفاده می‌کند. منبع: `S/src/server/authz/policies/management.ts`.
- اولین بوت بدون رمز عبور و بدون INITIAL_PASSWORD:
  - فراخواننده‌های **loopback** تا `setupComplete` از احراز هویت عبور می‌کنند؛ فراخواننده‌های غیر loopback به احراز هویت نیاز دارند
  - `/dashboard/onboarding` باز است
  - نوشتن اولین رمز عبور / `POST /api/settings/require-login` به loopback **یا** یک توکن bootstrap یک‌بارمصرف نیاز دارد که در لاگ چاپ می‌شود ("docker logs … | grep BOOTSTRAP")
  - منبع: `S/src/shared/utils/apiAuth.ts` L99-142، L493-555.
- محلی بودن از **همتای واقعی TCP** تعیین می‌شود، نه از Host/XFF: `server-ws.mjs` هدر `x-omniroute-peer-ip: <token>|<ip>` را مهر می‌زند و نسخه‌های ارسالی کلاینت را حذف می‌کند. منبع: `S/scripts/dev/peer-stamp.mjs`، `S/src/server/authz/peerContext.ts`.
  - اگر همتا loopback، RFC1918، CGNAT 100.64/10، ULA/link-local، Cloudflare یا داخل OMNIROUTE_TRUSTED_PROXIES باشد، **و** درخواست هر کدام از هدرهای `x-forwarded-*`، `x-real-ip`، `forwarded` یا `via` را داشته باشد، درخواست به‌عنوان `via-proxy` علامت می‌خورد و **راه دور** (remote) در نظر گرفته می‌شود.
  - در غیر این صورت همتای loopback به‌عنوان **loopback** و همتای با IP خصوصی به‌عنوان **LAN خصوصی** شمرده می‌شود.
- مسیرهای `LOCAL_ONLY` (سطوح spawn/exec، حدود 60 پیشوند در `S/src/server/authz/routeGuard.ts` L34-103) وقتی همتا **loopback یا LAN خصوصی** باشد مجازند. پس از آن همچنان به احراز هویت عادی نیاز دارند، مگر اینکه requireLogin=false باشد.
- پیامدها برای K8s (برداشت ما از کد بالا، نه گفتهٔ upstream):
  - (a) ingress-nginx هدر XFF را اضافه می‌کند، پس ترافیک ingress «راه دور» است.
  - (b) **هر پاد درون کلاستر** (10.x/172.16/100.64) که مستقیماً و بدون هدرهای forwarding سرویس را صدا بزند «LAN خصوصی» است و از دروازهٔ LOCAL_ONLY عبور می‌کند.
  - (c) یک **sidecar یا `kubectl port-forward`** که بدون هدرهای forwarding به 127.0.0.1 برسد «**loopback**» است: در بازهٔ نصب تازه، دسترسی مدیریتی بدون احراز هویت و امکان نوشتن bootstrap برای require-login را می‌گیرد، و می‌تواند از مسیر توکن CLI ماشین استفاده کند.
  - (d) یک پروکسی sidecar که XFF را *اضافه* کند همه چیز را «راه دور» می‌کند، پس قابلیت‌هایی که فقط با loopback کار می‌کنند از کار می‌افتند. این هیچ بخش اصلی را خراب نمی‌کند، چون داشبورد و /v1 همچنان با نشست یا کلید کار می‌کنند.
  - اینکه یک sidecar مش مشخص (Istio/Envoy) XFF اضافه می‌کند یا نه: **نامشخص**.
- IP کلاینت برای فهرست مجاز/ممنوع IP: وقتی همتا یک پروکسی مورد اعتماد باشد، راست‌ترین hop غیرمورداعتماد در XFF (`peer-stamp.mjs` `resolveClientIp`).

## 10. قابلیت‌های پرخطر (همه در کد v3.8.52 وجود دارند)
- **child_process** در حدود 66 فایل src/open-sse:
  - شناسایی و اجرای ابزارهای CLI (codex، claude، cursor-agent، qodercli، devin، auggie، zcode…)
  - عامل‌های ACP (`src/lib/acp/*`، `execFileSync`)
  - پلاگین‌ها (میزبان Node که spawn می‌شود + worker_threads، `src/lib/plugins/loader.ts` L248)
  - hookهای middleware کد JS را از طریق `vm.Script` اجرا می‌کنند (routeGuard L82)
  - sandbox مهارت‌ها (skills) کانتینرهای **docker/podman** اجرا می‌کند (`src/lib/skills/sandbox.ts`)
  - نشست‌های VNC، Docker را spawn می‌کنند (`src/lib/vncSession/service.ts`)
  - به‌روزرسانی خودکار با `git checkout` + `npm install` (`/api/system/version`؛ Dockerfile می‌گوید runtime برای npm به shell فرمان می‌دهد)
  - نصب‌کننده‌های سرویس‌های embedded از طریق npm (`src/lib/services/installers/utils.ts`)
  - CLI پایتونی headroom، ffmpeg (پل ویدیو)، خروجی tar، MITM/اعتماد به CA به‌علاوهٔ ویرایش `/etc/hosts` (`src/mitm/*`، که در Docker با `OMNIROUTE_MITM_STUB=1` غیرفعال‌نما (stub) شده است)، اجراکنندهٔ Redis از طریق podman/docker (`/api/local/`)
- **دانلود باینری/مدل**: version manager باینری انتشار CLIProxyAPI را دانلود و اجرا می‌کند (`src/lib/versionManager/binaryManager.ts`). نصب Tailscale، نصب و راه‌اندازی cloudflared. دانلود مدل‌های HuggingFace. دانلود آرشیو از marketplace پلاگین (URL رجیستری سفارشی در برابر SSRF محافظت می‌شود و فقط آدرس‌های عمومی مجازند).
- **تونل‌ها**: cloudflared، tailscale funnel، ngrok (`NGROK_AUTHTOKEN`)، مسیرها زیر `/api/tunnels/*`.
- **MCP**: سرور MCP داخلی در `/api/mcp/*` (scopeهای `mcp:connect`/`manage`؛ LOCAL_ONLY، با امکان دور زدن برای درخواست‌های راه دور از طریق scope مدیریت یا نشست داشبورد). `OMNIROUTE_MCP_ENFORCE_SCOPES=false` به‌طور پیش‌فرض. هیچ transport کلاینت MCP از نوع stdio پیدا نشد.
- **سطح حملهٔ SSRF**: URLهای پایهٔ provider که کاربر تنظیم می‌کند، کشف مدل، نودهای rerank، webhookها، دریافت تصویر/رسانه از راه دور. پیش‌فرض `OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS=true` اجازهٔ هدف‌های loopback و LAN را می‌دهد (فقط 169.254/16 و نام‌های میزبان metadata را مسدود می‌کند). کلیدهای داشبورد بر env اولویت دارند. استخرهای پروکسی/SOCKS5 فعال‌اند. منبع: `S/.env.example` L583-614، `S/src/shared/network/outboundUrlGuardPolicy.ts`.
- **سرورهای callback برای OAuth**: `startLocalServer` روی **0.0.0.0** با یک پورت ثابت یا تصادفی bind می‌شود (`S/src/lib/oauth/utils/server.ts` L72). پورت‌های ثابت redirect روی loopback عبارت‌اند از codex 1455، xai-oauth 56121، grok-cli 56122 (`src/lib/oauth/utils/pkceLoopbackWarning.ts`)، و command-code 5959-5968. این جریان‌ها فقط وقتی کار می‌کنند که مرورگر روی همان میزبان اجرا شود. ورود Adobe Firefly روی 127.0.0.1 با پورت تصادفی bind می‌شود.
- sidecar از نوع WS برای Codex app-server (`ws://codex-app-server:1456`)، sidecar از نوع CDP برای Chromium مربوط به ChatGPT-web (پورت 9223، با توکن).

## 11. استریمینگ / ingress
- SSE روی `/v1/*` (chat/completions، responses). WebSocketها: پروکسی Responses-over-WS روی پورت اصلی، و فید زندهٔ داشبورد در `/live-ws` (پورت اصلی به 127.0.0.1:20132 پروکسی می‌کند). منبع: `S/scripts/dev/standalone-server-ws.mjs` L144-215.
- نمونهٔ nginx در upstream (`S/docs/ops/VM_DEPLOYMENT_GUIDE.md` L201-230): `client_max_body_size 100M`، `proxy_http_version 1.1`، `Upgrade`/`Connection "upgrade"`، `proxy_buffering off`، `proxy_cache off`، `proxy_read_timeout 600s`، `proxy_send_timeout 600s`، و هدرهای forward‌شدهٔ `Host`، `X-Forwarded-Host`، `X-Real-IP`، `X-Forwarded-For`، `X-Forwarded-Proto`. timeoutها را با `STREAM_IDLE_TIMEOUT_MS` بالا ببرید.
- محدودیت‌های اندازهٔ بدنه در اپ: `MAX_BODY_SIZE_BYTES` (نمونه 10 MiB)، `OMNIROUTE_CHAT_HARD_MAX_BODY_BYTES` (نمونه 50 MiB).
- مجموعهٔ annotationهای ingress-nginx: در upstream نامشخص. از روی بلوک nginx بالا ترجمه کنید.
- `AUTH_COOKIE_SECURE=true`، `NEXT_PUBLIC_BASE_URL=https://<host>` و `LIVE_WS_ALLOWED_ORIGINS=https://<host>` را تنظیم کنید. منبع: بخش Caddy در `DOCKER_GUIDE.md` L444-460.

## 12. هشدارهای امنیتی
`GET /repos/cheaper-inference/OmniRoute/security-advisories?state=published&per_page=100` تعداد **1** مورد برمی‌گرداند:

| GHSA | CVE | شدت | تاریخ انتشار | نسخه‌های آسیب‌پذیر | نسخهٔ وصله‌شده | خلاصه |
|---|---|---|---|---|---|---|
| GHSA-hf57-cqmx-p4gr | CVE-2026-88062 | بحرانی (CWE-94, CWE-306) | 2026-09-03 | omniroute `< 3.8.49` | 3.8.49 | RCE از طریق عامل سفارشی ACP: `POST /api/acp/agents` با `binary`/`versionCommand` دلخواه مهاجم → `execFileSync`. وقتی requireLogin=false باشد بدون احراز هویت. |

- ناهمخوانی: پایگاه دادهٔ سراسری هشدارها (`/advisories?ecosystem=npm&affects=omniroute`) همین GHSA را با تاریخ انتشار 2026-09-10، با بازهٔ `<= 3.8.50` و نسخهٔ وصله‌شدهٔ **هیچ** فهرست کرده است.
- آیا v3.8.52 را تحت تأثیر قرار می‌دهد؟ طبق هشدار مخزن، نه. در کد v3.8.52، `/api/acp/agents` از نوع LOCAL_ONLY است (routeGuard L98) و `resolveVersionProbe` فقط باینری خالی یا یک flag نسخهٔ تکی را مجاز می‌داند (`S/src/lib/acp/registry.ts` L191-228). این برداشت من از کد است، نه اظهارنظر upstream. LOCAL_ONLY همچنان همتاهای LAN خصوصی را می‌پذیرد (بخش §9 را ببینید).
- سورس در کامنت‌ها به حدود 40 شناسهٔ GHSA دیگر ارجاع می‌دهد، برای مثال GHSA-35fw-cv32-2373، GHSA-7pq4-8pvv-rx7r، GHSA-x7vm-hp44-9p79، GHSA-jx89-f37j-pq89 و GHSA-fhh6-4qxv-rpqj. هیچ‌کدام در فهرست هشدارهای منتشرشدهٔ مخزن نیستند، پس وضعیتشان **نامشخص** است.

## 13. فارسی (fa)
- **وجود دارد.** `S/src/i18n/messages/fa.json` دارای 13,935 کلید است که کلید به کلید با en.json منطبق است، و 437 مقدار آن عیناً همان متن انگلیسی است. `fa` در localeهای `config/i18n.json` (با نام "فارسی") و در `rtl: [ar, fa, he, ur]` حضور دارد. همچنین موجود: `src/i18n/global-error-messages/fa.json`، `bin/cli/locales/fa.json` و `docs/i18n/fa/`.
- کیفیت ترجمه: نامشخص (فراتر از کلیدهای نمونه‌برداری‌شده مانند save→ذخیره بررسی نشد).

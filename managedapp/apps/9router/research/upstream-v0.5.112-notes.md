# 9Router v0.5.112: upstream notes

خلاصه‌ی فایل‌های upstream که سند فنی بر اساس آن‌ها نوشته شده. خوانده‌شده در 2026-11-04 از تگ `v0.5.112` (commit `1fe586bb1cf35e1ed0cb2150a8ef7d1db040b21d`، 2026-10-28).

## Image

- Docker Hub `decolua/9router:0.5.112`، index digest `sha256:fab111d99b23bde6c8944ca22982603ab0b09e917a0b1e4ce42a24b05753bec9`
- amd64 `sha256:ae94cb5b37e1852343d7cdbe3bd0bdf13cb400a7fcf08c59ca50fb11876b879f` (حدود ۳۰۱MB فشرده)؛ arm64 `sha256:b53d50191df437ecdc2c7a151c274378aa6a0604892b12ce410f5fe82dc5e87a`
- تگ‌های اخیر: 0.5.86 (2026-09-23)، 0.5.91، 0.5.95، 0.5.104، 0.5.109، 0.5.111، 0.5.112 (2026-10-28)
- pull count حدود ۷۱۳ هزار

## Dockerfile (مرحله‌ی runner)

- base: `node:22.23.4-alpine`؛ `ENV PORT=20128 HOSTNAME=0.0.0.0 DATA_DIR=/app/data NODE_ENV=production`
- `EXPOSE 20128`؛ `CMD ["node", "custom-server.js"]`
- entrypoint با root اجرا می‌شود:

```sh
chown -R node:node /app/data /app/data-home 2>/dev/null
exec su-exec node "$@"
```

- `ffmpeg` و `su-exec` نصب می‌شوند؛ `wreq-js` و `playwright-core` به‌صورت lazy بارگذاری می‌شوند؛ `/root/.9router` به `/app/data-home` لینک شده است.

## docker-compose.yml

- سرویس `9router` با والیوم `9router-data:/app/data` و `env_file: .env`
- سرویس دوم `headroom` (`ghcr.io/chopratejas/headroom:latest`، پورت 8787) و `HEADROOM_URL=http://headroom:8787`؛ در استقرار ما حذف می‌شود.

## .env.example

- لازم: `JWT_SECRET`، `INITIAL_PASSWORD`، `DATA_DIR`
- امنیتی: `API_KEY_SECRET=endpoint-proxy-api-key-secret`، `MACHINE_ID_SALT=endpoint-proxy-salt`، `ENABLE_REQUEST_LOGS=false`، `OBSERVABILITY_ENABLED=true`، `AUTH_COOKIE_SECURE=false`، `REQUIRE_API_KEY=false`
- ابری: `BASE_URL`، `CLOUD_URL=https://9router.com` و نسخه‌های `NEXT_PUBLIC_*`
- اختیاری: `HTTP_PROXY`، `HTTPS_PROXY`، `ALL_PROXY`، `NO_PROXY`، `SEARXNG_URL`

## Code findings

- `src/lib/dataDir.js`: اگر `DATA_DIR` قابل نوشتن نباشد (EACCES یا EPERM)، با یک هشدار به `~/.9router` برمی‌گردد.
- `src/lib/auth/dashboardSession.js`: بدون `JWT_SECRET`، یک secret تصادفی در `DATA_DIR/jwt-secret` می‌سازد. رمز پیش‌فرض `123456` است. کوکی با `AUTH_COOKIE_SECURE=true` یا `X-Forwarded-Proto: https` امن می‌شود.
- `src/shared/utils/apiKey.js`: کلید با قالب `sk-{machineId}-{keyId}-{crc8}`؛ CRC با HMAC-SHA256 و `API_KEY_SECRET` (پیش‌فرض ثابت).
- `src/shared/utils/machineId.js`: شناسه‌ی ماشین در `DATA_DIR/machine-id` و secret تصادفی CLI در `DATA_DIR/auth/cli-secret` ذخیره می‌شود؛ salt پیش‌فرض `endpoint-proxy-salt`.
- `src/lib/db/repos/settingsRepo.js`: پیش‌فرض‌ها `requireLogin: true`، `requireApiKey: true`، `cloudEnabled: false`، `tunnelEnabled: false`، `headroomEnabled: false`، `pxpipeEnabled: false`، `pxpipeAutoInstall: true`، `enableObservability: false`، `observabilityMaxRecords: 1000`. متغیر `REQUIRE_API_KEY` در کد خوانده نمی‌شود.
- `custom-server.js`: IP کلاینت از socket گرفته می‌شود؛ `X-Forwarded-For` و `X-Real-IP` فقط وقتی peer روی loopback باشد پذیرفته می‌شوند؛ هدرهای `x-9r-*` ورودی پاک و با توکن تصادفی هر پروسه دوباره ساخته می‌شوند.
- `src/dashboardGuard.js`: `isLocalRequest` وقتی peer روی loopback باشد و هدر forwarding نباشد true است؛ در این حالت `/v1` بدون کلید API باز است. مسیرهای عمومی: `/api/health`، `/api/init`، `/api/locale`، `/api/auth/*`، `/api/version`، `/api/settings/require-login` و پیشوندهای `/v1`، `/v1beta`، `/api/v1`، `/api/v1beta`، `/codex`، `/responses`.
- `src/app/api/health/route.js`: `GET` پاسخ `{"ok": true}` می‌دهد.
- `src/mitm/server.js` روی پورت 443 گوش می‌دهد. `src/lib/oauth/utils/server.js` سرورهای callback روی `127.0.0.1` (از جمله پورت ثابت 56121) باز می‌کند.
- پروسه‌ی فرزند (`child_process`) در: MCP stdio bridge، tunnel (cloudflared، tailscale)، pxpipe، headroom، updater، MITM و تنظیم ابزارهای CLI.
- درایور دیتابیس: better-sqlite3، بعد node:sqlite، بعد sql.js. مسیرها: `DATA_DIR/db/data.sqlite` و `DATA_DIR/db/backups`.

## Security advisories (19 published)

| GHSA | CVE | Severity | Published | Vulnerable | Patched |
|---|---|---|---|---|---|
| GHSA-fhh6-4qxv-rpqj | CVE-2026-46339 | critical | 2026-05-13 | >=0.4.30, <0.4.37 | 0.4.37 |
| GHSA-g6g7-pvmx-m74p | – | critical | 2026-05-29 | <=0.4.39 | 0.4.44 |
| GHSA-jphh-m39h-6gwx | CVE-2026-49352 | critical | 2026-05-31 | >=0.2.21, <=0.4.41 | >=0.4.44 |
| GHSA-vjc7-jrh9-9j86 | – | critical | 2026-06-13 | <=0.4.41 | ثبت نشده |
| GHSA-6g2f-w7g3-77vf | CVE-2026-49353 | high | 2026-06-13 | <=0.4.55 | ثبت نشده |
| GHSA-qvfm-67h2-2qfx | CVE-2026-55500 | critical | 2026-06-20 | <=0.4.71 | ثبت نشده |
| GHSA-7cfm-pqrj-xgq7 | CVE-2026-55501 | high | 2026-06-20 | <=0.4.71 | >=0.4.77 |
| GHSA-4922-8r65-fq26 | – | critical | 2026-07-03 | 0.4.59 | 0.4.60 |
| GHSA-qj3v-64wj-q825 | – | high | 2026-07-03 | <=0.4.71 | 0.4.72 |
| GHSA-8gmq-j984-vp4r | CVE-2026-55638 | high | 2026-07-07 | <=0.4.80 | 0.4.82 |
| GHSA-86m2-fcxq-5q7c | CVE-2026-55641 | high | 2026-07-07 | <=0.4.80 | 0.4.82 |
| GHSA-cmhj-wh2f-9cgx | CVE-2026-56676 | high | 2026-07-07 | <=0.4.80 | >=0.5.2 |
| GHSA-x5c9-v98j-722r | CVE-2026-56675 | high | 2026-07-07 | <=0.4.80 | >=0.5.2 |
| GHSA-vmjq-hvgq-2wv4 | CVE-2026-56679 | high | 2026-07-10 | <=0.5.2 | 0.5.4 |
| GHSA-63p9-g54h-prrp | CVE-2026-62312 | high | 2026-07-10 | 0.4.59 | 0.5.2 |
| GHSA-6mwv-4mrm-5p3m | CVE-2026-56678 | medium | 2026-07-10 | <=0.5.2 | 0.5.6 |
| GHSA-8g4w-4ffg-8vgx | CVE-2026-56677 | high | 2026-07-16 | <=0.5.4 | 0.5.6 |
| GHSA-5mj8-gf6m-fhw8 | CVE-2026-56681 | high | 2026-07-16 | 0.5.4 | 0.5.6 |
| GHSA-32gc-64m7-hj7v | CVE-2026-56682 | medium | 2026-07-16 | 0.5.4 | 0.5.6 |

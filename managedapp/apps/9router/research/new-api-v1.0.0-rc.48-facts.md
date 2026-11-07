# new-api (QuantumNous/new-api): upstream facts for a K8s/ArgoCD managed-app spec

Collected 2026-11-04. Source tree read: tarball of tag `v1.0.0-rc.48` (https://codeload.github.com/QuantumNous/new-api/tar.gz/refs/tags/v1.0.0-rc.48). Nothing was built or run. In this file, "src/" means that directory.
"Unknown" means I did not find or read it upstream. Anything marked "(inference)" is my reading, not an upstream statement.

## 1. Release, cadence, license, popularity

- **Latest release: `v1.0.0-rc.48`.** GitHub `releases/latest` returns it (`prerelease: false`). Published 2026-11-04T15:40:15Z. Tag commit `706144769e5bed5a47b78721e3bb11da3cf4c0b9`, committer date 2026-11-04T14:58:20Z, message "fix(auth): 校验 Redis 鉴权缓存完整性 (#8200)". Source: `GET /repos/QuantumNous/new-api/releases/latest`, `/tags`, `/commits/v1.0.0-rc.48`.
  - Caveat: every release since 2026-04-28 is named `v1.0.0-rc.N` but is **not** marked prerelease. The last plain semver release is `v0.13.2` (2026-04-27). `v1.0.0-alpha.1` (2026-04-28) is the only one marked prerelease. Source: `GET /releases?per_page=100` (pages 1-3).
  - `src/VERSION` is empty in the tarball. CI injects the version at build time (`src/Dockerfile` ldflags `-X common.Version=$(cat VERSION)`).
  - Breaking-change note in the rc.48 release body: Redis user, token and session caches are now signed, and every node of a multi-node deployment must be upgraded together.
- **Cadence (last 8 releases):** rc.48 2026-11-04, rc.47 2026-10-25, rc.46 2026-10-21, rc.45 2026-10-17, rc.44 2026-10-12, rc.43 2026-10-10, rc.42 2026-10-08, rc.41 2026-09-30. That is roughly one release every 2-10 days. All target `main`.
- **License:** GNU AGPL v3.0 (`spdx_id: AGPL-3.0`), with additional terms under AGPLv3 Section 7 (see section 13). Sources: repo API `license`, `src/LICENSE`, `src/NOTICE`.
- **Stars:** 51,365. Forks: 12,472. Not archived. Homepage https://www.newapi.ai. Source: `GET /repos/QuantumNous/new-api`.

## 2. Container image

- **Registry and tag:** Docker Hub `calciumion/new-api:v1.0.0-rc.48` (verified). CI pushes only to Docker Hub, with no GHCR. Per-arch tags `-amd64` and `-arm64` are combined into a multi-arch index. Images are cosign-signed, built with SBOM and provenance `mode=max`. Source: `src/.github/workflows/docker-build.yml`.
  - `latest` is re-pointed on every tag push, rc tags included. README says to pin a version (`src/README.en.md` line 251).
- **Index digest (v1.0.0-rc.48):** `sha256:51401a46510bf110ffafdf2cd7177e0b80bbcf02439e69b665c696f330e87ae5` (media type OCI image index). Pushed 2026-11-04T15:46:48Z.
- **amd64 image digest:** `sha256:bb3e67e3c3f06278fcd801bef69499862e2de79db88c627816d0cd6277b5ed40`, compressed size 78,044,763 B (about 74.4 MiB).
- **arm64 image digest:** `sha256:8b34b5101f42c5039249a08dfa8f6ed8bc15743996bd636a8895c7869d38fa37`, 75,664,967 B.
- Digest sources: `https://hub.docker.com/v2/repositories/calciumion/new-api/tags?page_size=8&ordering=last_updated` and `/tags/v1.0.0-rc.48`.
- **Dockerfile** (`src/Dockerfile`):
  - Stages: `oven/bun:1.4.4@sha256:1d22…` builds the web UI, then `golang:1.26.10-alpine@sha256:9ce2…` builds the Go binary (`CGO_ENABLED=0`), then the runtime stage.
  - Runtime base: **`debian:bookworm-slim@sha256:f06537653ac770703bc45b4b113475bd402f451e85223f0f2837acbf89ab020a`**.
  - apt packages: `ca-certificates tzdata libasan8 wget`.
  - Binary path: `/new-api`. Licences are copied to `/licenses/`.
  - `EXPOSE 3000`
  - `WORKDIR /data`
  - `ENTRYPOINT ["/new-api"]`, with **no CMD**
  - **No `USER` instruction, so the container runs as root (UID 0) by default.** No non-root UID is defined upstream.
  - **No `VOLUME`**
  - **No `ENV`** in the runtime stage
  - **No `HEALTHCHECK`.** The compose file defines one (section 7).
- **CLI flags** (`src/common/init.go`): `--port` (default 3000; the `PORT` env var overrides it, see `src/main.go`), `--log-dir` (default `./logs`), `--version`, `--help`.
- **Paths the process writes (from code):**
  - SQLite DB `one-api.db`, relative to the working directory. That resolves to `/data/one-api.db`, plus WAL and SHM files.
  - Log dir `./logs`, which resolves to `/data/logs`. The process creates it with `os.Mkdir(..., 0777)`.
  - `os.TempDir()` (`/tmp`) for the disk body cache (`common/disk_cache.go`, used only when enabled; `DiskCacheEnabled` defaults to false) and for temp files (`relay/channel/dify/relay-dify.go`, `common/utils.go`).
  - `./pprof/` only when `ENABLE_PPROF=true`.
  - Non-root and `readOnlyRootFilesystem` viability (inference): a writable PVC at `/data` plus an emptyDir at `/tmp` should be enough. **Not tested.**

## 3. Helm chart / Kubernetes manifests

- **None upstream.** No `Chart.yaml`, no `kind: Deployment|StatefulSet|Service`, no k8s directory in the tag tree.
- Upstream deployment artifacts: `src/docker-compose.yml`, `src/docker-compose.dev.yml`, a systemd unit `src/new-api.service`, and a BaoTa panel guide `src/docs/installation/BT.md`.

## 4. docker-compose and databases

- **`src/docker-compose.yml` services:**
  - `new-api`: `calciumion/new-api:latest`, `command: --log-dir /app/logs`, volumes `./data:/data` and `./logs:/app/logs`, port 3000.
  - `redis`: `redis:latest --requirepass 123456`
  - `postgres`: `postgres:15`, user root, password 123456
  - Commented-out alternatives: `mysql:8.2` and `clickhouse/clickhouse-server:24.8` (logs only).
- **External services are optional.** `SQL_DSN` unset means SQLite (README table: "Main database | SQLite, MySQL ≥ 5.7.8, or PostgreSQL ≥ 9.6"; "Cache | Optional Redis plus in-memory caching"). Code agrees: `src/model/main.go` `chooseDB()` falls back to SQLite when `SQL_DSN` is empty or starts with `local`. `src/common/redis.go` disables Redis when `REDIS_CONN_STRING` is empty.
- **SQLite for production:** README presents SQLite in the quick start as "a single instance with SQLite" and lists it as a supported main DB. **No upstream statement endorses or forbids SQLite for production.** Unknown beyond that.
  - The code sets WAL, `busy_timeout(30000)` and `_txlock=immediate` for concurrency (`src/common/database.go` comment on `SQLitePath`).
  - Driver: pure-Go `github.com/glebarez/sqlite` (modernc).
- **SQLite file location:**
  - Default DSN: `one-api.db?_pragma=busy_timeout(30000)&_pragma=journal_mode(WAL)&_txlock=immediate`, relative to the working directory, so `/data/one-api.db`.
  - Override: `SQLITE_PATH` (`src/common/init.go`). The value replaces the whole DSN, so a custom value loses those pragmas unless you re-add them (inference from the code).
- **Log dir:**
  - Default `./logs`, which is `/data/logs` in the image, so on the data PVC.
  - Compose uses `--log-dir /app/logs`.
  - An empty `--log-dir` disables file logging (`if *LogDir != ""` in `src/logger/logger.go` and `src/common/init.go`).
- **Multi-node:** all nodes share the main DB, `SESSION_SECRET`, and `CRYPTO_SECRET` when they share Redis (`src/docs/authentication.md`, `src/README.en.md`). A slave node uses `NODE_TYPE=slave`.

## 5. Environment variables

Sources: `src/common/init.go`, `src/common/redis.go`, `src/model/main.go`, `src/main.go`, `src/.env.example`, `src/docker-compose.yml`, `src/README.en.md`.

| Var | Default (code) | Notes / flags |
|---|---|---|
| `PORT` | 3000 (via `--port`) | |
| `SQL_DSN` | unset, so SQLite | `postgres://`/`postgresql://` selects PG. `local*` selects SQLite. ClickHouse is rejected for the main DB. Anything else is treated as MySQL (`parseTime=true` is appended). |
| `LOG_SQL_DSN` | unset, so the main DB | Can be ClickHouse. `LOG_SQL_CLICKHOUSE_TTL_DAYS` (0 means no deletion). |
| `SQLITE_PATH` | see section 4 | |
| `SQL_MAX_IDLE_CONNS` / `SQL_MAX_OPEN_CONNS` / `SQL_MAX_LIFETIME` | 100 / 1000 / 60 s | |
| `REDIS_CONN_STRING` | unset, so Redis is off | Redis on forces `MEMORY_CACHE_ENABLED=true` (`src/main.go` line 82-85). `REDIS_POOL_SIZE` default 10. |
| `SESSION_SECRET` | **random UUID per process start** (`src/common/constants.go:35`) | Unset means every restart invalidates logins, temporary auth flows and security proofs. The literal `random_string` makes the process exit with a fatal error. README: "set a persistent random `SESSION_SECRET` (generate one with `openssl rand -hex 32`)". |
| `CRYPTO_SECRET` | = `SESSION_SECRET` | Used for auth-cache integrity MACs and task-artifact capability URLs. Rotating it invalidates issued artifact URLs (`src/docs/plugin-api/README.md`). |
| `NODE_TYPE` | master (anything but `slave`) | |
| `SYNC_FREQUENCY` | 60 s | |
| `MEMORY_CACHE_ENABLED` | false (true if Redis is enabled) | |
| `BATCH_UPDATE_ENABLED` / `BATCH_UPDATE_INTERVAL` | false / 5 s | Compose sets true. |
| `TZ` | image default (Unknown) | Compose and README use `Asia/Shanghai`. tzdata is installed. |
| `DEFAULT_LANGUAGE` | en | en, zh-CN or zh-TW, for logs, emails and notifications. |
| `ERROR_LOG_ENABLED` | false | Compose sets true. |
| `TRUSTED_PROXIES` | unset, so loopback, RFC1918 and fc00::/7 are trusted, with a startup warning | See section 8. |
| `SESSION_COOKIE_SECURE` | false | **Insecure default for HTTPS.** false disables the refresh/logout OriginGuard and is "仅用于本地 HTTP" (local HTTP only). Set true. |
| `SESSION_COOKIE_TRUSTED_URL` | unset | Required when Secure=true: exact HTTPS origins, no wildcards. |
| `PASSWORD_LOGIN_ENCRYPTION_ENABLED` | false | |
| `ACCOUNT_PASSWORD_HASH_ALGORITHM` | Unknown (example shows argon2id; the comment describes bcrypt-to-argon2id migration) | |
| `USER_SESSION_ACTIVE_LIMIT` / `_ISSUANCE_LIMIT` / `_ISSUANCE_WINDOW_SECONDS` / `_REVOKED_RETENTION_DAYS` / `_HOURLY_ALERT_THRESHOLD` | 50 / 100 / 86400 / 7 / 5000 (per compose and .env.example comments) | |
| `TLS_INSECURE_SKIP_VERIFY` | false | Global outbound TLS skip if true. |
| `SMTP_STARTTLS_ENABLE` / `SMTP_INSECURE_SKIP_VERIFY` | false / false | |
| `ENABLE_PPROF` | false | If true, **pprof listens on 0.0.0.0:8005 without auth** (`src/main.go`). |
| `DEBUG` | false | |
| `RELAY_TIMEOUT` | 0 (unlimited) | |
| `STREAMING_TIMEOUT` | 300 s | Compose comment says "default 120s". Code says 300. |
| `RELAY_RESPONSE_HEADER_TIMEOUT` | 1800 s | |
| `RELAY_IDLE_CONN_TIMEOUT` | 90 | |
| `RELAY_HTTP2_PING_IDLE_TIMEOUT` / `_PING_TIMEOUT` | 0 (off) / 15 | |
| `RELAY_MAX_IDLE_CONNS` / `_PER_HOST` | 500 / 100 | |
| `MAX_REQUEST_BODY_MB` | 128 | |
| `ANONYMOUS_REQUEST_BODY_LIMIT_KB` | 512 | |
| `MAX_FILE_DOWNLOAD_MB` | 64 | |
| `STREAM_SCANNER_MAX_BUFFER_MB` | 128 | |
| `SHUTDOWN_TIMEOUT_SECONDS` | 120 | Graceful drain for SSE, so set `terminationGracePeriodSeconds` to at least this. |
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
| `FRONTEND_BASE_URL` | unset | |
| `NODE_NAME` | Unknown default | Audit-log node identity. |
| `TRUSTED_REDIRECT_DOMAINS` | unset | Payment success/cancel redirect allowlist. |
| `GOOGLE_ANALYTICS_ID` / `UMAMI_WEBSITE_ID` / `UMAMI_SCRIPT_URL` | unset | They inject third-party scripts into the UI. |
| `PYROSCOPE_*` | unset | |
| `LINUX_DO_TOKEN_ENDPOINT` / `LINUX_DO_USER_ENDPOINT` | set (uncommented) in `.env.example` | |

**First admin account:**
- **There is no default root/123456 at this tag.** `createRootAccountIfNeed()` (which creates root/123456) still exists in `src/model/main.go` but nothing calls it (grep shows only its definition).
- Instead, a setup wizard runs: unauthenticated `GET/POST /api/setup` (`src/router/api-router.go` line 26-27, `src/controller/setup.go`). The POST creates the root user from the username and password provided (username at most 12 characters), plus `SelfUseModeEnabled` and `DemoSiteEnabled`. It is refused once setup is complete (`constant.Setup`).
- **Risk: on a fresh instance, whoever reaches `/api/setup` first becomes root.** Complete setup before the ingress is public, or block `/api/setup` at the ingress (inference).

**Other insecure or example defaults:**
- Compose passwords are `123456` for Postgres, Redis, MySQL and ClickHouse.
- `SESSION_SECRET` is ephemeral when unset.
- `SESSION_COOKIE_SECURE` is false.
- `TRUSTED_PROXIES` trusts all private ranges.
- Registration is open (section 8).

## 6. Memory / CPU guidance

- **Unknown. No memory, CPU or replica sizing guidance was found** in the README files, `docs/`, or `.env.example`.
- Indirect knobs only: `MAX_REQUEST_BODY_MB=128`, `STREAM_SCANNER_MAX_BUFFER_MB=128`, `MAX_FILE_DOWNLOAD_MB=64`, the disk cache in `setting/performance_setting/config.go`, and `SQL_MAX_OPEN_CONNS=1000`.

## 7. Health, metrics, logs

- **Health:** `GET /api/status` is public (`src/router/api-router.go:28`).
  - The handler (`src/controller/misc.go` `GetStatus`) builds the response from in-memory options with **no DB or Redis call**. It returns `{"success": true, ...}`, so it shows the process is alive but does not prove the database is ready.
  - Compose healthcheck: `wget -q -O - http://localhost:3000/api/status | grep -o '"success":\s*true'`.
  - `GET /api/uptime/status` is also public (Uptime-Kuma status).
  - `GET /api/status/test` requires admin.
- **Metrics: no Prometheus `/metrics` endpoint is served by the app.** `prometheus/common` is only used to scrape upstream inference servers (`src/controller/channel_inference.go`).
  - pprof is available on `:8005` only with `ENABLE_PPROF=true`.
  - Pyroscope push is optional.
  - `/api/perf-metrics` is an app-level model performance JSON, gated by a UI module setting.
- **Log format:** plain text, not JSON.
  - App lines: `[LEVEL] 2006/01/02 - 15:04:05 | <request-id or SYSTEM> | msg` (`src/logger/logger.go`).
  - Access lines: `[GIN] ... | status | latency | ip | method path` (`src/middleware/logger.go`).
- **Log file:** logs go to stdout/stderr **and** to `<log-dir>/oneapi-YYYYMMDDHHMMSS.log`. The default log-dir is `./logs`, which is **`/data/logs`, i.e. on the data volume**.
  - A new file starts after about 1,000,000 log lines (`maxLogCount`).
  - Upstream does not delete old files automatically. An admin API can delete them (`DELETE /api/performance/logs`, `controller/performance.go`).
  - To keep logs off the PVC, pass `--log-dir=` (empty) or point it at an emptyDir.
- Request and usage logs are also stored in the DB (main DB or `LOG_SQL_DSN`).

## 8. Auth model and header trust

- **Roles:** guest 0, common 1, admin 10, root 100 (`src/common/constants.go:202-205`).
- **Admin login:** username and password. Optional 2FA (TOTP and backup codes), passkeys (WebAuthn), and a "secure verification" step-up for sensitive actions.
- **Sessions:** server-side `user_sessions`, an access token plus a refresh cookie (`src/docs/authentication.md`). Personal access tokens are also supported (`/api/user/self/access_tokens`).
- **API keys:**
  - `Token` rows, presented as `sk-<key>` (`src/model/token.go`).
  - Per-key fields: status, expiry (`-1` means never), `remain_quota`, `unlimited_quota`, model allowlist, `allow_ips`, group, cross-group retry, `allow_user_quota_query`.
- **Billing / quota:**
  - Each user has a quota. New users get `QuotaForNewUser = 0`.
  - Admins set model pricing and ratios, groups, redemption codes and subscriptions.
  - Top-up and payments: Stripe, Creem, Waffo, Waffo Pancake, Epay (`src/controller/topup_*.go`, `subscription_payment_*.go`).
- **Registration is open by default:** `RegisterEnabled=true`, `PasswordRegisterEnabled=true`, `EmailVerificationEnabled=false`, `TurnstileCheckEnabled=false` (`src/common/constants.go:67-76`). These are changeable in the admin UI and persisted in the DB options table.
- **Login options** (`src/oauth/` and router):
  - Email verification and password reset (SMTP)
  - GitHub, Discord, OIDC, LinuxDO and Telegram OAuth
  - Generic custom OAuth providers (`/api/custom-oauth-provider`)
  - WeChat (via an external WeChat auth server)
  - Cloudflare Turnstile
- **Header trust** (`src/common/trusted_proxies.go`, `src/middleware/trusted_proxies.go`, `src/docs/authentication.md` "可信代理与 IP 限流"):
  - Uses gin `SetTrustedProxies`. With gin's default `RemoteIPHeaders`, `X-Forwarded-For` and `X-Real-IP` are honoured only from trusted peers. Upstream does not override gin's defaults.
  - **Default when unset: trust `127.0.0.0/8`, `::1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`.** The docs acknowledge the residual risk that any host or container on the same private network can spoof the headers.
  - In Kubernetes this means any pod in a 10.x or 172.16/12 pod CIDR (inference). Set `TRUSTED_PROXIES` to the ingress-nginx pod CIDR or IPs, or to `none`. A `100.64.0.0/10` CNI range must be listed explicitly (the docs say so).
  - Client IP drives rate limits, token `allow_ips`, and session and audit records.
  - Secure-mode OriginGuard does not trust a client-sent `X-Forwarded-Proto`.
- **Loopback trust:** only loopback as part of the default proxy list above. No loopback auth bypass was found. Unknown beyond the grep of `IsLoopback`/`IsPrivate` (used only in IP utility and SSRF code).

## 9. Risky features

- **Channel base URLs: SSRF surface, admin/root controlled.**
  - The relay client deliberately does **not** apply SSRF protection to provider base URLs. Comment in `src/service/http_client.go` `GetHttpClient`: provider base URLs are root/operator-managed and "may legitimately point at private networks". Only redirects are checked (`checkRedirect`).
  - Per-channel proxies (http/socks) are supported.
  - Effect: a tenant admin can make the pod call cluster-internal addresses. Egress NetworkPolicy is needed (inference).
- **User-supplied URL fetches** (image, file or video URLs in requests, webhooks, Bark/Gotify notifications, downloads) go through the SSRF-protected client (`src/service/protected_fetch_client.go`, `download.go`, `webhook.go`, `user_notify.go`).
  - `fetch_setting` defaults: protection on, private IPs blocked (the 0.0.0.0/8 and 100.64/10 lists are in `src/common/ssrf_protection.go`), allowed ports 80, 443, 8080 and 8443, IP filter applied to domains.
  - Admins can relax or disable these settings in the UI.
  - Worker mode (`DoWorkerRequest`) proxies through an external worker.
- **Outbound webhooks:** user notification webhook with a secret (`src/service/webhook.go`).
- **Inbound unauthenticated webhooks:** `POST /api/stripe/webhook`, `/api/creem/webhook`, `/api/waffo/webhook`, `/api/waffo-pancake/webhook/:env`, each with the anonymous body limit.
- **Payments:** Stripe, Creem, Waffo, Waffo Pancake, Epay.
- **Task plugins: uploadable JavaScript executed in-process** (embedded JS engine `github.com/Calcium-Ion/moejs`).
  - Upload and activation are root-only (`/api/plugin/task`, `middleware.RootAuth()`).
  - The marketplace fetches from `https://www.newapi.ai/api/v1/plugins/index.json` or `https://raw.githubusercontent.com/QuantumNous/new-api-plugins/main/index.json`, and sources are configurable (`src/setting/task_plugin.go`).
  - The host validates plugin-built URLs against the channel host (`src/docs/plugin-api/README.md`).
  - JS sandbox strength: Unknown (not audited).
- **Process spawning:** only `xdg-open`/`open` in `common/utils.go` (an `OpenBrowser` helper). Whether the server path calls it: Unknown (assumed desktop/Electron use). No other `os/exec` use.
- **File uploads:** no multipart `FormFile` handlers in `controller/`. Request bodies of up to 128 MB are accepted for relay. Dify uploads go to temp files.
- **Other outbound calls by default:** `api.github.com/repos/openai/codex/releases/latest` (`service/codex_models.go`), GitHub OAuth endpoints, the plugin marketplace index, and Umami/GA scripts if configured. A full list of default phone-home calls: Unknown.
- **Analytics injection:** `UMAMI_*` and `GOOGLE_ANALYTICS_ID` inject scripts into `index.html`. The HTML always gets the comment marker `<!--Umami QuantumNous-->`.

## 10. Streaming / ingress

- SSE responses set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive` and `X-Accel-Buffering: no`, and send keep-alive pings (`src/relay/helper/common.go`).
- gzip is deliberately not applied globally because "This will cause SSE not to work!!!" (`src/main.go`). It is applied only to `/api`.
- WebSocket upgrades: `GET /v1/realtime` and `GET /v1/responses` (README feature table).
- README: "configure your reverse proxy for streaming and WebSocket upgrades".
- **No nginx or ingress config is shipped in the repo.** The external docs site (docs.newapi.ai) was not read: Unknown.
- Relevant app timeouts: `STREAMING_TIMEOUT` 300 s, `RELAY_RESPONSE_HEADER_TIMEOUT` 1800 s, `SHUTDOWN_TIMEOUT_SECONDS` 120 s. Ingress read and send timeouts should exceed these (inference).
- TLS: README says to put the console behind HTTPS and set `SESSION_COOKIE_SECURE=true` and `SESSION_COOKIE_TRUSTED_URL=https://<public-origin>`.

## 11. Security advisories

Sources: `GET /repos/QuantumNous/new-api/security-advisories?state=published&per_page=100` (15 entries) and `GET /advisories?affects=github.com/QuantumNous/new-api` (14 entries; ecosystem `go`, same 14).

| GHSA | CVE | Sev | Published (repo) | Vulnerable | Patched | Summary | Affects rc.48? |
|---|---|---|---|---|---|---|---|
| GHSA-xxv6-m6fx-vfhh | CVE-2025-59146 | high | 2025-10-09 | <= v0.9.0.4 | v0.9.0.5 | Authenticated SSRF | No (not in global DB) |
| GHSA-9f46-w24h-69w4 | CVE-2025-62155 | high | 2025-11-23 | <= v0.9.5 | v0.9.6 | SSRF bypass | No |
| GHSA-299v-8pq9-5gjq | CVE-2026-25802 | high | 2026-02-22 | <= v0.10.8-alpha.8 | v0.10.8-alpha.9 | XSS in MarkdownRenderer | No |
| GHSA-w6x6-9fp7-fqm4 | CVE-2026-25591 | high | 2026-02-22 | <= v0.10.8-alpha.9 | v0.10.8-alpha.10 | SQL LIKE wildcard DoS in token search | No |
| GHSA-f35r-v9x5-r8mc | CVE-2026-30886 | medium | 2026-03-23 | <= v0.11.4-alpha.1 | v0.11.4-alpha.2 | IDOR in VideoProxy | No |
| GHSA-5353-f8fq-65vc | CVE-2026-32879 | medium (4.9) | 2026-03-23 | repo: `>= v0.10.0`, no patched version; global: `>= 0.10.0, <= 0.11.9-alpha.1` | none listed | Passkey step-up bypass exposing root-only channel secrets | Not by the global range. The repo advisory still lists no fix. In rc.48 code, `/api/verify` rejects method `passkey` with `ErrVerificationFlowRequired` and the passkey path runs `wa.ValidateLogin` (`src/service/security_verification.go:611`, `src/controller/passkey.go`), so it looks fixed (my code reading) |
| GHSA-xff3-5c9p-2mr4 | CVE-2026-41432 | high | 2026-04-22 | < v0.12.10 | v0.12.10 | Stripe webhook signature bypass via empty secret | No |
| GHSA-v5c3-6wvc-pc2q | CVE-2026-42339 | high | 2026-05-06 | <= v0.11.9-alpha.1 | none listed | SSRF filter bypass via 0.0.0.0 | No by range. rc.48 `privateIPv4Nets` includes 0.0.0.0/8 |
| GHSA-6x2c-phff-wx57 | CVE-2026-64859 | **critical** | 2026-07-03 | < v1.0.0-rc.7 | v1.0.0-rc.7 | User list API leaks root access token, privilege escalation | No |
| GHSA-26v7-h57m-gh9m | CVE-2026-44342 | medium | 2026-07-03 | < v0.12.0-alpha.1 | v0.12.0-alpha.1 | CSRF in email binding | No |
| GHSA-6qcr-qxgr-m7fv | CVE-2026-33655 | high | 2026-07-03 | < v0.12.0-alpha.1 | v0.12.0-alpha.1 | SSRF bypass via unresolved hostname in notification URLs | No |
| GHSA-v828-m3pf-vq9q | CVE-2026-64868 | high | 2026-07-03 | < v1.0.0-rc.11 | v1.0.0-rc.11 | Unauthenticated payment webhooks: memory and disk DoS | No |
| GHSA-p845-629j-rcj6 | CVE-2026-64866 | medium | 2026-07-03 | >= v0.9.1.3, < v1.0.0-rc.7 | v1.0.0-rc.7 | Admin can reset passkeys of equal or higher-privileged users | No |
| GHSA-8r8v-xf7q-rcpr | CVE-2026-71479 | **critical** | 2026-07-09 | <= 1.0.0-rc.17 | 1.0.0-rc.18 | Integer overflow in quota billing gives negative charges (self-crediting) | No |
| GHSA-j6gc-4893-qwmp | CVE-2026-64865 | high (repo) / medium (global) | 2026-08-07 | <= v1.0.0-rc.15 | v1.0.0-rc.16 | Redis user quota cache overwrite via PUT /api/user/self | No |

- **No published advisory has a vulnerable range that includes v1.0.0-rc.48.**
- Pattern: 15 advisories in about 13 months, including 2 critical in the v1.0.0-rc line (billing and privilege escalation). Several hit billing and quota, which matters directly for a resale product.

## 12. UI languages

- Web UI (`src/web/src/i18n/config.ts` `supportedLngs`): `en`, `zhCN`, `fr`, `ru`, `ja`, `vi`, `zhTW`. Locale files are in `src/web/src/i18n/locales/`.
- Backend messages (`src/i18n/locales/`): `en`, `zh-CN`, `zh-TW`.
- **Persian (fa) is not present.** No RTL support was found (not searched exhaustively).

## 13. License terms beyond plain AGPL

From `src/NOTICE` and the `src/README.en.md` License section:

- **AGPLv3 §7(b) additional terms:**
  - Modified versions must preserve the notice "Frontend design and development by New API contributors." in the Appropriate Legal Notices **and in any prominent about, legal, footer, or attribution location in the UI**.
  - UI-presenting modified versions must keep a **visible link to https://github.com/QuantumNous/new-api**.
  - They must not misrepresent the software's origin and must mark changes per §7(c).
- NOTICE asks that it be preserved with Docker images and binaries. The image ships `/licenses/LICENSE`, `/licenses/NOTICE` and `/licenses/THIRD-PARTY-LICENSES.md`.
- README offers commercial licensing: "If your organization's policies do not permit the use of AGPLv3-licensed software, or if you wish to avoid the open-source obligations of AGPLv3, please contact us at support@quantumnous.com".
- The project is based on One API (MIT).
- README compliance note: public generative-AI service operators must meet their jurisdiction's filing, licensing, content-safety, real-name, log-retention, tax and upstream-authorization obligations, and must lawfully obtain upstream keys.
- AGPL network clause (§13): offering a modified version over a network requires offering its source to users. This is a general AGPL fact, not an extra upstream statement.

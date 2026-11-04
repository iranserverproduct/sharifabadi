# OmniRoute — upstream facts for a K8s/ArgoCD managed-app spec

Collected 2026-11-04. Source = release tag **v3.8.52** tarball (read/grep only, nothing executed or built),
GitHub REST API, Docker Hub API + registry manifest/config (metadata only).
`S/` below = `https://github.com/cheaper-inference/OmniRoute/blob/v3.8.52/`.
"Unknown" = not read from an upstream file/API.

## 0. Identity
- Repo: `cheaper-inference/OmniRoute` (repo id 1157102282, created 2026-02-13). `api.github.com/repos/diegosouzapw/OmniRoute` returns **301 Moved Permanently** to the same repo id, so the repo moved. Source: GitHub API.
- Upstream files still point at the old name: image label `org.opencontainers.image.source=https://github.com/diegosouzapw/OmniRoute`, issue links in docs, and `docker-publish.yml` gates scheduled runs on `github.repository == 'diegosouzapw/OmniRoute'`. Source: `S/Dockerfile` L242-246, `S/.github/workflows/docker-publish.yml` L56.
- License: **MIT** (GitHub API; `S/LICENSE`; image label). Stars: **84,535**, forks 12,700, open issues 561 (GitHub API, 2026-11-04).
- Default branch: `release/v3.8.53`. It holds unreleased work; there is no v3.8.53 tag.

## 1. Release / cadence
- Latest stable: **v3.8.52**. It is `releases/latest`. Annotated tag object `cac024bcf3999e46092a763a18eefced77e36acf` (tagger date 2026-10-19T20:02:28Z, `verified: false`) points to commit **`ad6f33f66bda34eba98645d3bfdabbde294bc843`** (committed 2026-10-19T15:22:25Z, "Release v3.8.52"). Release published 2026-10-19T20:02:45Z. `S/package.json` version = 3.8.52.
- Last 8 releases (published_at): v3.8.52 2026-10-19 · v3.8.51 2026-09-30 · v3.8.50 2026-08-26 · v3.8.49 2026-07-30 · v3.8.48 2026-07-13 · v3.8.47 2026-07-13 · v3.8.46 2026-07-07 · v3.8.45 2026-07-06. A non-version release `radar-export-latest` (2026-08-20) also exists. Cadence: multiple releases per week in early July, then about one release every 3–5 weeks. (GitHub API releases)
- Supported versions: 3.8.x Active, 3.7.x Security only, 3.9.x planned LTS (`stable/v3`). Source: `S/SECURITY.md` L19-26.

## 2. Image
- Registry: Docker Hub `docker.io/diegosouzapw/omniroute` (still under the old namespace; 1.67M pulls). The workflow also pushes `ghcr.io/diegosouzapw/omniroute` (`docker-publish.yml` L223). GHCR digests: **Unknown** (not queried).
- Tag **`3.8.52`** (pushed 2026-10-20T02:54Z; `latest` has the same digest):
  - index digest `sha256:b08a12e876baa8a5ccadd1ebbe346fe7267dba3b1c9f4fd6bb02070fae41ab6c`
  - linux/amd64 `sha256:90f903d7e9245973dc23f7f0a3afc0c63502c9bd25961097843361689df6474b`, compressed **442,855,586 B (~422 MiB)**, 13 layers (sum verified from the manifest)
  - linux/arm64 `sha256:fb7f91836fd95f382a5a04af740d859e2e9731804b5c0ba43f5d2e7f9ad64794`, 442,240,532 B
  - Variants: `3.8.52-web` (index `sha256:d0d63c53…c779147`, amd64 `sha256:69a1b16c…2fd2980` 873 MB, adds Playwright, Chromium and Xvfb). `3.8.52-bun` and `-web-bun` are amd64-only and "best-effort".
  - Channels: `:X.Y.Z` immutable; `:latest` = highest stable; `:next` = release branch (pushed 2026-11-04); `:main` = dev. Source: `S/docs/guides/DOCKER_GUIDE.md` L506-515.
  - The image has no `org.opencontainers.image.revision` label, so digest→commit linkage is **Unknown**. Image signing/cosign: **Unknown**.
- Base: `node:26-trixie-slim` (tag only, not digest-pinned). The published config shows NODE_VERSION=26.12.0. Source: `S/Dockerfile` L2; registry config blob.
- Stages: `runner-base` → `:X.Y.Z`; `runner-web` → `-web`; `runner-cli` (the **last** stage, so a bare `docker build .` produces it) installs git, **docker.io and docker-compose**, plus global codex, claude-code, droid, openclaw and qodercli. docker-publish builds `runner-base`/`runner-web` only. Source: `S/Dockerfile` L363-403, workflow L261/281.
- Published amd64 config (registry, matches `S/Dockerfile` L248-316):
  - `User=node`. The Dockerfile comment says UID/GID **1000** (L298-299); `/etc/passwd` was not inspected, so the numeric UID is from the comment only.
  - `WorkingDir=/app`, `Entrypoint=["/app/check-permissions.sh"]`, `Cmd=["node","dev/run-standalone.mjs"]`
  - `ExposedPorts=20128/tcp` only
  - `Healthcheck: node healthcheck.mjs` (30s/5s/15s/3)
  - Env: `NODE_ENV=production PORT=20128 HOSTNAME=0.0.0.0 OMNIROUTE_MEMORY_MB=1024 NODE_OPTIONS=--max-old-space-size=1024 DATA_DIR=/app/data REQUIRE_API_KEY=true OMNIROUTE_MIGRATIONS_DIR=/app/migrations`
- Non-root by default: **yes** (USER node). `/app` and `/app/data` are chowned to node:node. The entrypoint only *warns* if DATA_DIR is not writable, then `exec`s the CMD. It also runs `docker/ensure-docker-base-path.mjs`, which patches the bundle at start when `OMNIROUTE_BASE_PATH` is set. Source: `S/scripts/check-permissions.sh`, `S/docs/guides/DOCKER_GUIDE.md` L400-401.
- `run-standalone.mjs` spawns `server-ws.mjs` as a child process, a wrapper that adds WS, peer-IP stamping and WebDAV. Optional native TLS: `OMNIROUTE_TLS_CERT`/`OMNIROUTE_TLS_KEY`. Source: `S/scripts/dev/run-standalone.mjs` L31-38, `S/scripts/dev/standalone-server-ws.mjs` L107-118.
- readOnlyRootFilesystem compatibility: **Unknown** (no upstream statement).

## 3. Helm chart
- **None in v3.8.52.** No `Chart.yaml` or helm directory exists anywhere in the tree. Upstream K8s guidance is a doc snippet only. Source: `S/docs/guides/DOCKER_GUIDE.md` L650-700, `S/docs/ops/MONITORING_GUIDE.md` §"Kubernetes probe recommendations":
  - `replicas: 1`, `strategy: Recreate` (required: "do not raise replicas against one SQLite file", since multiple writers corrupt the DB); HA is not supported
  - `terminationGracePeriodSeconds: 90`, `preStop: sleep 15`; SSE drain `SHUTDOWN_TIMEOUT_MS` default 30s
  - startupProbe `GET /healthz` (failureThreshold 30, period 5); readinessProbe `GET /healthz` (period 5, timeout 2, failureThreshold 6); livenessProbe `GET /livez` or **TCP 20128** (period 10–20, timeout 3, failureThreshold 6). Do **not** use `/api/monitoring/health` for liveness.
  - Scale-out = N independent pods, each with its own DATA_DIR/volume; optional `QUOTA_STORE_DRIVER=redis` for shared quota counters
- securityContext / PVC templates: Unknown (none upstream).

## 4. docker-compose files
- `S/docker-compose.yml` uses profiles: base, web, cli, host, memory, bifrost, cliproxyapi, codex-app-server.
  - `redis:8.6.5-alpine` (no requirepass, loopback-published) is in every profile, but the app does not `depends_on` it.
  - Optional services: `chatgpt-web-codex-browser` (web), `qdrant` (memory), `bifrost`, `cliproxyapi`, `codex-app-server`.
  - The `cli` profile mounts **/var/run/docker.sock**.
  - The `host` profile mounts host `~/.codex`, `~/.claude` and others read-write.
  - Ports bind to `APP_BIND_HOST:-127.0.0.1`: 20128 dashboard, 20129 API, 20132 live WS. Compose sets `NODE_OPTIONS=--max-old-space-size=2048`.
- `S/docker-compose.selfhost.yml`: redis + `omniroute:latest` (`depends_on redis healthy`, `REDIS_URL=redis://redis:6379`).
- `S/docker-compose.prod.yml`: redis + a `runner-cli` build + chatgpt-web-codex-browser.
- `S/docker-compose.ollama-local.yml`: single omniroute container, no redis.
- **Redis is optional**: "optional, soft dependency … degrades gracefully (in-memory fallbacks)" (`S/docs/ops/REDIS_PRODUCTION_CONFIG.md` L10). `.env.example` L114-120 marks REDIS_URL "OPT-IN". Without it, production logs a warning and rate limiting is in-memory (`S/src/shared/utils/rateLimiter.ts` L3-11). Pointing REDIS_URL at a dead host floods logs (#4878).
- **Nothing else is required.** SQLite is embedded (better-sqlite3).

## 5. Data / disk
- DB: SQLite with WAL at **`$DATA_DIR/storage.sqlite`** (+ `-wal`, `-shm`). Docker `/app/data`. Source: `S/src/lib/db/core.ts` L120, `S/docs/ops/DATABASE_GUIDE.md` L60-74.
- `DATA_DIR` (image default `/app/data`); alias `OMNIROUTE_DATA_DIR` (PromptQL only). Default without DATA_DIR = `~/.omniroute` (or `$XDG_CONFIG_HOME/omniroute`). Source: `S/src/lib/dataPaths.ts`.
- **Silent fallback**: if the configured DATA_DIR is not writable (EACCES/EPERM), the app *warns and falls back to `~/.omniroute`* (= `/home/node/.omniroute`, ephemeral in a pod), so a PVC permission error does not fail startup. Source: `S/src/lib/dataPaths.ts` `resolveWritableDataDir` L174-190.
- Auto-generated secrets: `JWT_SECRET`, `STORAGE_ENCRYPTION_KEY`, `API_KEY_SECRET` and `STORAGE_ENCRYPTION_KEY_VERSION` are generated on first boot when unset and persisted to **`$DATA_DIR/server.env`**. Losing that file means losing the encryption key; the app refuses to regenerate the key if encrypted credentials exist. Load order: generated < `server.env` < `$DATA_DIR/.env` (then `~/.omniroute/.env`, `./.env`) < process.env (empty values ignored). Source: `S/scripts/build/bootstrap-env.mjs` L5-18, L247-320.
- HOME-based paths outside DATA_DIR (HOME=/home/node):
  - plugin dir `<HOME>/.omniroute/plugins` unless `OMNIROUTE_PLUGINS_DIR` is set (`S/src/lib/plugins/scanner.ts` L46-56)
  - compression rule/filter dirs fall back to `~/.omniroute` (`open-sse/services/compression/ruleLoader.ts` L75, `engines/rtk/filterLoader.ts` L66)
  - CLI-tool configs `~/.codex`, `~/.claude`, `~/.cline`, `~/.continue`, `~/.hermes`, `~/.config/*`, `~/.aws/sso/cache`, `~/.local/share/kiro-cli`, etc. (about 66 files use `homedir()`)
  - `-web`: `PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright`
  - `os.tmpdir()` is used for plugin installs and test dirs
  - Most other DATA_DIR users fall back to `~/.omniroute` only when DATA_DIR is unset.
- What grows in DATA_DIR:
  - `storage.sqlite` + WAL (WAL guard `OMNIROUTE_WAL_GUARD_MAX_MB=256`)
  - `db_backups/` (`DB_BACKUP_MAX_FILES=20`, `DB_BACKUP_RETENTION_DAYS=0`; routine backups on unless `DISABLE_SQLITE_AUTO_BACKUP=true`)
  - `logs/application/app.log` (`APP_LOG_TO_FILE` defaults **true**; 50M × up to 20 files, 7 days)
  - `call_logs` table/artifacts (`CALL_LOG_RETENTION_DAYS=7`, `CALL_LOGS_TABLE_MAX_ROWS=100000`, bodies up to 1 MB each)
  - `models/llmlingua` (HuggingFace model download) and memory embedding model downloads (`HF_HUB_ENDPOINT` default huggingface.co)
  - `cache/`, `runtime/mcp-heartbeat.json`, `server.env`
  - Version-manager binaries (CLIProxyAPI) under DATA_DIR
  - Sources: `S/.env.example` L96-112, L2148-2230, L3276-3279; `S/src/lib/db/backup.ts` L65; `open-sse/services/compression/engines/llmlingua/modelStore.ts` L31-44; `S/src/lib/memory/embedding/staticPotion.ts` L19-71.
- Expected PVC size: Unknown (no upstream figure).

## 6. Env vars (from `S/.env.example`, 3,865 lines; full reference `S/docs/reference/ENVIRONMENT.md`)
Deployment-relevant vars with their defaults:

| Var | Default | Note |
|---|---|---|
| JWT_SECRET / API_KEY_SECRET / STORAGE_ENCRYPTION_KEY | empty, auto-generated → `server.env` | Supply your own per customer via a Secret, or the PVC holds them |
| INITIAL_PASSWORD | `.env.example`: **`CHANGEME`**; image: unset | **Insecure default.** `CHANGEME` is accepted with a warning and refused only for non-loopback logins (`S/src/lib/auth/managementPassword.ts` L7-9, L48-53, L84-90) |
| REQUIRE_API_KEY | code default **false** (`featureFlagDefinitions.ts` L17-22); `.env.example` false; **image ENV true** | **Priority: DB (dashboard toggle) > env > default** (`S/src/shared/utils/featureFlags.ts` L10), so a dashboard admin can switch it off |
| requireLogin (DB setting) | true (`S/src/lib/db/settings.ts` L176) | Skipping the password step in onboarding sets requireLogin=false, which turns auth off install-wide (`S/.env.selfhost.example`, `apiAuth.ts` L533-537) |
| AUTH_COOKIE_SECURE | **false** | Must be true behind TLS |
| MACHINE_ID_SALT | `endpoint-proxy-salt` | Static public default; "change per-deployment" |
| ALLOW_API_KEY_REVEAL | false | |
| OMNIROUTE_WS_BRIDGE_SECRET | auto `randomUUID()` per process in `server-ws.mjs` L118 | DOCKER_GUIDE L354 says "required in production", which conflicts with the code that auto-generates it |
| OMNIROUTE_PEER_STAMP_TOKEN | auto per boot | Leave unset |
| PORT / DASHBOARD_PORT / API_PORT | 20128 / =PORT / =PORT | Single-port unless API_PORT is set (`S/src/lib/runtime/ports.ts` L22-28) |
| LIVE_WS_PORT / LIVE_WS_HOST | 20132 / 127.0.0.1 | Proxied in-process on the main port at `/live-ws` |
| LIVE_WS_ALLOWED_ORIGINS | loopback origins | Add your public origin |
| NEXT_PUBLIC_BASE_URL / BASE_URL | `http://localhost:20128` | Set the public https origin; keep BASE_URL internal |
| OMNIROUTE_BASE_PATH | "" | Build-time; runtime patch on start |
| OMNIROUTE_TRUST_PROXY | unset | `true`/`loopback`, `private`/`lan` |
| OMNIROUTE_TRUSTED_PROXIES | unset | Extra (public) proxy IPs/CIDRs |
| CORS_ALLOWED_ORIGINS / CORS_ALLOW_ALL | unset / false | |
| OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS | **true** | Provider URLs may target LAN/loopback; only 169.254/metadata blocked |
| OMNIROUTE_ALLOW_PRIVATE_PROVIDER_URLS | false | DB toggle wins over env |
| REDIS_URL / REDIS_KEY_PREFIX / QUOTA_STORE_DRIVER | unset / `omniroute:` / sqlite | |
| OMNIROUTE_MEMORY_MB | 1024 (image) | |
| APP_LOG_LEVEL / APP_LOG_FORMAT / APP_LOG_TO_FILE | info / text / true | |
| SHUTDOWN_TIMEOUT_MS | 30000 | |
| ENABLE_SOCKS5_PROXY | true | |
| CLOUD_URL | empty | Cloud sync off |
| DISABLE_SQLITE_AUTO_BACKUP | false | |
| SKILLS_SANDBOX_NETWORK_ENABLED / SKILLS_SANDBOX_RUNTIME | 0 / auto | |

- Provider OAuth client IDs are shipped in `.env.example` (Claude, Codex, GitHub, Kimi). These are public client IDs, not secrets.
- API-key auth required by default? In the **published image, yes** (`REQUIRE_API_KEY=true`). In npm/source/.env.example, **no**. A startup guard warns when the app binds non-loopback with it off (`S/src/lib/startup/nonLoopbackApiKeyGuard.ts`).

## 7. Memory
- Image heap 1024 MB, described as "a dashboard/light-chat floor, not a production size". From the `S/docs/guides/DOCKER_GUIDE.md` L327-340 table and `S/README.md` L1096-1108:

  | Workload | Heap | Container |
  |---|---|---|
  | Dashboard / light chat | 1024 | ≥2 GiB |
  | One coding agent | **8192** | **≥10 GiB** |
  | Two concurrent long `/v1/responses` | 10240–12288 | ≥12–16 GiB |
  | Three or more | not on one process | — |

  A V8 abort was measured at about 12 GiB heap (#7849). Native memory sits outside the heap.
- The docs conflict: `S/docs/getting-started/SELF_HOST_GUIDE.md` L185 and `.env.selfhost.example` use `OMNIROUTE_MEMORY_MB=2048` as "a safe default for a single user who runs Claude Code / Codex". VM guide: min 1 GB, recommended 2 GB RAM (`S/docs/ops/VM_DEPLOYMENT_GUIDE.md` L17-20).
- Heap is set via `OMNIROUTE_MEMORY_MB`, which the entrypoint and launcher append as `--max-old-space-size` (last flag wins). Bare-metal auto-calibration (35% of RAM, clamped 512–4096) never runs in Docker. Admission is controlled by `OMNIROUTE_CHAT_MAX_INFLIGHT_BYTES` (auto-derived), `OMNIROUTE_CHAT_ADMISSION_HEAP_SHED_RATIO=0.75` and `OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT` (legacy). Optional compression workers: `OMNI_COMPRESSION_WORKER_MAX_OLD_MB=1024`.

## 8. Health / metrics / logs
- `GET|HEAD /healthz`: 200 `ok`, or 503 `starting`/`stopping`; no DB access (`S/src/app/healthz/route.ts`). `GET /livez`: process alive (`S/src/app/livez/route.ts`). `GET /api/monitoring/health`: deep check (DB, heap, providers), heavy. The container HEALTHCHECK probes `/healthz` on 127.0.0.1, localhost, ::1 and the bridge IP (`S/scripts/dev/healthcheck.mjs`). Health paths are prefixed by OMNIROUTE_BASE_PATH.
- Metrics: **no Prometheus endpoint**. "Prometheus/OpenTelemetry export is planned for v3.9 … scrape `/api/monitoring/health` with … blackbox exporter" (`S/docs/ops/MONITORING_GUIDE.md` L495-501).
- Logs: stdout plus file (`$DATA_DIR/logs/application/app.log`, on by default). `APP_LOG_FORMAT=text|json` (default text, used by `open-sse/utils/logger.ts` L53). The main server logger is pino with ISO timestamps and a redaction hook (`S/src/shared/utils/logger.ts`). The exact stdout shape is **Unknown**: whether pino output is pretty or JSON, and the mix with `console.*` lines.

## 9. Auth model and locality trust
- Dashboard: password (bcrypt) or OIDC. JWT session cookie. `requireLogin` defaults to true. Management API also accepts API keys with `manage`/`admin` scope, `oma_` CLI access tokens, and a loopback-only machine CLI token. The /v1 proxy uses API keys when REQUIRE_API_KEY is on. Source: `S/src/server/authz/policies/management.ts`.
- First boot with no password and no INITIAL_PASSWORD:
  - **loopback** callers skip auth until `setupComplete`; non-loopback callers need auth
  - `/dashboard/onboarding` is open
  - the first-password / `POST /api/settings/require-login` write needs loopback **or** a one-shot bootstrap token printed to the log ("docker logs … | grep BOOTSTRAP")
  - Source: `S/src/shared/utils/apiAuth.ts` L99-142, L493-555.
- Locality comes from the **real TCP peer**, not Host/XFF: `server-ws.mjs` stamps `x-omniroute-peer-ip: <token>|<ip>` and strips client copies. Source: `S/scripts/dev/peer-stamp.mjs`, `S/src/server/authz/peerContext.ts`.
  - If the peer is loopback, RFC1918, CGNAT 100.64/10, ULA/link-local, Cloudflare or in OMNIROUTE_TRUSTED_PROXIES, **and** the request carries any `x-forwarded-*`, `x-real-ip`, `forwarded` or `via` header, the request is marked `via-proxy` and treated as **remote**.
  - Otherwise a loopback peer counts as **loopback** and a private-IP peer counts as **private LAN**.
- `LOCAL_ONLY` routes (spawn/exec surfaces, about 60 prefixes in `S/src/server/authz/routeGuard.ts` L34-103) are allowed when the peer is **loopback OR private LAN**. They still need normal auth afterwards unless requireLogin=false.
- K8s implications (inferred from the code above, not stated upstream):
  - (a) ingress-nginx adds XFF, so ingress traffic is "remote".
  - (b) **any in-cluster pod** (10.x/172.16/100.64) calling the Service directly without forwarding headers is "private LAN" and passes the LOCAL_ONLY gate.
  - (c) a **sidecar or `kubectl port-forward`** reaching 127.0.0.1 without forwarding headers is "**loopback**": during the fresh-install window it gets unauthenticated management access and the require-login bootstrap write, and it can use the machine CLI token path.
  - (d) a sidecar proxy that *adds* XFF makes everything "remote", so loopback-only features break. That breaks nothing core, since the dashboard and /v1 still work with session or key.
  - Whether a given mesh sidecar (Istio/Envoy) adds XFF: **Unknown**.
- Client IP for the IP allow/deny list: the right-most untrusted XFF hop when the peer is a trusted proxy (`peer-stamp.mjs` `resolveClientIp`).

## 10. Risky features (all present in the v3.8.52 code)
- **child_process** in about 66 src/open-sse files:
  - CLI tool detection and execution (codex, claude, cursor-agent, qodercli, devin, auggie, zcode…)
  - ACP agents (`src/lib/acp/*`, `execFileSync`)
  - plugins (spawned Node host + worker_threads, `src/lib/plugins/loader.ts` L248)
  - middleware hooks run JS via `vm.Script` (routeGuard L82)
  - skills sandbox runs **docker/podman** containers (`src/lib/skills/sandbox.ts`)
  - VNC sessions spawn Docker (`src/lib/vncSession/service.ts`)
  - auto-update `git checkout` + `npm install` (`/api/system/version`; the Dockerfile says the runtime shells out to npm)
  - embedded service installers via npm (`src/lib/services/installers/utils.ts`)
  - headroom python CLI, ffmpeg (video bridge), tar export, MITM/CA-trust plus `/etc/hosts` edits (`src/mitm/*`, stubbed in Docker via `OMNIROUTE_MITM_STUB=1`), Redis launcher via podman/docker (`/api/local/`)
- **Binary/model downloads**: version manager downloads and runs the CLIProxyAPI release binary (`src/lib/versionManager/binaryManager.ts`). Tailscale install, cloudflared install/start. HuggingFace model downloads. Plugin marketplace archive download (custom registry URL is SSRF-guarded, public-only).
- **Tunnels**: cloudflared, tailscale funnel, ngrok (`NGROK_AUTHTOKEN`), routes under `/api/tunnels/*`.
- **MCP**: built-in MCP server at `/api/mcp/*` (scopes `mcp:connect`/`manage`; LOCAL_ONLY with manage-scope or dashboard-session bypass for remote). `OMNIROUTE_MCP_ENFORCE_SCOPES=false` by default. No stdio MCP client transport was found.
- **SSRF surface**: user-set provider base URLs, model discovery, rerank nodes, webhooks, remote image/media fetch. Default `OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS=true` allows loopback and LAN targets (blocks only 169.254/16 and metadata hostnames). Dashboard toggles override env. Proxy pools/SOCKS5 enabled. Source: `S/.env.example` L583-614, `S/src/shared/network/outboundUrlGuardPolicy.ts`.
- **OAuth callback servers**: `startLocalServer` binds **0.0.0.0** on a fixed or random port (`S/src/lib/oauth/utils/server.ts` L72). Fixed loopback redirect ports are codex 1455, xai-oauth 56121, grok-cli 56122 (`src/lib/oauth/utils/pkceLoopbackWarning.ts`), and command-code 5959-5968. These flows only work when the browser runs on the same host. Adobe Firefly login binds 127.0.0.1:random.
- Codex app-server WS sidecar (`ws://codex-app-server:1456`), ChatGPT-web Chromium CDP sidecar (port 9223, token).

## 11. Streaming / ingress
- SSE on `/v1/*` (chat/completions, responses). WebSockets: Responses-over-WS proxy on the main port, and `/live-ws` dashboard live feed (main port proxies to 127.0.0.1:20132). Source: `S/scripts/dev/standalone-server-ws.mjs` L144-215.
- Upstream nginx example (`S/docs/ops/VM_DEPLOYMENT_GUIDE.md` L201-230): `client_max_body_size 100M`, `proxy_http_version 1.1`, `Upgrade`/`Connection "upgrade"`, `proxy_buffering off`, `proxy_cache off`, `proxy_read_timeout 600s`, `proxy_send_timeout 600s`, and forwarded headers `Host`, `X-Forwarded-Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`. Raise the timeouts with `STREAM_IDLE_TIMEOUT_MS`.
- App body limits: `MAX_BODY_SIZE_BYTES` (example 10 MiB), `OMNIROUTE_CHAT_HARD_MAX_BODY_BYTES` (example 50 MiB).
- ingress-nginx annotation set: Unknown upstream. Translate from the nginx block above.
- Set `AUTH_COOKIE_SECURE=true`, `NEXT_PUBLIC_BASE_URL=https://<host>` and `LIVE_WS_ALLOWED_ORIGINS=https://<host>`. Source: `DOCKER_GUIDE.md` Caddy section L444-460.

## 12. Security advisories
`GET /repos/cheaper-inference/OmniRoute/security-advisories?state=published&per_page=100` returns **1**:

| GHSA | CVE | Sev | Published | Vulnerable | Patched | Summary |
|---|---|---|---|---|---|---|
| GHSA-hf57-cqmx-p4gr | CVE-2026-88062 | critical (CWE-94, CWE-306) | 2026-09-03 | omniroute `< 3.8.49` | 3.8.49 | ACP custom-agent RCE: `POST /api/acp/agents` with attacker `binary`/`versionCommand` → `execFileSync`. Unauthenticated when requireLogin=false. |

- Discrepancy: the global advisory DB (`/advisories?ecosystem=npm&affects=omniroute`) lists the same GHSA, published 2026-09-10, as `<= 3.8.50`, patched **none**.
- Affects v3.8.52? Not per the repo advisory. In the v3.8.52 code, `/api/acp/agents` is LOCAL_ONLY (routeGuard L98) and `resolveVersionProbe` allows only the bare binary or a single version flag (`S/src/lib/acp/registry.ts` L191-228). That is my reading of the code, not an upstream statement. LOCAL_ONLY still admits private-LAN peers (see §9).
- The source references about 40 other GHSA IDs in comments, for example GHSA-35fw-cv32-2373, GHSA-7pq4-8pvv-rx7r, GHSA-x7vm-hp44-9p79, GHSA-jx89-f37j-pq89 and GHSA-fhh6-4qxv-rpqj. None of them appear in the published repo-advisory list, so their status is **Unknown**.

## 13. Persian (fa)
- **Present.** `S/src/i18n/messages/fa.json` has 13,935 keys, matching en.json key for key, with 437 values identical to English. `fa` is in `config/i18n.json` locales (name "فارسی") and in `rtl: [ar, fa, he, ur]`. Also present: `src/i18n/global-error-messages/fa.json`, `bin/cli/locales/fa.json` and `docs/i18n/fa/`.
- Translation quality: Unknown (not reviewed beyond sampled keys such as save→ذخیره).

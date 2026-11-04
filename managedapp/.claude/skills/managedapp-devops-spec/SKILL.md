---
name: managedapp-devops-spec
description: Complete the DevOps Technical Specification that hands a chosen open-source app to DevOps for packaging as an Iranserver managed app (one container, one persistent volume, Kubernetes, ArgoCD). Use after the app's Market Validation Brief is approved, or when someone asks what DevOps needs to know to deploy a specific app. Produces apps/<app-slug>/02-devops-technical-spec.md from templates/02-devops-technical-spec.md.
---

# Managed app: DevOps Technical Specification

You are writing the handoff from Product to DevOps. The template is `templates/02-devops-technical-spec.md`; its Guidance blocks are binding instructions.

## Inputs required

1. `apps/<app-slug>/01-market-validation-brief.md` with Status Approved. If it is not approved, stop and tell the user (Gate A).
2. From that brief: chosen software, plans, region.
3. The version to pin. If the user has none, use the latest stable release and record its tag and digest.

## Process

1. Copy the template to `apps/<app-slug>/02-devops-technical-spec.md`.
2. Read these upstream files at the pinned tag, from raw.githubusercontent.com or the repository API: Dockerfile, every docker-compose file, Helm chart and Kubernetes manifests if present (often under `deploy/`, `charts/` or `helm/`), the environment example file, the README deployment section, SECURITY.md, the GitHub security advisories and the release notes. Save notable excerpts under `apps/<app-slug>/research/`.
3. Fill each section. Mark every value **Verified** (read from upstream files) or **Assumed**. You cannot run staging: write the benchmark plan and the acceptance tests for DevOps, and leave the result cells empty for them.
4. Run the checks below and record each finding in Security hardening or Known limitations.
5. Delete every Guidance block and set Status to In review.

## Checks that have caught real problems

- **Entrypoint needs root** (for example `chown` then `su-exec`): under `runAsNonRoot` override the command and use `fsGroup`.
- **Insecure upstream defaults:** default passwords, authentication off on the API, auto-generated secrets stored where a restart loses them. Each needs a per-customer generated Secret.
- **Trust of local addresses and forwarded headers:** some apps treat `127.0.0.1` as trusted. A sidecar proxy in the pod (service mesh, auth proxy) then makes every request look local. Note whether sidecars are allowed.
- **Single-writer databases** (SQLite and similar): one replica only, `strategy: Recreate`, ReadWriteOnce volume.
- **Data outside the volume:** confirm every file the app writes lives under the mounted path (check `HOME`-based fallbacks).
- **Streaming traffic** (SSE, long responses): ingress needs proxy buffering off, long read timeouts and a larger body size.
- **Outbound requests a user can influence** (webhooks, URL fetchers, plugins): NetworkPolicy egress must block cluster, private and metadata ranges; set `automountServiceAccountToken: false`.
- **Features that cannot work hosted** (OAuth callbacks fixed to localhost, local-machine integrations): list them in Known limitations with customer-facing wording.
- **Memory:** compare documented memory needs with plan limits; set runtime heap flags (Node `--max-old-space-size`, JVM `-Xmx`) below the container limit.
- **Images:** mirror to the Iranserver registry and pin by digest; Docker Hub may be unreachable from Iran.
- **Licenses:** AGPL and similar affect hosted offerings if the code is modified.

## Writing rules

- Narrative in Persian; names, variables, YAML keys and commands in English.
- Never paste real secrets. Use placeholders such as `<generated: 32 bytes hex>`.

## Done when

- All sections are filled or explicitly assigned to DevOps, with Verified or Assumed on each value.
- Acceptance tests are listed; plan prices in the market brief are marked as pending the benchmark.
- No Guidance blocks remain; Status is In review. DevOps sets Approved after staging tests pass (Gate B).

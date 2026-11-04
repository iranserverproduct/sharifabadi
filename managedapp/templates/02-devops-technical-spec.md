# [APP NAME] - DevOps Technical Specification

Document details:

| Field | Value |
|---|---|
| App and category | [name, category] |
| Software and pinned version | [name, image tag and digest] |
| Upstream repository | [URL] |
| License | [license] |
| Market Validation Brief | [link] |
| Author | [name] |
| DevOps owner | [name] |
| Region | [Iran / Foreign / Both] |
| Plans covered | [plan names] |
| Status | [Draft / In review / Approved] |

> **Guidance.** This document is the handoff to DevOps. Inputs required: the approved Market Validation Brief (chosen software, plans, region). Read these upstream files for the pinned version before filling anything: Dockerfile, docker-compose files, Helm chart or Kubernetes manifests if they exist, the environment example file, the README deployment section, SECURITY.md, the GitHub security advisories and the release notes. Mark every value Verified (read from upstream or tested in staging) or Assumed.

## Summary

> **Guidance.** In three to five sentences: what is deployed, for whom, which plans, the main constraints (for example stateful, single replica only) and the three things DevOps must not miss.

[Summary]

## Software overview for DevOps

> **Guidance.** Describe the application in operational terms: its processes, ports, internal components, external dependencies, and what its traffic looks like (long-lived streams, websockets, large request bodies). Include how often upstream releases and how upgrades usually behave.

Overview:

| Item | Value | Verified or Assumed |
|---|---|---|
| Purpose |   |   |
| Language and runtime |   |   |
| Processes |   |   |
| Listening ports |   |   |
| Data store |   |   |
| Optional components |   |   |
| Traffic pattern |   |   |
| Release cadence |   |   |
| Image registry and our mirror |   |   |

## Platform fit

> **Guidance.** Confirm that the application fits the standard model: one container and one persistent volume, managed by ArgoCD. List anything that breaks the model (an external database, a sidecar, several volumes, root required, host ports) and the workaround, or exclude that component.

Checks:

| Check | Result | Notes |
|---|---|---|
| Single container |   |   |
| Single persistent volume |   |   |
| External database required |   |   |
| Can run more than one replica |   |   |
| Runs as non-root |   |   |
| Needs privileged or host access |   |   |
| Works behind a TLS-terminating ingress |   |   |

## Container specification

> **Guidance.** Use the upstream image from our registry mirror, pinned by tag and digest, never latest. If the entrypoint needs root (for example to change file ownership), override the command and use fsGroup instead. Use the Recreate strategy for applications with a single-writer database such as SQLite.

Container:

| Field | Value |
|---|---|
| Image |   |
| Tag and digest |   |
| Command or entrypoint override |   |
| runAsUser, runAsGroup, fsGroup |   |
| Container ports |   |
| Liveness probe |   |
| Readiness probe |   |
| Startup probe |   |
| Graceful shutdown (signal, grace period) |   |
| Deployment strategy |   |

## Configuration

> **Guidance.** List every environment variable that matters in production, from the upstream environment example and docs. For each, give its source: static (ConfigMap), generated per customer (Secret), per-customer value (for example the domain), or platform secret. Flag insecure upstream defaults that must be overridden, such as default passwords or authentication turned off. Never write real secrets in this page.

Environment variables:

| Variable | Required | Upstream default | Our value or source | Notes |
|---|---|---|---|---|
| [VARIABLE] |   |   |   |   |
| [VARIABLE] |   |   |   |   |
| [VARIABLE] |   |   |   |   |

Secret generation rules:

- [Secret name]: [length and format], generated at provisioning, delivered to the customer by [panel or email]

## Persistent storage

> **Guidance.** Say exactly what is stored and where, how large it grows and why, and how it is backed up and restored. A restore must have been tested before approval.

Storage:

| Item | Value |
|---|---|
| Mount path |   |
| Contents |   |
| Size per plan |   |
| Access mode and storage class |   |
| What makes it grow |   |
| Backup method and frequency |   |
| Restore procedure and last test date |   |
| Data retention after cancellation |   |

## Resources per plan

> **Guidance.** Do not guess. Run a benchmark in staging with a realistic workload, describe the workload, and record peak memory and CPU. Set requests at typical use and limits above the peak. If the runtime has its own heap limit (Node max-old-space-size, JVM Xmx), set it below the container memory limit. Plan prices in the Market Validation Brief are final only after this table is filled.

Resources:

| Plan | CPU request and limit | Memory request and limit | Runtime heap setting | Disk | Expected concurrent use |
|---|---|---|---|---|---|
| [plan] |   |   |   |   |   |
| [plan] |   |   |   |   |   |

**Benchmark:** workload [description]; result [peak memory, peak CPU]; date [date].

## Networking

> **Guidance.** Give the ingress host pattern and TLS setup, and the ingress annotations the traffic needs: for streaming, turn off proxy buffering and raise read timeouts; set the maximum body size; enable websockets if used. List outbound destinations and whether an outbound proxy is needed. If the application makes outbound requests that a user can influence, the NetworkPolicy must block egress to cluster, private and metadata address ranges.

Network:

| Item | Value |
|---|---|
| Service type and port |   |
| Ingress host pattern |   |
| TLS |   |
| Ingress annotations |   |
| Public paths, and paths to restrict |   |
| Outbound destinations |   |
| Outbound proxy |   |
| NetworkPolicy, ingress |   |
| NetworkPolicy, egress |   |

## Security hardening

> **Guidance.** Review the upstream security advisories (count, severity, fixed versions), insecure defaults, the authentication model, how the application trusts forwarded headers and local addresses, and any feature that runs code or makes outbound requests. Decide for each whether to disable, restrict or accept it, and record the control. Sidecar proxies in the pod can make all traffic look local to the application; check this before adding one.

Controls:

| Control | Setting | Reason |
|---|---|---|
| Pod Security level |   |   |
| securityContext (non-root, read-only root filesystem, dropped capabilities) |   |   |
| automountServiceAccountToken |   |   |
| Default credentials replaced |   |   |
| API authentication enforced |   |   |
| Forwarded header trust |   |   |
| Sidecar proxies allowed |   |   |
| Risky features disabled |   |   |
| Image scanning |   |   |
| Time to apply security updates |   |   |

Known advisories:

- [Advisory ID] - [severity] - [fixed in version] - [affects pinned version: yes or no]

## ArgoCD packaging

> **Guidance.** Use the upstream Helm chart if one exists and meets our standards; otherwise use our base chart or Kustomize. Define the per-customer parameters, values per plan, sync policy, naming, and the Git path.

Packaging:

| Item | Value |
|---|---|
| Source (chart or Kustomize, Git path) |   |
| Chart version |   |
| Per-customer parameters |   |
| Values per plan |   |
| Sync policy (automated, prune, selfHeal) |   |
| Sync waves or hooks |   |
| Namespace and naming convention |   |
| Labels and annotations for billing and monitoring |   |

## Lifecycle procedures

### Provisioning

> **Guidance.** List the steps from a panel order to a running instance, including what is generated per customer.

1. [Step]

### First run and handover

> **Guidance.** What the customer receives (URL, initial credentials, help links) and what they must do at first login, such as changing the password.

[Handover details]

### Upgrade

> **Guidance.** Version pinning policy, how a new version is tested in staging, database migrations, a volume snapshot before upgrade, and the rollback procedure.

1. [Step]

### Deprovisioning

> **Guidance.** What happens to the data and resources when a customer cancels, and after how long.

[Procedure]

## Observability

Monitoring:

| Item | Value |
|---|---|
| Logs (format and destination) |   |
| Metrics endpoint |   |
| Dashboards |   |
| Alerts (restarts, disk above 80 percent, 5xx rate, certificate expiry) |   |
| Upstream release and advisory watch |   |

## Known limitations

> **Guidance.** List features that do not work or are turned off in the hosted deployment, and why. The customer-facing wording goes to the FAQ in the Landing Page Content Brief.

Limitations:

| Feature | Status in our deployment | Reason | Customer-facing note |
|---|---|---|---|
| [feature] |   |   |   |
| [feature] |   |   |   |

## Acceptance tests

> **Guidance.** All tests must pass in staging before Gate B. Record the result and the date.

Tests:

| Test | Expected result | Result | Date |
|---|---|---|---|
| Fresh provisioning from the panel |   |   |   |
| Login with generated credentials and password change |   |   |   |
| Core user flow end to end: [flow] |   |   |   |
| Data persists after pod restart and node drain |   |   |   |
| Backup and restore |   |   |   |
| Upgrade to the next version and roll back |   |   |   |
| Unauthenticated access to API and admin paths is refused |   |   |   |
| Resource use stays within plan limits under the benchmark |   |   |   |
| Deprovisioning follows the retention policy |   |   |   |

## Open questions and sign-off

- [Question] - [owner] - [due date]

Sign-off:

| Role | Name | Date | Notes |
|---|---|---|---|
| Product |   |   |   |
| DevOps |   |   |   |
| Security |   |   |   |

## References

- [Upstream file] - [URL] - [tag or commit]

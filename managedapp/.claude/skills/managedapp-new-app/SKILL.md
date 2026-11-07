---
name: managedapp-new-app
description: Run the full Iranserver managed app process for a new or updated app category in this repository, from market validation through DevOps specification to landing page content, with a branch and pull request. Use when someone says they want to add an app to the managed app catalog, evaluate a new app, or update an existing app's documents.
---

# Managed app: end-to-end workflow

This skill coordinates the three document skills and the Git workflow. Read `CONTRIBUTING.md` and `templates/00-how-to-use.md` before starting. The managed app files live in the `managedapp/` folder of the `iranserverproduct/sharifabadi` repository; every path in these skills is relative to that folder.

## Steps

1. **Agree the scope with the user:** app category, region, app slug, and whether this is a new app or an update to `apps/<app-slug>/`.
2. **Branch:** `managedapp/<app-slug>` for a new app, `managedapp/<app-slug>-<short-topic>` for an update. Branch from the latest `main`.
3. **Market Validation Brief:** run the `managedapp-market-validation` skill. Commit as `docs(<app-slug>): market validation brief`. Open a draft pull request with the contents of `PULL_REQUEST_TEMPLATE.md` as its description, titled `[<app-slug>] <App category>`.
4. **Gate A:** stop. A reviewer sets the brief to Approved or Rejected in the pull request. If Rejected, set the decision to No-go, update `apps/README.md`, and the pull request can be merged to record the decision.
5. **DevOps Technical Specification:** after Gate A, run `managedapp-devops-spec`. Commit as `docs(<app-slug>): devops technical spec`.
6. **Gate B:** stop. DevOps runs the benchmark and acceptance tests in staging and sets Approved.
7. **Landing Page Content Brief:** after Gate B, run `managedapp-landing-content`. Commit as `docs(<app-slug>): landing page content`.
8. **Gate C:** Marketing, Product and Legal approve.
9. **Index:** add or update the app's row in `apps/README.md`.
10. **Merge:** mark the pull request ready for review. It is merged when the `validate` check passes and the reviewers approve.

## Rules

- One pull request per app or per update. Do not mix two apps in one pull request.
- Never set a document's Status to Approved yourself; only the named reviewers do.
- Every document in the app folder, including `research/`, is written in Persian; see the language rule in `templates/00-how-to-use.md`.
- Do not push directly to `main`.
- Keep raw research under `apps/<app-slug>/research/`; do not commit credentials or tokens.

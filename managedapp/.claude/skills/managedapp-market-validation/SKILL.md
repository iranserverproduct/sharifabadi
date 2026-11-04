---
name: managedapp-market-validation
description: Complete the Market Validation Brief for a candidate Iranserver managed app (an app category offered as a one-click container on Kubernetes/ArgoCD, in the Iran or foreign region). Use when someone wants to know whether a new app category is worth adding, how big the demand is, or which open-source software to ship for it. Produces apps/<app-slug>/01-market-validation-brief.md from templates/01-market-validation-brief.md.
---

# Managed app: Market Validation Brief

You are completing the first of three documents an Iranserver managed app needs before launch. The document decides Go, Beta or No-go for an app category and chooses the software to ship. The template is `templates/01-market-validation-brief.md`; its Guidance blocks are binding instructions.

## Inputs required

Ask the user for any of these you do not have before starting:

1. App category or product idea (for example "AI gateway", "error tracking").
2. Target region: Iran, foreign, or both.
3. App slug for the folder name, lowercase with hyphens (for example `ai-gateway`).
4. Anything already known: candidate software, competitor names, pricing constraints.

## Platform facts to apply

- Every managed app runs as one container with one persistent volume, deployed by ArgoCD on Kubernetes.
- The current catalog is listed at https://www.iranserver.com/managedapp/ ; read it to avoid duplicates and to find cross-sell links.
- Iran-region pods cannot reach many foreign services; foreign-region pods can, but some providers block Iranian users regardless of IP. Treat sanctions, payment in Rial and provider terms of service as first-class factors.

## Process

Work in this order. Do not name specific software before step 6.

1. **Set up.** Create `apps/<app-slug>/` and copy the template to `apps/<app-slug>/01-market-validation-brief.md`. Save raw research outputs under `apps/<app-slug>/research/`.
2. **Define the product category** (template sections Product definition, End-user features, Target users and jobs to be done, User flows). Describe the category generically. Use the user-personas and job-stories skills if available.
3. **Collect demand signals** with Apify. Always pass `callOptions.maxTotalChargeUsd` (0.03 to 0.06 per run is enough) because the account budget is small.
   - YouTube: actor `delicious_zebu/youtube-video-scraper-by-keyword`, input `{"search_keywords": [...], "max_results": 12, "type": "videos", "sort_by": "relevance", "fetch_video_details": false}`. Use at least one Persian user-language query (how users phrase the problem, not the product name) and one English query.
   - Google Trends: actor `apify/google-trends-scraper`, input `{"searchTerms": ["term1,term2,term3"], "isMultiple": true, "maxItems": 1, "skipDebugScreen": true}`. Read `interestOverTime_averages`, `interestBy` (find geoCode IR) and `relatedQueries_rising`.
   - Web pages: `apify/rag-web-browser` with `maxResults` 2 or 3 for competitor pages. Fall back to normal web search and fetch when Apify fails or the budget is exhausted, and say so in the document.
   - Record every figure with its source and date. Save dataset IDs in Sources.
4. **Collect adoption data** from public APIs (no Apify needed):
   - GitHub: `https://api.github.com/repos/<owner>/<repo>` (stars, pushed_at, license), `/releases`, `/security-advisories`.
   - Docker Hub: `https://hub.docker.com/v2/repositories/<ns>/<repo>/` (pull_count) and `/tags?page_size=5` (image sizes).
   - npm: `https://api.npmjs.org/downloads/point/last-month/<package>`.
   - One-click marketplaces (for example Railway template pages) for deploy counts of hosted offers: this is the best proxy for willingness to pay for hosting.
5. **Analyse.** Run the market-scan skill (SWOT, PESTLE, Porter's Five Forces, Ansoff), the market-sizing skill (TAM, SAM, SOM, top-down and bottom-up), competitor-analysis and pricing-strategy, then market-product for positioning. Ground each factor in the data from steps 3 and 4. Run pre-mortem for the Risks section.
6. **Select software.** Only now list candidates. Derive criterion weights from earlier sections and say which section justifies each. Apply the gate filter (one container and one volume, web interface if users need one, license allows commercial hosting, maintained in the last 90 days). For each remaining candidate read its Dockerfile, compose file, Helm chart, environment example, README deployment section and security advisories, and record documented memory needs and whether the UI supports Persian. Score 1 to 5, compute the weighted total, run a sensitivity check, and state the decision and the runner-up's role.
7. **Write the Executive summary last**, decision first.
8. **Clean up.** Replace every placeholder, delete every Guidance block, set Status to In review. Only a human reviewer sets Approved.

## Writing rules

- Narrative text in Persian; software names, variables, commands and code in English.
- Never invent numbers. Missing data is "Unknown" plus an Open questions entry.
- Label estimates "Estimate" with a confidence level.
- Do not promise "free" or "unlimited" in positioning when the value depends on third-party free tiers or personal subscriptions.

## Done when

- All sections are filled, no `[placeholder]` or `> **Guidance.**` lines remain, Status is In review.
- The software decision follows from the scoring table.
- Sources list every URL with access date and every Apify dataset ID.
- Next: the DevOps Technical Specification (`managedapp-devops-spec`) starts only after a reviewer sets this document to Approved (Gate A).

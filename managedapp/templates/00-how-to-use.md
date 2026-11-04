# Managed App Document Templates

These templates define the three documents every new Iranserver managed app needs: a market validation brief, a DevOps technical specification and a landing page content brief. Each app gets its own copy of all three, in that order. A document is started only after the previous one is approved.

## The three documents

Overview:

| Document | Purpose | Owner | Starts from | Approved when |
|---|---|---|---|---|
| 1. Market Validation Brief | Decide whether the app category deserves a place in the catalog, and which software to ship | Product and Marketing | A category idea | Decision is Go or Beta, software is chosen, sign-off table is complete |
| 2. DevOps Technical Specification | Give DevOps everything needed to package and run the chosen software on Kubernetes with ArgoCD | Product with DevOps | Approved Market Validation Brief | All acceptance tests pass in staging and DevOps signs off |
| 3. Landing Page Content Brief | Turn approved facts into landing page copy | Marketing and Content | Approved brief and approved spec | Claims check is complete and Legal and Product sign off |

## Workflow and gates

1. Create a branch named `managedapp/<app-slug>` and copy the three templates into `managedapp/apps/<app-slug>/` (see CONTRIBUTING.md). The approved files are mirrored to Confluence under the app's parent page.
1. Complete the Market Validation Brief and hold a review. **Gate A:** no technical work starts until the decision is Go or Beta.
1. Complete the DevOps Technical Specification. DevOps deploys to staging, runs the resource benchmark and the acceptance tests. **Gate B:** plans and prices are final only after the benchmark.
1. Write the Landing Page Content Brief from approved facts only. **Gate C:** the claims and compliance check is complete.
1. Launch. After the Beta period, update the monitoring and decision sections of the Market Validation Brief.

## Conventions

- **Placeholders** are written in square brackets, for example [APP CATEGORY]. Replace every placeholder; an approved document has none left.
- **Guidance blocks** are the quoted paragraphs that start with "Guidance." They tell the author, a person or an AI model, how to complete the section. Delete them before a document's status is set to Approved; the repository check fails if any remain. In Confluence, put them in a collapsed Expand macro.
- **Facts and estimates.** Every number has a source and a date. Estimates are labelled "Estimate" with a confidence level: High, Medium or Low.
- **Verified and Assumed.** In the technical specification, every value is marked Verified (read from upstream files or tested in staging) or Assumed.
- **Category before software.** The Market Validation Brief describes the product category. Specific software is named only in its Software selection section, and the choice must follow from the scoring there.
- **Language.** Write narrative text in Persian. Keep software names, environment variables, commands and code in English.
- **Status values:** Draft, In review, Approved, Rejected.

## Using these templates with an AI model

To have an AI model complete a document, give it the template tab together with the instruction block below. The same text can be used as the body of a reusable skill.

> **Instructions for the AI model.** You are completing an Iranserver managed app document. Keep every heading, in order. Replace every placeholder. Follow each Guidance block, then delete it. Do not invent data: each figure comes from a tool result or a cited source, with its date. When data is missing, write "Unknown" and add the item to Open questions. Keep facts and estimates apart. Before starting, ask the user for any input listed under Approved inputs or Inputs required that you do not have. Write the final text in Persian, except names, variables and code.

Recommended research path:

1. Read Iranserver's current managed app list and the platform model: one container and one persistent volume per app, managed by ArgoCD, offered in the Iran region, the foreign region or both.
1. Define the product category, its users and their jobs before looking at any software.
1. Collect demand signals with Apify: YouTube Search Scraper (Persian and English queries), Google Trends Scraper (worldwide and Iran share), RAG Web Browser for competitor pages. Set a spending cap on every run with maxTotalChargeUsd.
1. Collect adoption data from public APIs: GitHub (stars, releases, open issues, security advisories), Docker Hub (pulls, tags, image size), npm or PyPI downloads, and one-click template marketplaces.
1. Run the analysis skills: market-scan (SWOT, PESTLE, Porter's Five Forces, Ansoff), market-sizing (TAM, SAM, SOM), competitor-analysis, pricing-strategy and market-product (positioning and value propositions).
1. Build the software shortlist only after the selection criteria exist. For each candidate, read the Dockerfile, compose file, Helm chart, environment example, README deployment section and security advisories.
1. Fill the technical specification from the chosen software's repository files and from staging tests.
1. Write landing copy only from approved facts, then run the claims check and proofread.

Skill and tool map:

| Section | Skill or tool | Output |
|---|---|---|
| Market brief: Demand signals | Apify YouTube Search Scraper, Apify Google Trends Scraper, GitHub, Docker Hub and npm APIs | Signal table with dates |
| Market brief: Competitors and substitutes | competitor-analysis, Apify RAG Web Browser | Competitor table |
| Market brief: Market scan | market-scan (swot-analysis, pestle-analysis, porters-five-forces, ansoff-matrix) | Four frameworks and a synthesis |
| Market brief: Market sizing | market-sizing | TAM, SAM and SOM table with assumptions |
| Market brief: Software selection | Weighted scoring in the template, upstream repository files | Ranked candidates and decision |
| Market brief: Pricing and positioning | pricing-strategy, market-product (positioning-ideas, value-prop-statements) | Plan table and positioning options |
| Market brief: Risks | pre-mortem | Risk table |
| Technical specification | Upstream Dockerfile, compose, Helm chart, env example, SECURITY.md, staging benchmark | Verified configuration |
| Landing brief | market-product (value-prop-statements, marketing-ideas, product-name), proofread | Approved copy |

Questions about these templates go to the Product team.

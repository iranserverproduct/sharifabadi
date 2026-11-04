# [APP CATEGORY] - Market Validation Brief

Document details:

| Field | Value |
|---|---|
| App category | [for example: AI gateway] |
| Candidate software | [filled in Software selection] |
| Region | [Iran / Foreign / Both] |
| Author | [name] |
| Reviewers | [names] |
| Date | [YYYY-MM-DD] |
| Status | [Draft / In review / Approved / Rejected] |
| Decision | [Go / Beta / No-go] |
| Related documents | [DevOps Technical Specification link], [Landing Page Content Brief link] |

> **Guidance.** Fill the category and region first. Fill candidate software, decision and status last. Inputs required before starting: the category idea, the target region, and the current managed app list.

## Executive summary

> **Guidance.** Write this section last. Open with the decision and the main reason in three to five sentences. Then give the supporting facts. A reader who reads only this section should know what was decided and why.

- **Decision:** [Go / Beta / No-go]
- **Demand:** [strength of the need, with the key figure]
- **Willingness to pay for a managed version:** [evidence]
- **Recommended software:** [name and plan role]
- **Year-one obtainable market (SOM):** [figure]
- **Main risk:** [risk]
- **Next step:** [step, owner, date]

## Product definition

> **Guidance.** Describe the category, not a particular tool. Give a one-paragraph definition, a plain comparison a non-technical reader understands, how the product sits between the user and other systems (a short diagram or three to five steps), and what the managed version adds over self-installing: one-click deploy, domain and SSL, updates, backups, scaling, region, payment in Rial, Persian support.

- **What it is:** [definition]
- **In plain terms:** [comparison]
- **How it works:** [diagram or steps]
- **What the managed version adds:** [list]

## End-user features

> **Guidance.** Group features by the outcome the user gets, for example access, reliability, cost control, team and security, availability. List only features common to the category; features of one specific tool belong in Software selection. Write the value in the customer's words, and flag any feature with legal or terms-of-service risk.

Features:

| Group | Feature | Value to the user | Risk or notes |
|---|---|---|---|
| [group] | [feature] | [value] | [risk] |
| [group] | [feature] | [value] | [risk] |
| [group] | [feature] | [value] | [risk] |

## Target users and jobs to be done

> **Guidance.** Describe three to five personas based on evidence: existing customers, support tickets, interviews, community content and video comments. For each, give the current situation, the main pain and the goal. Then write job statements in the form "When [situation], I want to [motivation], so I can [outcome]". End with the user's ultimate goal in one sentence. Skills: user-personas, job-stories.

Personas:

| Persona | Current situation | Main pain | Goal |
|---|---|---|---|
| [persona] |   |   |   |
| [persona] |   |   |   |
| [persona] |   |   |   |

Jobs to be done:

- When [situation], I want to [motivation], so I can [outcome].
- When [situation], I want to [motivation], so I can [outcome].

**Ultimate user goal:** [one sentence]

## User flows

> **Guidance.** Describe the end-user flow from purchase to daily use and monitoring, and mark the step that will create the most support tickets. Then describe the operator flow inside Iranserver, from order to provisioning, updates, backup and support. Add two or three usage scenarios. The support team should be able to draft help articles from this section.

End-user flow:

| Step | What the user does | What the user sees or what happens | Support note |
|---|---|---|---|
| Purchase |   |   |   |
| Provisioning |   |   |   |
| First login |   |   |   |
| Initial configuration |   |   |   |
| Connecting tools or integrations |   |   |   |
| Daily use |   |   |   |
| Monitoring |   |   |   |
| Maintenance |   |   |   |

Operator flow:

1. [Order in the panel creates the ArgoCD application from the template]
1. [Per-customer secrets, volume, service, ingress and network policy are created]
1. [Health check and delivery of login details]
1. [Updates and security monitoring]
1. [Backup and support]

Usage scenarios:

- [Persona]: [scenario and outcome]
- [Persona]: [scenario and outcome]

## Demand signals

> **Guidance.** Collect at least: YouTube results for the three most common Persian and English user queries (views and upload date) with the Apify YouTube Search Scraper; Google Trends for the category terms and leading tools, worldwide and Iran share, with the Apify Google Trends Scraper; adoption data from GitHub stars, Docker Hub pulls and npm or PyPI downloads; and the traction of existing hosted offers, such as deploy counts of one-click templates. Record the source and date of every figure. Then interpret: is the demand for the need, or for a specific brand? Is there evidence of willingness to pay for hosting?

Signals:

| Signal | Query or source | Value | Date | Interpretation |
|---|---|---|---|---|
| YouTube, Persian |   |   |   |   |
| YouTube, English |   |   |   |   |
| Google Trends, worldwide |   |   |   |   |
| Google Trends, Iran share |   |   |   |   |
| GitHub stars and activity |   |   |   |   |
| Docker pulls and package downloads |   |   |   |   |
| Hosted offer traction |   |   |   |   |

**Interpretation:** [two or three sentences]

## Competitors and substitutes

> **Guidance.** Cover four types: Iranian hosting providers offering the same thing (direct), global one-click or SaaS offers, Iranian services that solve the same job differently (for example a Rial-billed SaaS), and do-it-yourself (installing on a laptop or VPS). For each, give the offer, price, payment method, strength and weakness. If a type has no entry, say so. Skills: competitor-analysis; use the Apify RAG Web Browser to read competitor pages.

Competitors and substitutes:

| Name | Type | Offer, price and payment | Strength | Weakness |
|---|---|---|---|---|
| [name] | Direct |   |   |   |
| [name] | Global SaaS or one-click |   |   |   |
| [name] | Iranian substitute |   |   |   |
| Self-install | Do-it-yourself |   |   |   |

## Market scan

> **Guidance.** Run the market-scan skill. Base every factor on data from the earlier sections. PESTLE must cover sanctions, payment, provider terms of service and filtering. Porter's Five Forces ends with an attractiveness rating, separately for revenue and for customer acquisition. Ansoff names concrete opportunities, not generic ones. The synthesis is the most important part: say what the frameworks agree on.

### SWOT

SWOT:

| Strengths (internal) | Weaknesses (internal) |
|---|---|
| [item] | [item] |
| Opportunities (external) | Threats (external) |
| [item] | [item] |

### PESTLE

PESTLE:

| Factor | Current state | Impact | Trend | Timeframe |
|---|---|---|---|---|
| Political |   |   |   |   |
| Economic |   |   |   |   |
| Social |   |   |   |   |
| Technological |   |   |   |   |
| Legal |   |   |   |   |
| Environmental |   |   |   |   |

### Porter's Five Forces

Five forces:

| Force | Intensity | Key drivers | Implication |
|---|---|---|---|
| Competitive rivalry |   |   |   |
| Supplier power |   |   |   |
| Buyer power |   |   |   |
| Threat of substitutes |   |   |   |
| Threat of new entrants |   |   |   |

**Industry attractiveness:** [High / Medium / Low] for revenue; [High / Medium / Low] for customer acquisition.

### Ansoff matrix

Growth options:

| Strategy | Concrete opportunity | Risk | Investment | Priority |
|---|---|---|---|---|
| Market penetration |   |   |   |   |
| Market development |   |   |   |   |
| Product development |   |   |   |   |
| Diversification |   |   |   |   |

### Synthesis

- **Converging signals:** [what the frameworks agree on]
- **Strategic imperatives:** [actions that must happen]
- **Key risks:** [highest-priority threats]
- **Best opportunity:** [risk-adjusted opportunity]

## Market sizing

> **Guidance.** Run the market-sizing skill. Define the market: problem, customer segment, geography, and what is excluded. Estimate TAM top-down (a global industry figure narrowed by Iran's share, adjusted for purchasing power and sanctions) and bottom-up (number of users times adoption times price), then reconcile the two. SAM applies the filters that make a customer serviceable, including preference for a hosted version over self-install. SOM is the share obtainable in one to three years, with its basis. Give values in USD and note the Rial exchange rate and its date.

**Market definition:** [problem, segment, geography, exclusions]

Market size:

| Metric | Current estimate | Two to three year projection | Method |
|---|---|---|---|
| TAM |   |   |   |
| SAM |   |   |   |
| SOM |   |   |   |

Assumptions:

| Number | Assumption | Confidence | How to validate |
|---|---|---|---|
| 1 |   |   |   |
| 2 |   |   |   |
| 3 |   |   |   |

## Software selection

> **Guidance.** Name specific software only in this section. Step 1: set the selection criteria and their weights from the earlier sections, and say which section justifies each weight; weights add up to 100. Step 2: apply the gate filter; a candidate that fails any gate is excluded. Step 3: record each candidate's technical facts from its repository: Dockerfile, compose file, Helm chart, environment example, documented memory needs, user interface languages including Persian, and security advisories. Step 4: score each criterion from 1 to 5 and compute the weighted total out of 100. Step 5: test sensitivity, meaning which weight change would change the winner. Step 6: state the decision and the role of the runner-up, for example a premium plan. The decision must follow from the scores, not from preference.

### Selection criteria

Criteria and weights (defaults; adjust and justify):

| Criterion | Weight | Justified by |
|---|---|---|
| Fit with the platform model (one container, one volume, Kubernetes) | 15 | [section] |
| Resource cost per customer | 20 | [section] |
| Fit with user jobs | 20 | [section] |
| Ease of use and Persian interface | 15 | [section] |
| Security and maintenance burden | 15 | [section] |
| Momentum and awareness in Iran | 10 | [section] |
| License allows commercial hosting | 5 | [section] |

### Gate filter

Minimum requirements:

| Software | One container and one volume | Web interface for the user | License allows hosting | Maintained in last 90 days | Result |
|---|---|---|---|---|---|
| [candidate] |   |   |   |   | [Continue / Excluded] |
| [candidate] |   |   |   |   |   |
| [candidate] |   |   |   |   |   |

### Candidate facts

Technical facts per candidate:

| Item | [Candidate A] | [Candidate B] | [Candidate C] |
|---|---|---|---|
| Repository and license |   |   |   |
| Stack and database |   |   |   |
| Documented memory need |   |   |   |
| Image size |   |   |   |
| Runs as non-root |   |   |   |
| Secure defaults |   |   |   |
| Persian interface |   |   |   |
| Security advisories (count, worst severity) |   |   |   |
| Release cadence |   |   |   |
| Adoption (stars, pulls, downloads) |   |   |   |

### Scoring

Scores from 1 to 5:

| Criterion (weight) | [Candidate A] | [Candidate B] | [Candidate C] |
|---|---|---|---|
| Platform fit (15) |   |   |   |
| Resource cost (20) |   |   |   |
| Fit with user jobs (20) |   |   |   |
| Ease of use and Persian (15) |   |   |   |
| Security and maintenance (15) |   |   |   |
| Momentum and awareness (10) |   |   |   |
| License (5) |   |   |   |
| Total out of 100 |   |   |   |

**Sensitivity:** [which weight change would change the winner]

**Decision:** [software] for [plan]; [runner-up] for [role]; excluded: [software] because [reason].

## Pricing and packaging

> **Guidance.** Run the pricing-strategy skill. Use the documented resource needs from Candidate facts (confirmed later by the benchmark in the technical specification), competitor prices and the ARPU used in Market sizing. Define each plan with resources and price, in USD equivalent and in Rial. State what will be tested during the Beta.

Plans:

| Plan | Target persona | Resources | Price (USD equivalent) | Price (Rial) | Includes |
|---|---|---|---|---|---|
| [plan] |   |   |   |   |   |
| [plan] |   |   |   |   |   |

**Beta tests:** [price points or packaging to test]

## Positioning and messaging

> **Guidance.** Run the market-product skill. Give two or three positioning options, each against a named competitor or substitute, with its strength and risk. Choose one and give the tagline and a short elevator pitch. List claims to avoid, for example "free" or "unlimited" when they depend on third parties. These become approved inputs for the landing page.

Positioning options:

| Option | Positioning statement | Against | Strength | Risk |
|---|---|---|---|---|
| 1 |   |   |   |   |
| 2 |   |   |   |   |
| 3 |   |   |   |   |

- **Recommended positioning:** [option and reason]
- **Tagline:** [one line]
- **Elevator pitch:** [two or three sentences]
- **Claims to avoid:** [list]

## Risks and compliance

> **Guidance.** Run the pre-mortem skill. Cover legal risks (provider terms of service, sanctions, the foreign data center's acceptable use policy, licenses such as AGPL), security (upstream advisories, exposed features), operations (upstream abandoned, breaking releases) and commercial risks. Give each a likelihood, impact, mitigation and owner.

Risks:

| Risk | Type | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| [risk] | Legal |   |   |   |   |
| [risk] | Security |   |   |   |   |
| [risk] | Operational |   |   |   |   |
| [risk] | Commercial |   |   |   |   |

## Launch criteria and monitoring

> **Guidance.** Set the Beta length, success metrics with numbers, and stop criteria. List the signals to monitor after launch, with source and frequency. Revisit this section at the end of the Beta and record the outcome.

- **Beta period:** [length and dates]
- **Success criteria:** [for example: number of paying instances, monthly churn]
- **Stop criteria:** [thresholds]

Monitoring plan:

| Signal | What to watch | Source | Frequency |
|---|---|---|---|
| Demand |   |   |   |
| Upstream health |   |   |   |
| Competitors |   |   |   |
| Product usage |   |   |   |

## Open questions

- [Question] - [owner] - [due date]

## Approval

Sign-off:

| Role | Name | Decision | Date |
|---|---|---|---|
| Product |   |   |   |
| Marketing |   |   |   |
| DevOps lead |   |   |   |
| Legal and compliance |   |   |   |
| Management |   |   |   |

## Sources

> **Guidance.** List every source with its URL and access date, and the IDs of the Apify datasets used.

- [Source title] - [URL] - [access date]

---
name: managedapp-landing-content
description: Write the Persian landing page content brief for an Iranserver managed app from its approved Market Validation Brief and DevOps Technical Specification. Use when someone needs landing page copy, SEO fields, FAQ or pricing copy for a managed app. Produces apps/<app-slug>/03-landing-page-content-brief.md from templates/03-landing-page-content-brief.md.
---

# Managed app: Landing Page Content Brief

You are writing customer-facing copy. The template is `templates/03-landing-page-content-brief.md`; its Guidance blocks are binding instructions.

## Inputs required

1. `apps/<app-slug>/01-market-validation-brief.md` with Status Approved.
2. `apps/<app-slug>/02-devops-technical-spec.md` with Status Approved.

If either is not approved, stop and tell the user (Gates A and B).

## Process

1. Copy the template to `apps/<app-slug>/03-landing-page-content-brief.md`.
2. Fill Approved inputs first by copying, not paraphrasing, from the two source documents: positioning, personas, jobs, plans and prices, supported features, known limitations, claims to avoid, competitors.
3. Take keywords from the brief's Demand signals: the Persian phrases users search and use in video titles.
4. Write each section in Persian, using the market-product skill (value-prop-statements, marketing-ideas, positioning-ideas). Every feature must appear in the technical specification. Every limitation must appear in the FAQ.
5. Write two hero headline variants for an A/B test.
6. Complete the Claims and compliance check. Run the proofread skill on the Persian text.
7. Delete every Guidance block and set Status to In review.

## Writing rules

- Plain Persian in the customer's words; no exaggeration.
- No "free", "unlimited" or guaranteed-access claims unless Legal approved them in writing.
- Do not describe competitors negatively; get Legal review before naming one.
- Use third-party names and logos only as their trademark rules allow.
- Meta title at most 60 characters, meta description at most 155, slug in English.

## Done when

- Every claim traces to the brief or the specification.
- The compliance checklist is fully ticked.
- No Guidance blocks remain; Status is In review. Marketing, Product and Legal set Approved (Gate C).

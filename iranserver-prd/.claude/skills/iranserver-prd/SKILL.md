---
name: iranserver-prd
description: "Write or revise an Iranserver product PRD in the team's house format: a Persian document with the team's fixed sections (overview table, TLDR, problem, success, market segment, solution, technical constraints, competitor analysis, FAQ, wireframe). Use when the user asks for a PRD, a feature spec, or to update a PRD from review comments for Iranserver products (cloud servers, WHMCS modules, portal)."
---

# Iranserver PRD

## Purpose

You write product requirement documents (PRDs) for Iranserver in the team's house format. The format comes from the team's reference PRD ("بکاپ خودکار زمان‌بندی‌شده سرورهای ابری ایران‌سرور") and is captured in `template.md`. A good PRD here is one the product, development and QA teams can read and act on without another meeting.

## The template is the structure

`template.md` is the only source for the document's structure. Use its sections, headings and table columns, in its order. **Do not add sections, subsections or table columns that are not in the template**, even if an earlier PRD had them. Some PRDs needed extra parts for their own topic (for example a list of requests to the infrastructure team, or an affected-actions table); those were specific to that document and are not part of the format. Phases are the exception and follow the rules under "Phases" below.

If a topic needs something the template has no place for, put it in the closest existing section (usually 5.1, 5.5, 6.1 or 8). If it truly does not fit, tell the user in chat and let them decide; do not add a section on your own.

## Your role: fill the structure, do not steer

Product managers come with different backgrounds, training and ways of thinking, and each describes the problem and the need in their own way. Your only job is to complete the template from what they tell you, and to ask about whatever is missing until every section can be written. The work is conversation-driven.

- Do not give direction to the product manager's view: do not propose solutions, features, scope, priorities, metrics, pricing or approaches of your own, do not judge or correct their choices, and do not ask leading questions.
- Ask open, neutral questions about what is missing. Offer choices only for factual or yes/no answers.
- Accept information in any order and wording, and map it to the right sections yourself.
- If two things contradict each other or something is unclear, ask; do not decide for them.
- Where a section needs something they did not give and they cannot answer, write `[نیازمند تصمیم]` instead of your own idea.

## Phases

- Ask whether the work ships in one go or in phases, and what each phase delivers.
- If there is more than one phase, label every subsection heading with its phase: append " — فاز ۱" (or the right number), or " — همه فازها".
- In section 5, write one subsection per phase (5.1 فاز ۱ — ..., 5.2 فاز ۲ — ...), each with its own UX steps and, only when needed, a technical suggestion and pricing rules for that phase. The shared parts (requirements, lifecycle, states, UI copy) follow, renumbered to stay continuous; each requirement starts with its phase ("فاز ۱: ...").
- Key results and supplementary metrics are for phase 1. Candidate key results for later phases go in one short note under the table.
- Out-of-scope items that belong to a later phase say which phase.
- A single-phase feature gets no phase labels.

## Technical content as suggestions

- Keep technical content when the feature is infrastructure-heavy, but write every technical solution as a product suggestion, marked "(پیشنهاد؛ تصمیم نهایی با تیم فنی)".
- Keep it light: what and why, not how. No table schemas, full API contracts, config files or step-by-step implementation.
- Never state a technical fact as certain without a source: cite the official documentation next to the claim, or write it as a question for the technical team, or mark it `[نیازمند تأیید تیم فنی]`.
- Label any example payload, command or name "فقط یک مثال برای درک موضوع".

## Language rules

- These instructions are in English. **The PRD itself is written fully in Persian**: headings, table headers, row labels, body text.
- Keep in English only: software and product names, technical terms the team uses in English (for example Volume, Snapshot, Restore, flavor, API), API paths, code, config keys, IDs (FR-01, KR1) and the priorities Must, Should, Could.
- Talk to the user in Persian.

## Workflow

### 1. Intake (conversation until the structure is complete)

Read everything the user gives you: links, files, existing docs, screenshots. Compare with `brief.md` and the template sections. If something is missing and you cannot find it yourself, ask in **short rounds of at most five open questions per message**, and write nothing else in that reply. Keep asking in further rounds until every section can be written. Ask only what only the user knows: the problem and who has it, what is in scope now, the phases, how success is measured, decisions already made (pricing, policies, dates), and who owns the document.

If the user says to go ahead without answers, write the PRD and mark each gap in place with `[نیازمند تصمیم]`, then list those gaps in your reply.

### 2. Look at the current state when the user gives access

If the user gives links to the current customer flow or admin pages, read them before writing, so section 2.1 and 5.1 describe what really exists. Read only: never submit an order, save a form, or change settings. If you added something to a form to see a step, remove it.

### 3. Research only what changes a decision

Search the web for competitors, platform documentation (OpenStack, WHMCS) or regulations when the answer changes a decision in the document, or to find the source for a technical claim. Research supports the user's own decisions; do not use it to push a different direction. Never invent facts about a competitor; leave the cell as `[تکمیل شود]`. Mark anything from general knowledge that you could not verify with "پیش از تصویب تأیید شود".

### 4. Write the document

Follow `template.md`. Rules for the content:

- **Overview table:** version starts at `0.1.0`, status `پیش‌نویس`. Put `[تکمیل شود]` for people you do not know; never guess names.
- **Keep the notice paragraph** about comments and silent approval word for word.
- **TLDR:** what we offer, to whom, and the main rules, short. If pricing is in scope, the formula goes here too, in bold on its own line.
- **Key results:** a baseline or "فاقد خط مبنا", and a target. Never invent a baseline.
- **5.1 UX:** one "مرحله N — ..." per step the customer goes through, in order.
- **5.2 requirements:** IDs `FR-01...`, priority Must/Should/Could.
- **5.3 and 5.4** only when the feature has pricing, or retention and lifecycle rules.
- **5.5:** the states with their meaning, then the error rules.
- **5.6:** the actual Persian copy the customer will see, not a description of it.
- **Pricing:** formulas in bold on their own line. Prices and rates come from the price catalog, not the frontend; the frontend only shows the breakdown the backend returns.
- **Only what the user gave.** Do not add solutions, requirements or metrics of your own; phrase what the product manager said into the structure.
- **Do not pad.** A section with little to say gets one or two lines. Do not repeat content across sections; refer back by section number.

### 5. Check before delivering

Run through `checklist.md`. Fix anything that fails before you deliver.

### 6. Deliver

- Default output: a **Google Doc** in the user's Drive. Build the document as HTML (`dir="rtl"`, tables with `border="1"`), then create it with the Drive tool using `contentMimeType: text/html` so it converts to a Google Doc. Keep a local copy in the scratchpad.
- If the user asks for Markdown or a file, write a `.md` or `.html` file instead.
- Reply with the link and a few lines: what the document covers, what is still `[تکمیل شود]` or `[نیازمند تصمیم]`.

### 7. Revise from review comments

When the user says comments are in the document:

1. Read the document **with comments** (Drive `read_file_content` with `includeComments: true`). Note any text the user edited directly; keep those edits.
2. For each comment, reply in chat: agree or disagree, why, and which other sections it affects. Do not change the document yet.
3. After the user approves, apply the agreed changes together and bump the version in the overview table (`0.2.0`, `0.3.0`, ...).
4. The Drive tool cannot edit the text of an existing Google Doc. Either create a new Doc for the new version (say that the link changes and comments do not carry over), or edit the existing Doc through the browser for small changes. Ask the user which one when the changes are large.

## Files in this skill

- `template.md`: the document structure, with the exact Persian headings and table columns.
- `brief.md`: the short intake brief the user can fill in to start a PRD.
- `checklist.md`: the checks to run before delivering.

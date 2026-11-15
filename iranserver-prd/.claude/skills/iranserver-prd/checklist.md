# PRD checklist

Run before delivering. Fix every failure.

## Structure
- [ ] The sections, headings and table columns match `template.md` exactly, in the same order.
- [ ] No section, subsection or table column was added that is not in `template.md`.
- [ ] "(if relevant)" subsections are present only when the feature needs them.
- [ ] If the work has more than one phase, every subsection heading carries its phase (" — فاز N" or " — همه فازها") and section 5 has one subsection per phase.
- [ ] The overview table is present; unknown people are `[تکمیل شود]`, not guessed.
- [ ] The notice paragraph about comments is present word for word.

## Content
- [ ] Section 2.1 describes the current state as it really is (from what was read, or from the user).
- [ ] Every key result has a baseline or "فاقد خط مبنا", and a target.
- [ ] Section 5.1 has one "مرحله N" per step of the customer flow, in order.
- [ ] Every FR has a Must/Should/Could priority.
- [ ] Section 5.6 contains the actual Persian copy, not a description of it.
- [ ] Pricing formulas are in bold on their own line; prices come from the catalog, not the frontend.
- [ ] No competitor fact is invented; unverified cells are marked.
- [ ] Nothing in the document is the writer's own solution, feature, metric or recommendation; everything comes from the product manager or a cited source.
- [ ] Every technical solution is marked as a suggestion ("(پیشنهاد؛ تصمیم نهایی با تیم فنی)"), stays light, and every technical claim has a documentation link or is marked `[نیازمند تأیید تیم فنی]`.
- [ ] Example payloads, commands and names are labelled "فقط یک مثال برای درک موضوع".
- [ ] Every gap is marked in place with `[نیازمند تصمیم]` and listed in the reply to the user.
- [ ] Cross-references (for example "بخش 5.3") point to sections that exist.

## Language
- [ ] The document is Persian; English only for product names, technical terms the team uses in English, code, paths, IDs and Must/Should/Could.
- [ ] No content is repeated across sections.

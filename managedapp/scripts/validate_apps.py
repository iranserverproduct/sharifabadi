"""Check the documents under apps/ before a pull request is merged.

Rules:
- Each app folder has 01-market-validation-brief.md.
- 02 may exist only next to an Approved 01; 03 only next to Approved 01 and 02.
  An Approved 02 needs an Approved 01; an Approved 03 needs both.
- A document marked Approved has no Guidance blocks and no unfilled [placeholders].
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "apps"
DOCS = ["01-market-validation-brief.md", "02-devops-technical-spec.md", "03-landing-page-content-brief.md"]
STATUS = re.compile(r"^\|\s*Status\s*\|\s*([^|]+?)\s*\|", re.M)
# [text] that is not a Markdown link, a checkbox or an image.
PLACEHOLDER = re.compile(r"(?<![!\w])\[(?![ xX]\])[^\]\n]{1,80}\](?!\()")


def status(path):
    m = STATUS.search(path.read_text(encoding="utf-8"))
    return m.group(1).strip() if m else "Unknown"


def problems_in_approved(path):
    text = path.read_text(encoding="utf-8")
    found = []
    if "> **Guidance.**" in text:
        found.append("Guidance blocks remain")
    holes = PLACEHOLDER.findall(text)
    if holes:
        found.append("unfilled placeholders: " + ", ".join(sorted(set(holes))[:5]))
    return found


errors = []
apps = [p for p in sorted(ROOT.iterdir()) if p.is_dir()] if ROOT.exists() else []
for app in apps:
    present = {d: (app / d) for d in DOCS if (app / d).exists()}
    if DOCS[0] not in present:
        errors.append(f"{app.name}: missing {DOCS[0]}")
        continue
    st = {d: status(p) for d, p in present.items()}
    if DOCS[1] in present and st[DOCS[0]] != "Approved":
        errors.append(f"{app.name}: {DOCS[1]} exists but the market brief is not Approved (Gate A)")
    if DOCS[2] in present and not (st[DOCS[0]] == "Approved" and st.get(DOCS[1]) == "Approved"):
        errors.append(f"{app.name}: {DOCS[2]} exists but the brief and spec are not both Approved (Gate B)")
    for d, p in present.items():
        if st[d] == "Approved":
            errors += [f"{app.name}/{d}: {e}" for e in problems_in_approved(p)]
    print(f"{app.name}: " + ", ".join(f"{d[:2]}={st[d]}" for d in present))

if errors:
    print("\n".join(["", "Problems:"] + ["- " + e for e in errors]))
    sys.exit(1)
print("All app documents pass.")

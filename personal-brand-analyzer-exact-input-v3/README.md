# Personal Brand Analyzer v13 — Balanced LinkedIn Text

This version fixes the issue where adding the full LinkedIn About section can make the output poorer than using only name + LinkedIn + company + title.

## What changed

- Pasted LinkedIn text is now treated as:
  - identity anchor
  - factual grounding
  - language/positioning cue

- It is not treated as the whole report.
- The app should not simply summarize or paraphrase the About section.
- The report still searches and analyzes the broader public brand ecosystem.
- Long pasted text is capped more tightly so it does not dominate the prompt.
- The app extracts only the strongest signals from pasted text, then blends them with public ecosystem signals.
- SWOT, positioning, archetype, category opportunity, and recommendations should remain strategic and rich.

## Best input guidance

For common names:
- Name
- LinkedIn URL
- Company
- Title

For extra grounding:
- Paste only the most relevant LinkedIn headline/About excerpt, not the entire profile if it is very long.

Footer shows:
v13 balanced LinkedIn text

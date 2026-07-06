# Personal Brand Analyzer v11 — Same-Person Strategy Filter

This version focuses on matching the quality of a standard ChatGPT personal brand analysis while preventing unrelated same-name contamination.

## Fixes

1. Same-name people are excluded.
   - The LinkedIn URL and profile slug are the primary identity anchors.
   - Sources must connect to the submitted profile through anchors such as LinkedIn slug, company, title, location, pasted LinkedIn text, website, newsletter, podcast, book, company page, or social handle.
   - Sources about unrelated people with the same name are classified as EXCLUDE and should not appear in the report.

2. Output target is more strategic.
   - The app is prompted to match the level of a normal ChatGPT request:
     "run personal brand analysis on [name] [LinkedIn URL]. Run current status and SWOT analysis."
   - It should produce current positioning, brand themes, archetype, scorecard, SWOT, opportunities, threats, and strategic recommendation.

3. Confidence is separated from analysis quality.
   - Identity confidence: is this the right person?
   - Analysis confidence: how much same-person public ecosystem evidence supports the report?

4. Error handling is preserved.
   - Plain-text Vercel/OpenAI errors should show as readable messages instead of JSON parse crashes.

Footer shows:
v11 same-person strategy filter

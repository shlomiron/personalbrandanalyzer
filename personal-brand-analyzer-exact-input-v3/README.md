# Personal Brand Analyzer v12 — Strategic Inference, Fewer Caveats

This version fixes the issue where the app verifies the right person but fills many fields with:
"Not assessable due to limited public information."

## What changed

- Direct LinkedIn access limitations are treated as a caveat, not the whole report.
- If identity confidence is 75%+ and same-person public signals exist, the app must produce a substantive strategic analysis.
- The app can infer strategic themes from repeated same-person public signals.
- It still does not invent factual claims such as employers, awards, clients, credentials, or exact titles.
- Factual claims require evidence; strategic interpretation can use patterns.
- SWOT, brand archetype, category opportunity, positioning, and priority actions should now be richer and closer to a normal ChatGPT personal brand analysis.

## Preserved from v11

- Excludes unrelated same-name people.
- Uses LinkedIn URL and slug as primary identity anchors.
- Keeps company/title/location/pasted LinkedIn text fields.
- Keeps readable error handling.
- Blocks placeholders like XYZ Corporation and ABC Company.

Footer shows:
v12 strategic inference · fewer caveats

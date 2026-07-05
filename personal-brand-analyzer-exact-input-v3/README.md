# Personal Brand Analyzer v8 — Stronger Identity Matching

This version reduces wrong-person matches for common names.

## What changed

- Adds optional identity fields:
  - Current company
  - Current title
  - Location
  - Pasted LinkedIn headline/About/Experience
- Treats the LinkedIn URL as the primary identity anchor.
- Does not analyze another person with the same name unless public evidence connects that person to the URL/slug/company/title/location/pasted text.
- Common names require stronger matching.
- Bans placeholder outputs such as XYZ Corporation, ABC Company, Example Company, Acme, John Doe, and Jane Doe.
- If a fact is not verified, the app says: Evidence not found in public signals.
- Footer shows: v8 stronger identity matching · any profile.

## Deploy

Upload/commit these files to the connected GitHub repo, wait for Vercel to auto-deploy, then hard refresh.

Environment variable required:
OPENAI_API_KEY

Optional:
OPENAI_MODEL=gpt-4.1-mini

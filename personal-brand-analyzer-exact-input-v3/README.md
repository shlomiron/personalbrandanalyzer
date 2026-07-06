# Personal Brand Analyzer v9 — Strategic Public Ecosystem

This version fixes the overly cautious LinkedIn behavior.

## What changed

- The app does not stop or weaken the report just because the full LinkedIn profile is not directly readable.
- It treats the LinkedIn URL as the identity anchor, then analyzes the broader public brand ecosystem connected to that profile.
- It separates identity confidence from analysis confidence.
- It searches for public ecosystem signals such as websites, company bios, newsletters, podcasts, articles, speaking pages, university pages, founder pages, and social profiles.
- It keeps v8 identity fields: company, title, location, and pasted LinkedIn headline/About/Experience.
- It keeps anti-hallucination protection: no XYZ Corporation / ABC Company / Example Company placeholders.
- Unsupported facts show as: Evidence not found in public signals.
- Footer shows: v9 strategic public ecosystem · any profile.

## Deploy

Upload/commit these files to the connected GitHub repo, wait for Vercel to auto-deploy, then hard refresh.

Environment variable required:
OPENAI_API_KEY

Optional:
OPENAI_MODEL=gpt-4.1-mini

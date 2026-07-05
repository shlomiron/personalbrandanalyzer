# Personal Brand Analyzer v6 — Any Public Profile

This version removes visible sample-person placeholders and fixes the OpenAI web search + JSON mode error.

## Fixes

- No visible sample person's name in the full-name field.
- Full-name field placeholder is now: Enter full name.
- Browser autocomplete is turned off for the form.
- Backend no longer uses JSON mode.
- Backend still uses web search.
- Footer shows: v6 no JSON mode · any profile.
- App is intended for any public person/profile with a name and LinkedIn URL.

## Vercel

Keep the same project and same URL. Upload/commit these files to the connected GitHub repo, wait for Vercel to auto-deploy, then hard refresh.

Environment variable required:
OPENAI_API_KEY

Optional:
OPENAI_MODEL=gpt-4.1-mini

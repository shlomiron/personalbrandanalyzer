# Personal Brand Analyzer — Exact Input Vercel App

This version is designed to analyze the exact user-entered name and LinkedIn URL.

## What changed

- No hardcoded Shlomi Ron live report.
- The API prompt binds every report to the exact entered name and LinkedIn URL.
- Identity verification appears first with status and confidence.
- If the LinkedIn URL and public sources do not clearly match the name, the app must say so.
- The app displays limitations instead of claiming 100% certainty.
- Dashboard metrics, SWOT, gaps, actions, and report sections are generated dynamically.
- Uses the orange VSI logo.
- No headshot, avatar, generated face, or photo placeholder.

## Vercel setup

After deploying the ZIP, add this Environment Variable in Vercel:

Name:
OPENAI_API_KEY

Value:
your OpenAI API key beginning with sk-...

Optional:
OPENAI_MODEL=gpt-4.1-mini

Then redeploy.

## Important accuracy note

No automated public web analysis can be guaranteed 100% accurate because public pages can be incomplete, blocked, stale, or ambiguous. This app now enforces exact input matching and source-aware confidence scoring.

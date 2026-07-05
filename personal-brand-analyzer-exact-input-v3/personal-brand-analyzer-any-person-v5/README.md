# Personal Brand Analyzer — Exact Input Vercel App

This version is designed to analyze any person using the exact user-entered name and LinkedIn URL.

## What changed

- No hardcoded person or sample-profile live report.
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

No automated public web analysis can be guaranteed 100% accurate because public pages can be incomplete, blocked, stale, or ambiguous. This app now enforces exact input matching for any public profile and source-aware confidence scoring.


## v4 Fix

This version removes OpenAI JSON mode because web search cannot be used with JSON mode. It still asks the model to return JSON and includes safer JSON extraction in `api/analyze.js`.


## v5 Clarification

The app is not limited to Shlomi Ron. Users can enter any person's full name and LinkedIn profile URL. The visible placeholder was changed to a generic example to avoid confusion.

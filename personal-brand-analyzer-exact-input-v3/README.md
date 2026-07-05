# Personal Brand Analyzer v7 — Partial Verification Fix

This version fixes the issue where the app could stop with:
"Unable to verify the identity..."

## What changed

- LinkedIn being blocked or not indexed no longer causes a hard failure.
- If verification is weak, the app returns a cautious "Partially verified" or "Not verified" report.
- The analysis continues using available public signals.
- Unsupported claims are marked as "Evidence not found in public signals."
- Uses a safer two-step backend:
  1. Web research without JSON mode.
  2. JSON conversion without web search.
- Footer shows: v7 partial verification · any profile.

## Deploy

Upload/commit these files to the connected GitHub repo, wait for Vercel to auto-deploy, then hard refresh.

Environment variable required:
OPENAI_API_KEY

Optional:
OPENAI_MODEL=gpt-4.1-mini

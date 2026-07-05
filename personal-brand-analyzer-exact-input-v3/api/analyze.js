export const config = {
  maxDuration: 60
};

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isLikelyLinkedInProfile(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (host === "linkedin.com" || host.endsWith(".linkedin.com")) &&
      parsed.pathname.toLowerCase().startsWith("/in/");
  } catch {
    return false;
  }
}

function normalizeLinkedInUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

function extractJson(text) {
  if (!text || typeof text !== "string") return null;

  let cleaned = text.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {}
  }

  return null;
}

function buildPrompt({ name, linkedinUrl }) {
  return `
You are a personal brand strategist, reputation researcher, audience perception analyst, and visual brand audit designer.

Analyze ONLY the person represented by this exact user input:
Name: ${name}
LinkedIn URL: ${linkedinUrl}

Critical rules:
- This app is for any public person/profile. Do not use any sample profile.
- Do not reuse prior results.
- Do not assume any identity that is not supported by the exact entered name and LinkedIn URL.
- First verify whether the entered name and LinkedIn URL appear to refer to the same person.
- If the LinkedIn page is not publicly readable, use the LinkedIn URL as the identity anchor and cross-reference public websites, bios, company pages, newsletters, podcasts, speaking pages, social profiles, and search results that clearly connect to the same person.
- If identity confidence is weak, say so clearly and lower the confidence score.
- If evidence is missing, write "Evidence not found in public signals."
- Do not fabricate roles, clients, testimonials, credentials, case studies, awards, or sources.
- Do not include or require a headshot, generated face, avatar, or photo placeholder.

Return ONLY one valid JSON object. Do not wrap it in markdown. Do not include prose before or after the JSON.

Required JSON schema:
{
  "input": {
    "name": "exact entered name",
    "linkedinUrl": "exact entered LinkedIn URL"
  },
  "identityVerification": {
    "status": "Verified | Partially verified | Not verified",
    "confidence": 0,
    "summary": "short explanation",
    "limitations": ["short limitation"],
    "sourceNotes": ["source note with URL or domain when available"]
  },
  "summary": {
    "currentPersonalBrand": "one sentence",
    "currentForm": "one sentence",
    "currentFunction": "one sentence",
    "idealForm": "one sentence",
    "idealFunction": "one sentence"
  },
  "metrics": [
    {"label":"Positioning Clarity","score":0,"interpretation":"short"},
    {"label":"Visual Consistency","score":0,"interpretation":"short"},
    {"label":"Proof Strength","score":0,"interpretation":"short"},
    {"label":"Differentiation","score":0,"interpretation":"short"},
    {"label":"Form–Function Alignment","score":0,"interpretation":"short"}
  ],
  "firstImpressionAudit": {
    "whatTheyDo":"short",
    "whoTheyServe":"short",
    "valueProvided":"short",
    "whatStandsOut":"short",
    "currentForm":"short",
    "currentFunction":"short",
    "formSupportsFunction":"short"
  },
  "brandAttributes": [
    {"attribute":"short","evidence":"specific public signal or limitation","signalType":"Form | Function | Both","strength":"Strong | Moderate | Weak","perception":"short"}
  ],
  "functionAnalysis": {
    "apparentSpecialty":"short",
    "associatedSkills":["short"],
    "expectedServicesOutcomes":["short"],
    "clarityAssessment":"short",
    "professionalRole":"short",
    "doesPerceivedMatchDesired":"short",
    "whatTheyDo":"short",
    "whoFor":"short",
    "problemSolved":"short",
    "outcomeCreated":"short",
    "whyChooseThem":"short"
  },
  "formAnalysis": {
    "currentVisualIdentity":"short",
    "aestheticTags":["short"],
    "consistency":"short",
    "matchToFunction":"short",
    "trustEffect":"short",
    "strengthen":["short"],
    "simplify":["short"],
    "remove":["short"],
    "repeat":["short"]
  },
  "positioningConsistency": {
    "category":"short",
    "niche":"short",
    "differentiation":"short",
    "positioningClarity":"short",
    "cohesionAcrossChannels":"short",
    "formConsistency":"short",
    "functionConsistency":"short",
    "formFunctionAlignment":"short"
  },
  "reputationGapTable": [
    {"idealPerception":"short","currentPerception":"short","gap":"short","recommendedAction":"short"}
  ],
  "audiencePerspective": [
    {"audience":"Potential client","thinksTheyDo":"short","specialty":"short","visualImpression":"short","trustsFor":"short","confusion":"short","remembers":"short"},
    {"audience":"Potential employer or partner","thinksTheyDo":"short","specialty":"short","visualImpression":"short","trustsFor":"short","confusion":"short","remembers":"short"},
    {"audience":"Industry peer","thinksTheyDo":"short","specialty":"short","visualImpression":"short","trustsFor":"short","confusion":"short","remembers":"short"},
    {"audience":"Journalist","thinksTheyDo":"short","specialty":"short","visualImpression":"short","trustsFor":"short","confusion":"short","remembers":"short"},
    {"audience":"First-time visitor","thinksTheyDo":"short","specialty":"short","visualImpression":"short","trustsFor":"short","confusion":"short","remembers":"short"}
  ],
  "swot": {
    "strengths":["short"],
    "weaknesses":["short"],
    "opportunities":["short"],
    "threats":["short"]
  },
  "keyGaps": [
    {"label":"short","score":0,"severity":"High | Medium | Low"}
  ],
  "priorityActions": [
    {"action":"short","supportingPhrase":"short"}
  ],
  "sources": [
    {"title":"source title or domain","url":"https://...","supports":"what it supports"}
  ]
}

Data rules:
- Scores must be numbers from 0 to 10.
- identityVerification.confidence must be a number from 0 to 100.
- Keep all fields concise and evidence-sensitive.
- Include sources that support the identity and major claims.
`.trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const name = cleanString(req.body?.name);
  const rawLinkedInUrl = cleanString(req.body?.linkedinUrl);
  const linkedinUrl = normalizeLinkedInUrl(rawLinkedInUrl);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Please enter a full name." });
  }

  if (!rawLinkedInUrl || !isLikelyLinkedInProfile(rawLinkedInUrl)) {
    return res.status(400).json({ error: "Please enter a valid LinkedIn profile URL, like https://www.linkedin.com/in/username/" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY in Vercel Environment Variables." });
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: buildPrompt({ name, linkedinUrl }),
        tools: [{ type: "web_search" }],
        temperature: 0.2
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed.",
        details: data?.error || data
      });
    }

    const outputText =
      data.output_text ||
      data.output?.flatMap(item => item.content || [])
        ?.map(content => content.text || "")
        ?.join("") ||
      "";

    if (!outputText) {
      return res.status(502).json({ error: "No analysis text returned. Please try again." });
    }

    const report = extractJson(outputText);

    if (!report) {
      return res.status(502).json({
        error: "The analysis did not return valid JSON. Please try again.",
        raw: outputText.slice(0, 1500)
      });
    }

    report.input = { name, linkedinUrl };

    return res.status(200).json({ report });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Unexpected server error."
    });
  }
}

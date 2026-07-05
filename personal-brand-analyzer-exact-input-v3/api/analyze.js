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

function extractOutputText(data) {
  return (
    data.output_text ||
    data.output?.flatMap(item => item.content || [])
      ?.map(content => content.text || "")
      ?.join("") ||
    ""
  );
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

async function openaiResponses({ apiKey, body }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "OpenAI request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.error || data;
    throw error;
  }

  return data;
}

function getLinkedInSlug(linkedinUrl) {
  try {
    const parsed = new URL(linkedinUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[1] || "";
  } catch {
    return "";
  }
}

function buildResearchPrompt({ name, linkedinUrl }) {
  const slug = getLinkedInSlug(linkedinUrl);

  return `
You are a careful public-signal reputation researcher.

Research the public online signals for this user-submitted profile:
Name entered by user: ${name}
LinkedIn URL entered by user: ${linkedinUrl}
LinkedIn profile slug: ${slug}

Important behavior:
- LinkedIn profiles are often blocked, partially visible, or not indexed. Do NOT treat lack of LinkedIn page access as a complete failure.
- Try to verify whether the entered name and LinkedIn URL likely refer to the same person using whatever public snippets, search results, the LinkedIn slug, public bios, websites, company pages, podcasts, articles, newsletters, speaker pages, and social profiles are available.
- If exact verification is weak, mark identity as "Partially verified" or "Not verified", explain the limitation, but still continue the brand analysis from available public signals.
- If no matching public sources are found, create a limited report that says "Evidence not found in public signals" for unsupported claims.
- Do not say "Unable to verify identity" as the only result unless the LinkedIn URL is invalid or clearly belongs to a different person.
- Do not fabricate roles, clients, testimonials, awards, case studies, or sources.
- Do not include or require a headshot, generated face, avatar, or photo placeholder.
- This app works for any public person/profile. Never use sample data or prior profile data.

Search strategy:
- Search the exact name in quotes.
- Search the exact name plus LinkedIn slug.
- Search the exact name plus likely company/title if found.
- Search the LinkedIn slug alone if it resembles a name or handle.
- Look for source overlap: same name, same company, same bio, same website, same social handle, same content topics.

Return concise research notes in plain English with:
1. Identity verification status and confidence.
2. Whether LinkedIn was directly readable or only indirectly inferred.
3. Public sources found with URLs/domains.
4. Current form signals: visual style, profile image style if visible, website/social aesthetics, colors, tone, imagery.
5. Current function signals: specialty, role, audience, services, content topics, proof.
6. Evidence strength and limitations.
7. Likely audience perception.
8. SWOT notes.
9. Recommended metrics and scores.
`.trim();
}

function buildJsonPrompt({ name, linkedinUrl, researchNotes }) {
  return `
Convert the research notes below into ONE valid JSON object that follows the exact schema.
Do not include markdown. Do not include prose outside JSON.

Use only the evidence in the research notes.
If evidence is weak or missing, keep the analysis useful but honest.
If identity verification is weak, do NOT make confident claims. Use "Partially verified" or "Not verified", lower confidence, and explain the limitation.
Do not output a hard failure message unless the LinkedIn URL is invalid or clearly mismatched.
If public evidence is limited, still return all schema fields with "Evidence not found in public signals" where appropriate.

Exact input:
Name: ${name}
LinkedIn URL: ${linkedinUrl}

Research notes:
${researchNotes}

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

Requirements:
- Scores must be numbers from 0 to 10.
- identityVerification.confidence must be a number from 0 to 100.
- Keep fields concise.
- JSON must be parseable by JSON.parse().
- Use double quotes on all keys and strings.
- No trailing commas.
`.trim();
}

function fallbackReport({ name, linkedinUrl, researchNotes }) {
  return {
    input: { name, linkedinUrl },
    identityVerification: {
      status: "Partially verified",
      confidence: 35,
      summary: "Public-source verification was limited, but the app generated a cautious partial report from available signals.",
      limitations: [
        "LinkedIn may not be publicly readable or indexed.",
        "Public sources may be limited, stale, or ambiguous.",
        researchNotes.slice(0, 800)
      ],
      sourceNotes: []
    },
    summary: {
      currentPersonalBrand: "Not enough public evidence was found to summarize confidently.",
      currentForm: "Evidence not found in public signals.",
      currentFunction: "Evidence not found in public signals.",
      idealForm: "Use a clearer, more consistent visual system across public profiles.",
      idealFunction: "Make the #1 specialty explicit in the headline, bio, and public proof."
    },
    metrics: [
      { label: "Positioning Clarity", score: 3, interpretation: "Limited public evidence" },
      { label: "Visual Consistency", score: 3, interpretation: "Limited public evidence" },
      { label: "Proof Strength", score: 2, interpretation: "Proof not easily found" },
      { label: "Differentiation", score: 3, interpretation: "Public differentiation unclear" },
      { label: "Form–Function Alignment", score: 3, interpretation: "Not enough evidence" }
    ],
    firstImpressionAudit: {
      whatTheyDo: "Evidence not found in public signals.",
      whoTheyServe: "Evidence not found in public signals.",
      valueProvided: "Evidence not found in public signals.",
      whatStandsOut: "Evidence not found in public signals.",
      currentForm: "Evidence not found in public signals.",
      currentFunction: "Evidence not found in public signals.",
      formSupportsFunction: "Not enough public evidence to assess."
    },
    brandAttributes: [
      {
        attribute: "Low public discoverability",
        evidence: "The app could not find enough matching public signals for the entered name and LinkedIn URL.",
        signalType: "Both",
        strength: "Weak",
        perception: "A stranger may struggle to understand or verify the person’s brand quickly."
      }
    ],
    functionAnalysis: {
      apparentSpecialty: "Evidence not found in public signals.",
      associatedSkills: ["Evidence not found in public signals."],
      expectedServicesOutcomes: ["Evidence not found in public signals."],
      clarityAssessment: "Public specialty is not clear from available evidence.",
      professionalRole: "Evidence not found in public signals.",
      doesPerceivedMatchDesired: "Cannot assess from available evidence.",
      whatTheyDo: "Evidence not found in public signals.",
      whoFor: "Evidence not found in public signals.",
      problemSolved: "Evidence not found in public signals.",
      outcomeCreated: "Evidence not found in public signals.",
      whyChooseThem: "Evidence not found in public signals."
    },
    formAnalysis: {
      currentVisualIdentity: "Evidence not found in public signals.",
      aestheticTags: ["unclear"],
      consistency: "Cannot assess from available evidence.",
      matchToFunction: "Cannot assess from available evidence.",
      trustEffect: "Low discoverability can reduce first-impression trust.",
      strengthen: ["Make public profile signals easier to verify."],
      simplify: ["Use one clear headline and one primary category."],
      remove: ["Remove ambiguity across profiles."],
      repeat: ["Repeat the same name, title, and specialty across channels."]
    },
    positioningConsistency: {
      category: "Evidence not found in public signals.",
      niche: "Evidence not found in public signals.",
      differentiation: "Evidence not found in public signals.",
      positioningClarity: "Low from available evidence.",
      cohesionAcrossChannels: "Cannot assess.",
      formConsistency: "Cannot assess.",
      functionConsistency: "Cannot assess.",
      formFunctionAlignment: "Cannot assess."
    },
    reputationGapTable: [
      {
        idealPerception: "Clearly verifiable expert",
        currentPerception: "Hard to verify from public sources",
        gap: "Low public discoverability",
        recommendedAction: "Add consistent public bio, headline, website/social links, and proof points."
      }
    ],
    audiencePerspective: [
      {
        audience: "Potential client",
        thinksTheyDo: "Unclear from available public signals.",
        specialty: "Unclear",
        visualImpression: "Not enough evidence",
        trustsFor: "Not enough evidence",
        confusion: "Hard to verify identity and specialty.",
        remembers: "Low discoverability"
      }
    ],
    swot: {
      strengths: ["Input provides a name and LinkedIn URL"],
      weaknesses: ["Limited public evidence found"],
      opportunities: ["Improve public discoverability", "Unify profile signals"],
      threats: ["Strangers may not quickly verify credibility"]
    },
    keyGaps: [
      { label: "Public discoverability", score: 8, severity: "High" },
      { label: "Identity verification", score: 7, severity: "High" },
      { label: "Proof visibility", score: 7, severity: "High" }
    ],
    priorityActions: [
      { action: "Make profile easier to verify", supportingPhrase: "Consistent links" },
      { action: "Clarify primary specialty", supportingPhrase: "One headline" },
      { action: "Add public proof", supportingPhrase: "Visible sources" }
    ],
    sources: []
  };
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
    // Step 1: web research, no JSON mode.
    const researchData = await openaiResponses({
      apiKey: process.env.OPENAI_API_KEY,
      body: {
        model,
        input: buildResearchPrompt({ name, linkedinUrl }),
        tools: [{ type: "web_search" }],
        temperature: 0.2
      }
    });

    const researchNotes = extractOutputText(researchData);

    if (!researchNotes) {
      return res.status(502).json({ error: "No research notes returned. Please try again." });
    }

    // Step 2: convert research to JSON, no web_search.
    // JSON mode is allowed here because this call does not use web search.
    const jsonData = await openaiResponses({
      apiKey: process.env.OPENAI_API_KEY,
      body: {
        model,
        input: buildJsonPrompt({ name, linkedinUrl, researchNotes }),
        text: { format: { type: "json_object" } },
        temperature: 0.1
      }
    });

    const outputText = extractOutputText(jsonData);
    let report = extractJson(outputText);

    if (!report) {
      report = fallbackReport({ name, linkedinUrl, researchNotes });
    }

    report.input = { name, linkedinUrl };

    return res.status(200).json({ report });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error?.message || "Unexpected server error.",
      details: error?.details
    });
  }
}

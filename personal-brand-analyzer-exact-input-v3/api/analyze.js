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

function compactLinkedInText(text) {
  return cleanString(text).slice(0, 7000);
}

function buildResearchPrompt({ name, linkedinUrl, company, title, location, linkedinText }) {
  const slug = getLinkedInSlug(linkedinUrl);
  const profileText = compactLinkedInText(linkedinText);

  return `
You are a senior personal brand strategist and careful public-signal reputation researcher.

Goal:
Create a useful, strategic personal brand analysis like a strong ChatGPT session would produce, while avoiding wrong-person analysis and unsupported factual claims.

Profile submitted by user:
Name: ${name}
LinkedIn URL: ${linkedinUrl}
LinkedIn profile slug: ${slug}
Optional current company: ${company || "not provided"}
Optional current title: ${title || "not provided"}
Optional location: ${location || "not provided"}
Optional pasted LinkedIn headline/About/Experience:
${profileText || "not provided"}

Important context:
- You may not be able to directly read the full LinkedIn profile. LinkedIn often blocks or limits public access.
- Do NOT stop or weaken the whole report just because LinkedIn is not directly readable.
- Use the LinkedIn URL and slug as the identity anchor, then analyze the broader public brand ecosystem connected to the same person.
- Separate identity confidence from analysis confidence:
  - Identity confidence: how sure we are this is the right person.
  - Analysis confidence: how much public ecosystem evidence supports the brand analysis.
- Do not cap identity confidence at 60% merely because LinkedIn is not directly readable.
- If the user provides LinkedIn URL + company + title + location, and public search finds no contradiction, identity should usually be "Partially verified" at 70-85% even if LinkedIn itself is not fully readable.
- If public ecosystem signals also connect the same name to the same company/title/location or distinctive profile slug, identity should usually be "Verified" at 85-95%.
- Only keep identity confidence near 60% when SAME_PERSON evidence is thin, ambiguous, or there are multiple plausible people with no clear differentiator after applying the exclusion rules.
- If public evidence conflicts with the user-provided company/title/location, lower confidence and explain the conflict.
- The report should be strategic and insight-rich when multiple public signals are consistent, even if full LinkedIn access is limited.

Identity matching rules:
- The LinkedIn URL and profile slug are the primary identity anchors.
- Do not use sources about another person who only shares the same name.
- Before using any source, classify it as SAME_PERSON, POSSIBLE_MATCH, or EXCLUDE.
- SAME_PERSON requires at least two matching anchors, such as:
  1. exact LinkedIn URL or profile slug
  2. same company
  3. same title or role category
  4. same location
  5. same personal/company website connected to the profile
  6. same newsletter/podcast/book/social handle
  7. distinctive phrase also found in user-provided LinkedIn text
- POSSIBLE_MATCH may be used only for cautious high-level themes, not factual claims.
- EXCLUDE all sources about people with the same name but different company, industry, location, title, or profile slug.
- If same-name people appear in search results, mention that unrelated same-name results were excluded.
- Never cite or base analysis on unrelated same-name sources.
- If a source cannot be connected to the submitted LinkedIn URL, slug, company, title, location, or pasted LinkedIn text, exclude it.
- For common names, require at least one strong anchor besides the name.
- If exact LinkedIn access is limited but the broader ecosystem consistently matches the URL/slug/company/title/location, proceed with a strategic report.
- If public ecosystem evidence is strong, do not let lack of direct LinkedIn access flatten the analysis.

Research strategy:
1. Search the exact LinkedIn URL and profile slug.
2. Search exact name in quotes.
3. Search name + profile slug.
4. Search name + company/title/location if provided.
5. Search distinctive phrases from pasted LinkedIn text if provided.
6. Search for connected public ecosystem signals:
   - personal website
   - company bio
   - founder page
   - newsletter
   - articles
   - podcast
   - speaking page
   - university/teaching bio
   - book/author page
   - startup profile
   - YouTube/interviews
   - conference pages
   - social profiles
7. Look for repeated themes across sources.

Strategic output target:
- Match the quality of a standard ChatGPT strategy response to: "run personal brand analysis on [name] [LinkedIn URL]. Run current status and SWOT analysis."
- The output should include executive-level synthesis, current positioning, brand themes, archetype, scorecard-style metrics, SWOT, threats/opportunities, and strategic recommendation.
- Prioritize insight density over defensive disclaimers.
- Keep confidence notes, but do not let them dominate the report.
- Use the broader public ecosystem only when sources pass the SAME_PERSON filter.

Analysis style:
- Produce strategy-level insights, not just verification notes.
- Identify current positioning, audience perception, strengths, weaknesses, opportunities, threats, and category ownership potential.
- Infer strategic implications from repeated public signals, but clearly distinguish inference from verified fact.
- If public signals consistently show a theme, you may describe it as a brand theme.
- Do not invent exact employers, roles, awards, clients, or credentials.
- Never use placeholders such as XYZ Corporation, ABC Company, Example Company, Acme, John Doe, or Jane Doe.
- No headshot, fake photo, avatar, or visual-generation requirement.

Return concise research notes in plain English with:
1. Identity verification status, confidence, and why.
2. Analysis confidence and why.
3. Whether LinkedIn was directly readable or only inferred from public/search signals.
4. Public sources found with URLs/domains.
5. Which details are user-provided vs independently visible.
6. Current brand positioning themes.
7. Current form signals: visual style, website/social aesthetics, tone, imagery.
8. Current function signals: specialty, role, audience, services, content topics, proof.
9. Brand archetype or narrative pattern if supported.
10. Audience perception.
11. SWOT notes.
12. Category ownership opportunities.
13. Recommended scores.
`.trim();
}

function buildJsonPrompt({ name, linkedinUrl, company, title, location, linkedinText, researchNotes }) {
  return `
Convert the research notes below into ONE valid JSON object that follows the exact schema.
Do not include markdown. Do not include prose outside JSON.

Use only the evidence in the research notes and the exact user input.
This is a Personal Brand Analyzer, not only an identity checker. If LinkedIn cannot be fully accessed, still produce a strategic brand analysis using the broader public ecosystem connected to the profile. Separate identity limitations from brand strategy. If public signals are consistent, make the report insight-rich while keeping factual claims honest.
If identity verification is weak, use "Partially verified" or "Not verified", lower confidence, and explain the limitation.
Do not cap identity confidence at 60% solely because LinkedIn is not fully readable. If the LinkedIn URL, name, company, title, and location are provided and there is no conflicting evidence, use a higher partial verification confidence, typically 70-85%. If public ecosystem sources connect those same identifiers, use Verified at 85-95%.
Do not output a hard failure message unless the LinkedIn URL is invalid or clearly mismatched.
If public evidence is limited, still return all schema fields with "Evidence not found in public signals" where appropriate.

Same-person source rules:
- Do not include sources or facts about unrelated people with the same name.
- A source is usable only if it connects to the submitted LinkedIn URL, profile slug, company, title, location, pasted LinkedIn text, personal website, company page, newsletter, podcast, book, or other matching identity anchor.
- If the research notes mention unrelated same-name profiles, exclude them from sources and facts.
- In identityVerification.limitations, briefly say "Unrelated same-name results were excluded" when applicable.
- Do not use POSSIBLE_MATCH sources for specific factual claims such as employer, title, degree, clients, awards, or location.

Output quality target:
- Produce a strategic analysis on the level of a standard ChatGPT personal brand/SWOT answer.
- Include clear current positioning, brand themes, strategic interpretation, SWOT, opportunities, threats, category ownership, and practical recommendation.
- Keep confidence labels, but do not make the report feel like a failed verification tool when SAME_PERSON signals are adequate.

Hard anti-hallucination rules:
- Do not invent company, role, title, client, award, publication, testimonial, or location.
- Never use placeholders such as XYZ Corporation, ABC Company, Example Company, Acme, John Doe, Jane Doe, or "Senior Digital Marketing Manager at XYZ Corporation."
- If a fact comes only from pasted LinkedIn text, say "User-provided LinkedIn text says..." rather than treating it as independently verified.
- If multiple people match and identifiers are insufficient, state that clearly.
- Identity confidence should reflect all user-provided identity anchors and public corroboration, not only direct LinkedIn access.

Exact user input:
Name: ${name}
LinkedIn URL: ${linkedinUrl}
Current company: ${company || "not provided"}
Current title: ${title || "not provided"}
Location: ${location || "not provided"}
Pasted LinkedIn text provided: ${compactLinkedInText(linkedinText) ? "yes" : "no"}

Research notes:
${researchNotes}

Required JSON schema:
{
  "input": {
    "name": "exact entered name",
    "linkedinUrl": "exact entered LinkedIn URL",
    "company": "exact entered company or empty string",
    "title": "exact entered title or empty string",
    "location": "exact entered location or empty string",
    "hasPastedLinkedInText": false
  },
  "identityVerification": {
    "status": "Verified | Partially verified | Not verified",
    "confidence": 0,
    "summary": "short explanation",
    "limitations": ["short limitation"],
    "sourceNotes": ["source note with URL/domain or user-provided LinkedIn text note"]
  },
  "samePersonFilter": {
    "usedAnchors": ["LinkedIn slug, company, title, location, pasted LinkedIn text, website, or other anchors used"],
    "excludedSameNameResults": ["brief description of unrelated same-name results excluded, or empty array"],
    "sourceRule": "Only sources connected to the submitted profile anchors were used."
  },
  "analysisConfidence": {
    "level": "Strong | Moderate | Limited",
    "summary": "short explanation of how much public ecosystem evidence supports the brand analysis",
    "basis": ["public ecosystem signal or user-provided signal"]
  },
  "summary": {
    "currentPersonalBrand": "strategic one sentence",
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
    {"attribute":"short","evidence":"specific public signal, user-provided signal, or limitation","signalType":"Form | Function | Both","strength":"Strong | Moderate | Weak","perception":"short"}
  ],
  "brandArchetype": {
    "primary":"short or Evidence not found in public signals.",
    "secondary":"short or Evidence not found in public signals.",
    "rationale":"short"
  },
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
  "categoryOpportunity": {
    "currentPerception":"short",
    "strongerPerception":"short",
    "ownableCategory":"short",
    "positioningLine":"short"
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


function normalizeIdentityConfidence(report, { company, title, location, linkedinText }) {
  if (!report || !report.identityVerification) return report;

  const hasAnchors = !!(company && title && location);
  const hasPastedLinkedIn = !!compactLinkedInText(linkedinText);
  const summary = JSON.stringify(report.identityVerification).toLowerCase();
  const hasConflict = /(conflict|mismatch|different person|does not match|contradict)/i.test(summary);
  const multipleAmbiguous = /(multiple|ambiguous|unclear|no clear differentiator)/i.test(summary);
  const current = Number(report.identityVerification.confidence || 0);

  if (!hasConflict) {
    if (hasPastedLinkedIn && current < 85) {
      report.identityVerification.confidence = 85;
      if (report.identityVerification.status !== "Verified") report.identityVerification.status = "Partially verified";
      report.identityVerification.summary = `${report.identityVerification.summary} User-provided LinkedIn text adds a strong identity anchor, although it is not independently verified.`;
    } else if (hasAnchors && current < 75 && !multipleAmbiguous) {
      report.identityVerification.confidence = 75;
      if (report.identityVerification.status === "Not verified") report.identityVerification.status = "Partially verified";
      report.identityVerification.summary = `${report.identityVerification.summary} The provided company, title, and location add identity anchors, with no conflicting evidence detected.`;
    }
  }

  return report;
}

function replacePlaceholders(value) {
  if (typeof value === "string") {
    const banned = /(XYZ Corporation|ABC Company|Example Company|Acme|John Doe|Jane Doe|Senior Digital Marketing Manager at XYZ Corporation)/gi;
    return value.replace(banned, "Evidence not found in public signals");
  }
  if (Array.isArray(value)) return value.map(replacePlaceholders);
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = replacePlaceholders(value[key]);
  }
  return value;
}


function sanitizeSources(report) {
  if (!report || !Array.isArray(report.sources)) return report;
  const bad = /(unrelated|different person|same name|not the same|excluded|mismatch)/i;
  report.sources = report.sources.filter(src => {
    const text = `${src.title || ""} ${src.url || ""} ${src.supports || ""}`;
    return !bad.test(text);
  });
  return report;
}

function fallbackReport({ name, linkedinUrl, company, title, location, linkedinText, researchNotes }) {
  return {
    input: { name, linkedinUrl, company, title, location, hasPastedLinkedInText: !!compactLinkedInText(linkedinText) },
    identityVerification: {
      status: "Partially verified",
      confidence: 35,
      summary: "Public-source verification was limited, so the app generated a cautious partial report from available signals and user-provided identifiers.",
      limitations: [
        "LinkedIn may not be publicly readable or indexed.",
        "For common names, company, title, location, and pasted LinkedIn text improve matching.",
        researchNotes.slice(0, 800)
      ],
      sourceNotes: []
    },
    samePersonFilter: {
      usedAnchors: ["User-provided name", "LinkedIn URL", company || "Company not provided", title || "Title not provided", location || "Location not provided"].filter(Boolean),
      excludedSameNameResults: [],
      sourceRule: "Only sources connected to the submitted profile anchors should be used."
    },
    analysisConfidence: {
      level: "Limited",
      summary: "Analysis confidence is limited because matching public ecosystem signals were sparse or the structured conversion failed.",
      basis: [researchNotes.slice(0, 700)]
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
        attribute: "Identity evidence limited",
        evidence: "The app could not find enough matching public signals for the entered identifiers.",
        signalType: "Both",
        strength: "Weak",
        perception: "A stranger may struggle to verify this profile quickly."
      }
    ],
    brandArchetype: {
      primary: "Evidence not found in public signals.",
      secondary: "Evidence not found in public signals.",
      rationale: "Not enough reliable public evidence."
    },
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
      repeat: ["Repeat the same name, title, company, and specialty across channels."]
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
    categoryOpportunity: {
      currentPerception: "Evidence not found in public signals.",
      strongerPerception: "Evidence not found in public signals.",
      ownableCategory: "Evidence not found in public signals.",
      positioningLine: "Evidence not found in public signals."
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
      strengths: ["User provided identity anchors"],
      weaknesses: ["Limited public evidence found"],
      opportunities: ["Improve public discoverability", "Unify profile signals"],
      threats: ["Wrong-person confusion for common names"]
    },
    keyGaps: [
      { label: "Identity verification", score: 8, severity: "High" },
      { label: "Public discoverability", score: 8, severity: "High" },
      { label: "Proof visibility", score: 7, severity: "High" }
    ],
    priorityActions: [
      { action: "Add stronger identity anchors", supportingPhrase: "Company/title/location" },
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
  const company = cleanString(req.body?.company);
  const title = cleanString(req.body?.title);
  const location = cleanString(req.body?.location);
  const linkedinText = compactLinkedInText(req.body?.linkedinText);

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
    const researchData = await openaiResponses({
      apiKey: process.env.OPENAI_API_KEY,
      body: {
        model,
        input: buildResearchPrompt({ name, linkedinUrl, company, title, location, linkedinText }),
        tools: [{ type: "web_search" }],
        temperature: 0.25
      }
    });

    const researchNotes = extractOutputText(researchData);

    if (!researchNotes) {
      return res.status(502).json({ error: "No research notes returned. Please try again." });
    }

    const jsonData = await openaiResponses({
      apiKey: process.env.OPENAI_API_KEY,
      body: {
        model,
        input: buildJsonPrompt({ name, linkedinUrl, company, title, location, linkedinText, researchNotes }),
        text: { format: { type: "json_object" } },
        temperature: 0.1
      }
    });

    const outputText = extractOutputText(jsonData);
    let report = extractJson(outputText);

    if (!report) {
      report = fallbackReport({ name, linkedinUrl, company, title, location, linkedinText, researchNotes });
    }

    report = replacePlaceholders(report);
    report = sanitizeSources(report);
    report = normalizeIdentityConfidence(report, { company, title, location, linkedinText });
    report.input = { name, linkedinUrl, company, title, location, hasPastedLinkedInText: !!linkedinText };

    if (!report.samePersonFilter) {
      report.samePersonFilter = {
        usedAnchors: ["LinkedIn URL", company, title, location].filter(Boolean),
        excludedSameNameResults: [],
        sourceRule: "Only sources connected to the submitted profile anchors were used."
      };
    }

    if (!report.analysisConfidence) {
      report.analysisConfidence = {
        level: report.identityVerification?.status === "Verified" ? "Moderate" : "Limited",
        summary: "Analysis confidence was estimated from available public ecosystem signals.",
        basis: report.identityVerification?.sourceNotes || []
      };
    }

    return res.status(200).json({ report });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error?.message || "Unexpected server error.",
      details: error?.details || null,
      hint: "If the hosting layer returned plain text, the frontend will now show the readable message instead of a JSON parsing crash."
    });
  }
}

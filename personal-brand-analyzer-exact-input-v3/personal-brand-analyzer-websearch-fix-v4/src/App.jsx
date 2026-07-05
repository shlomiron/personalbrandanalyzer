import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import logo from "./assets/vsi-orange-logo.jpg";
import "./styles.css";

const DEFAULT_REPORT = {
  input: { name: "Example Profile", linkedinUrl: "https://www.linkedin.com/in/example/" },
  identityVerification: {
    status: "Preview only",
    confidence: 0,
    summary: "Live reports are generated from the exact name and LinkedIn URL entered in the form.",
    limitations: ["Preview data only. Deploy with OPENAI_API_KEY to generate live analysis."],
    sourceNotes: []
  },
  summary: {
    currentPersonalBrand: "A public-facing personal brand report will appear here after analysis.",
    currentForm: "Form will be inferred from public visual and aesthetic signals.",
    currentFunction: "Function will be inferred from public professional signals.",
    idealForm: "The app will recommend a stronger visual direction.",
    idealFunction: "The app will recommend a sharper #1 specialty."
  },
  metrics: [
    { label: "Positioning Clarity", score: 0, interpretation: "Generated live" },
    { label: "Visual Consistency", score: 0, interpretation: "Generated live" },
    { label: "Proof Strength", score: 0, interpretation: "Generated live" },
    { label: "Differentiation", score: 0, interpretation: "Generated live" },
    { label: "Form–Function Alignment", score: 0, interpretation: "Generated live" }
  ],
  keyGaps: [
    { label: "Generated from exact input", score: 0, severity: "Live" }
  ],
  swot: {
    strengths: ["Generated live"],
    weaknesses: ["Generated live"],
    opportunities: ["Generated live"],
    threats: ["Generated live"]
  },
  priorityActions: [
    { action: "Run analysis", supportingPhrase: "Exact input" }
  ],
  firstImpressionAudit: {},
  brandAttributes: [],
  functionAnalysis: {},
  formAnalysis: {},
  positioningConsistency: {},
  reputationGapTable: [],
  audiencePerspective: [],
  sources: []
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeText(value, fallback = "Not enough public evidence found.") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function scoreWidth(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "0%";
  return `${Math.max(0, Math.min(10, n)) * 10}%`;
}

function Section({ title, children, accent = "" }) {
  return (
    <section className={`section ${accent}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function MetricCard({ metric }) {
  return (
    <div className="metric-card">
      <div className="metric-score">{Number(metric.score || 0).toFixed(1)}<span>/10</span></div>
      <div className="metric-label">{metric.label}</div>
      <div className="metric-line"><i style={{ width: scoreWidth(metric.score) }} /></div>
      <p>{metric.interpretation}</p>
    </div>
  );
}

function Dashboard({ report }) {
  const metrics = safeArray(report.metrics);
  const gaps = safeArray(report.keyGaps);
  const swot = report.swot || {};
  const actions = safeArray(report.priorityActions);

  return (
    <section className="dashboard">
      <div className="dashboard-head">
        <div>
          <h2>Executive Dashboard</h2>
          <p>Exact-input perception, quantitative metrics, SWOT, and priority actions</p>
        </div>
        <div className="dashboard-icon">📊</div>
      </div>

      <div className="metric-grid">
        {metrics.slice(0, 5).map((m, i) => <MetricCard key={i} metric={m} />)}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h3>Current Brand Snapshot</h3>
          <div className="signal"><b>Form</b><span>{safeText(report.summary?.currentForm)}</span></div>
          <div className="signal"><b>Function</b><span>{safeText(report.summary?.currentFunction)}</span></div>
          <div className="signal"><b>Memory</b><span>{safeText(report.summary?.currentPersonalBrand)}</span></div>
        </div>

        <div className="panel accent">
          <h3>Key Gaps</h3>
          {gaps.slice(0, 4).map((g, i) => (
            <div className="gap-row" key={i}>
              <b>{i + 1}</b>
              <span>{g.label}</span>
              <i className="mini"><i style={{ width: scoreWidth(g.score) }} /></i>
              <em>{g.score}/10</em>
              <strong>{g.severity}</strong>
            </div>
          ))}
          <div className="flow">
            <span>Current<br />{safeText(report.summary?.currentFunction, "Current perception")}</span>
            <b>→</b>
            <span>Ideal<br />{safeText(report.summary?.idealFunction, "Ideal position")}</span>
          </div>
        </div>

        <div className="panel teal">
          <h3>Ideal Brand Position</h3>
          <div className="signal"><b>Ideal Form</b><span>{safeText(report.summary?.idealForm)}</span></div>
          <div className="signal"><b>Ideal Function</b><span>{safeText(report.summary?.idealFunction)}</span></div>
          <div className="signal"><b>Role</b><span>{safeText(report.functionAnalysis?.professionalRole)}</span></div>
        </div>
      </div>

      <div className="dash-grid lower">
        <div className="panel">
          <h3>Audience Perception</h3>
          <div className="aud-grid">
            {safeArray(report.audiencePerspective).slice(0, 4).map((a, i) => (
              <div key={i}>
                <b>{a.audience}</b>
                <span>{safeText(a.remembers, "Generated live")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>SWOT</h3>
          <div className="swot-grid">
            <div className="s"><b>Strengths</b>{safeArray(swot.strengths).slice(0, 3).map((x, i) => <span key={i}>{x}</span>)}</div>
            <div className="w"><b>Weaknesses</b>{safeArray(swot.weaknesses).slice(0, 3).map((x, i) => <span key={i}>{x}</span>)}</div>
            <div className="o"><b>Opportunities</b>{safeArray(swot.opportunities).slice(0, 3).map((x, i) => <span key={i}>{x}</span>)}</div>
            <div className="t"><b>Threats</b>{safeArray(swot.threats).slice(0, 3).map((x, i) => <span key={i}>{x}</span>)}</div>
          </div>
        </div>

        <div className="panel">
          <h3>3 Priority Actions</h3>
          <div className="actions">
            {actions.slice(0, 3).map((a, i) => (
              <div key={i}><b>{i + 1}</b><span>{a.action} — {a.supportingPhrase}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Report({ report }) {
  const iv = report.identityVerification || {};
  return (
    <div className="report">
      <div className="identity-card">
        <div>
          <h2>Personal Brand Analyzer: {report.input?.name}</h2>
          <p><b>LinkedIn analyzed:</b> <a href={report.input?.linkedinUrl} target="_blank" rel="noreferrer">{report.input?.linkedinUrl}</a></p>
        </div>
        <div className="confidence">
          <span>{iv.status || "Unknown"}</span>
          <strong>{iv.confidence ?? 0}%</strong>
          <small>identity confidence</small>
        </div>
      </div>

      <p className="identity-summary">{safeText(iv.summary)}</p>
      {safeArray(iv.limitations).length > 0 && (
        <div className="limitations">
          <b>Limitations</b>
          {safeArray(iv.limitations).map((l, i) => <span key={i}>• {l}</span>)}
        </div>
      )}

      <Dashboard report={report} />

      <Section title="1. First Impression Audit">
        <div className="two-col">
          {Object.entries(report.firstImpressionAudit || {}).map(([key, value]) => (
            <div key={key}><b>{key}</b><p>{safeText(value)}</p></div>
          ))}
        </div>
      </Section>

      <Section title="2. Current Brand Attributes">
        <div className="table">
          {safeArray(report.brandAttributes).map((a, i) => (
            <div className="row" key={i}>
              <b>{a.attribute}</b>
              <span>{a.signalType} / {a.strength}</span>
              <p>{a.evidence}</p>
              <em>{a.perception}</em>
            </div>
          ))}
        </div>
      </Section>

      <Section title="3. Function Analysis">
        <div className="two-col">
          {Object.entries(report.functionAnalysis || {}).map(([key, value]) => (
            <div key={key}><b>{key}</b><p>{Array.isArray(value) ? value.join(", ") : safeText(value)}</p></div>
          ))}
        </div>
      </Section>

      <Section title="4. Form Analysis">
        <div className="two-col">
          {Object.entries(report.formAnalysis || {}).map(([key, value]) => (
            <div key={key}><b>{key}</b><p>{Array.isArray(value) ? value.join(", ") : safeText(value)}</p></div>
          ))}
        </div>
      </Section>

      <Section title="5. Positioning + Consistency">
        <div className="two-col">
          {Object.entries(report.positioningConsistency || {}).map(([key, value]) => (
            <div key={key}><b>{key}</b><p>{safeText(value)}</p></div>
          ))}
        </div>
      </Section>

      <Section title="6. Reputation Gap Table">
        <div className="gap-table">
          {safeArray(report.reputationGapTable).map((g, i) => (
            <div key={i}>
              <b>Ideal</b><p>{g.idealPerception}</p>
              <b>Current</b><p>{g.currentPerception}</p>
              <b>Gap</b><p>{g.gap}</p>
              <b>Action</b><p>{g.recommendedAction}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="7. Audience Perspective">
        <div className="audience-list">
          {safeArray(report.audiencePerspective).map((a, i) => (
            <article key={i}>
              <h3>{a.audience}</h3>
              <p><b>They think:</b> {a.thinksTheyDo}</p>
              <p><b>Specialty:</b> {a.specialty}</p>
              <p><b>Visual impression:</b> {a.visualImpression}</p>
              <p><b>Trust:</b> {a.trustsFor}</p>
              <p><b>Confusion:</b> {a.confusion}</p>
              <p><b>Memory:</b> {a.remembers}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="8. Brand Statements + Actions">
        <p><b>Current personal brand:</b> {report.summary?.currentPersonalBrand}</p>
        <p><b>Current form:</b> {report.summary?.currentForm}</p>
        <p><b>Current function:</b> {report.summary?.currentFunction}</p>
        <p><b>Ideal form:</b> {report.summary?.idealForm}</p>
        <p><b>Ideal function:</b> {report.summary?.idealFunction}</p>
      </Section>

      <Section title="Sources">
        {safeArray(report.sources).length ? (
          <ul className="sources">
            {safeArray(report.sources).map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a> — {s.supports}</li>)}
          </ul>
        ) : (
          <p>No public sources returned. Run again or verify the LinkedIn URL.</p>
        )}
      </Section>
    </div>
  );
}

function App() {
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [report, setReport] = useState(DEFAULT_REPORT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 1 && linkedinUrl.includes("linkedin.com/in/"), [name, linkedinUrl]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, linkedinUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setReport(data.report);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <div className="brand">
            <img src={logo} alt="Visual Storytelling Institute logo" className="logo" />
            <div>
              <div className="brand-name">Personal Brand Analyzer</div>
              <div className="brand-kicker">Powered by Visual Storytelling Institute</div>
            </div>
          </div>
          <div className="eyebrow">✦ Form + Function Brand Intelligence</div>
          <h1>See how your online personal brand is currently perceived.</h1>
          <p className="sub">Enter a name and LinkedIn URL. The app analyzes the exact input, verifies identity against public signals, and displays results inside the page.</p>
          <div className="trust">
            <span>🔎 Exact input binding</span>
            <span>📊 Dynamic scores</span>
            <span>🧭 SWOT dashboard</span>
            <span>🎯 Source-aware limitations</span>
          </div>
        </div>

        <form className="card form" onSubmit={handleSubmit}>
          <h2>Analyze a profile</h2>
          <label>
            <span>Full name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Example: Shlomi Ron" />
          </label>
          <label>
            <span>LinkedIn URL</span>
            <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/username/" />
          </label>
          <button disabled={!canSubmit || loading}>{loading ? "Analyzing public signals..." : "Analyze My Brand →"}</button>
          <p className="hint">This app does not publish report pages. Results appear in this browser session only unless the user copies or screenshots them.</p>
          {error && <div className="error">{error}</div>}
        </form>
      </section>

      <section id="results">
        <Report report={report} />
      </section>

      <footer>
        <div><b>Powered by Visual Storytelling Institute</b><a href="https://www.visualstorytell.com" target="_blank" rel="noreferrer">visualstorytell.com</a></div>
        <div><span>For more, subscribe to the Visual Storytelling Newsletter:</span><a href="https://newsletter.visualstorytell.com" target="_blank" rel="noreferrer">newsletter.visualstorytell.com</a></div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

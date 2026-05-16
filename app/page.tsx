"use client";
import { useState } from "react";
import { CheckCircle, Code2, Brain, Layers, GitBranch, Star, Users, Zap, ArrowRight, Play, Lock, ChevronDown, ChevronUp } from "lucide-react";

// ── Curriculum ────────────────────────────────────────────────────────────────
const MODULES = [
  {
    week: "Week 1–2",
    title: "RAG Foundations",
    tag: "RAG",
    color: "#6366f1",
    icon: "🔍",
    lessons: [
      "Vector databases: Pinecone, Chroma, pgvector",
      "Chunking strategies that actually work",
      "Embedding models compared (OpenAI, Cohere, local)",
      "Build: Document Q&A system from scratch",
      "Advanced: Hybrid search + reranking",
    ],
    project: "Build a RAG pipeline over your own documents with source citations",
  },
  {
    week: "Week 3–4",
    title: "MCP Servers",
    tag: "MCP",
    color: "#8b5cf6",
    icon: "🔌",
    lessons: [
      "Model Context Protocol — architecture deep dive",
      "Build your first MCP server in Python/TypeScript",
      "Expose tools, resources, prompts via MCP",
      "Connect Claude Desktop to custom MCP server",
      "Deploy MCP server to production",
    ],
    project: "Ship an MCP server that gives Claude access to your own data",
  },
  {
    week: "Week 5–6",
    title: "LangGraph Workflows",
    tag: "LangGraph",
    color: "#06b6d4",
    icon: "🕸️",
    lessons: [
      "State machines vs chains — when to use which",
      "Building cyclic graphs with conditional edges",
      "Human-in-the-loop patterns",
      "Parallel execution and fan-out/fan-in",
      "Persistence and checkpointing",
    ],
    project: "Build a multi-step research agent with approval gates",
  },
  {
    week: "Week 7–8",
    title: "Production AI Agents",
    tag: "Agents",
    color: "#22c55e",
    icon: "🤖",
    lessons: [
      "ReAct, Plan-and-Execute, and Reflection patterns",
      "Tool calling: design, reliability, error handling",
      "Multi-agent orchestration with LangGraph",
      "Observability: tracing with LangSmith / AgentTrace",
      "Cost control, rate limits, graceful degradation",
    ],
    project: "Ship a production-ready AI agent with monitoring and cost controls",
  },
];

const TRACKS = [
  { id: "rag", label: "RAG", icon: "🔍", color: "#6366f1" },
  { id: "mcp", label: "MCP", icon: "🔌", color: "#8b5cf6" },
  { id: "langgraph", label: "LangGraph", icon: "🕸️", color: "#06b6d4" },
  { id: "agents", label: "Agents", icon: "🤖", color: "#22c55e" },
];

const TESTIMONIALS = [
  { name: "Arjun P.", role: "Senior ML Engineer @ Stripe", text: "Went from 'I've heard of RAG' to shipping a production RAG pipeline in 2 weeks. The project-based approach is the only way to actually learn this stuff.", stars: 5, avatar: "AP", tag: "RAG graduate" },
  { name: "Sarah K.", role: "Full-stack dev → AI Engineer", text: "LangGraph clicked after the 3rd lesson. The human-in-the-loop project is exactly what my company needed. Got a raise after showing this.", stars: 5, avatar: "SK", tag: "LangGraph graduate" },
  { name: "Raj M.", role: "Founding Engineer @ AI startup", text: "Built our entire agent infrastructure using the patterns from Week 7-8. The observability section alone saved us $2k/month in API costs.", stars: 5, avatar: "RM", tag: "Agents graduate" },
];

const PLANS = [
  {
    name: "Monthly",
    price: "$97",
    period: "/month",
    desc: "Full access, cancel anytime",
    features: ["All 8 weeks of content", "4 real project builds", "Code review via Loom", "Private Discord community", "Certificate of completion"],
    cta: "Start learning →",
    highlight: false,
  },
  {
    name: "Lifetime",
    price: "$297",
    period: "one-time",
    desc: "Pay once, own forever",
    features: ["Everything in Monthly", "All future curriculum updates", "Priority code review (24hr)", "1-on-1 kickoff call (30 min)", "LinkedIn endorsement", "Job referral network"],
    cta: "Get lifetime access →",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Team (5 seats)",
    price: "$397",
    period: "/month",
    desc: "Upskill your whole team",
    features: ["5 member seats", "Team progress dashboard", "Monthly group Q&A call", "Custom Slack channel", "Invoice & bulk billing", "Priority support"],
    cta: "Contact for teams →",
    highlight: false,
  },
];

const FAQS = [
  { q: "Do I need prior AI/ML experience?", a: "Comfortable with Python and basic API calls is enough. You don't need ML theory — we focus on engineering patterns, not math." },
  { q: "How much time per week?", a: "4-6 hours/week. Each module has ~3 hours of content + a project that takes 2-3 hours. Lifetime members can go at any pace." },
  { q: "What stack does this use?", a: "Python (primary) + TypeScript where relevant. LangChain/LangGraph, Claude/OpenAI APIs, various vector DBs. All code is in GitHub." },
  { q: "Is there live instruction?", a: "Content is async (video + code). Team plan includes monthly live Q&A. Lifetime includes a 1-on-1 kickoff call." },
  { q: "What's the refund policy?", a: "Full refund within 14 days, no questions asked. We're confident you'll get value — if not, we pay back immediately." },
  { q: "Will this stay updated?", a: "Yes — RAG/MCP/LangGraph move fast. Lifetime members get all updates free. Monthly members get updates while subscribed." },
];

// ── Components ────────────────────────────────────────────────────────────────
function TagBadge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ background: `${color}18`, color, border: `1px solid ${color}33`, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 10px", letterSpacing: "0.04em" }}>
      {text}
    </span>
  );
}

function ModuleCard({ m, open, onToggle }: { m: typeof MODULES[0]; open: boolean; onToggle: () => void }) {
  return (
    <div className="card" style={{ marginBottom: 12, cursor: "pointer" }} onClick={onToggle}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px" }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{m.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(165,180,252,0.55)", fontSize: 11, fontWeight: 600 }}>{m.week}</span>
            <TagBadge text={m.tag} color={m.color} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#f0f4ff", fontFamily: "var(--font-display)" }}>{m.title}</div>
        </div>
        <span style={{ color: "rgba(165,180,252,0.4)", flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(99,102,241,0.1)" }}>
          <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {m.lessons.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <CheckCircle size={14} style={{ color: m.color, flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "rgba(165,180,252,0.75)", fontSize: 13 }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ background: `${m.color}10`, border: `1px solid ${m.color}25`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🛠️</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: m.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Project</div>
              <div style={{ fontSize: 13, color: "rgba(240,244,255,0.8)" }}>{m.project}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#04070f" }}>

      {/* ── Nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(4,7,15,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.1)", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Code2 size={18} style={{ color: "#6366f1" }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: "#f0f4ff", letterSpacing: "-0.02em", fontFamily: "var(--font-display)" }}>
            AI<span style={{ color: "#6366f1" }}>Coach</span>Lab
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {["Curriculum", "Pricing", "FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13, color: "rgba(165,180,252,0.6)", textDecoration: "none", padding: "4px 8px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0f4ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(165,180,252,0.6)")}>
              {l}
            </a>
          ))}
          <a href="#pricing" style={{ background: "#6366f1", color: "#fff", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Join now
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 20px 60px", textAlign: "center" }}>
        {/* Glow */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none", top: 56 }} />

        <div className="fade-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 99, padding: "4px 14px", fontSize: 11, color: "#22c55e", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            500+ developers enrolled · new cohort open
          </div>

          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "#f0f4ff", letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px", fontFamily: "var(--font-display)" }}>
            Learn RAG, MCP, LangGraph<br />
            &amp; AI Agents by{" "}
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              building real projects
            </span>
          </h1>

          <p style={{ color: "rgba(165,180,252,0.75)", fontSize: 18, lineHeight: 1.65, maxWidth: 580, margin: "0 auto 32px" }}>
            Stop watching theory videos. Build production-grade AI systems week by week with expert code review. Go from curious to shipping in 8 weeks.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            <a href="#pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#6366f1", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }} className="glow">
              Start learning — $97/mo <ArrowRight size={16} />
            </a>
            <a href="#curriculum" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#f0f4ff", border: "1px solid rgba(99,102,241,0.3)", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
              <Play size={15} /> See curriculum
            </a>
          </div>

          {/* Trust */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
            {[
              { icon: <Star size={14} />, text: "4.9/5 from 200+ reviews" },
              { icon: <Users size={14} />, text: "500+ developers trained" },
              { icon: <Zap size={14} />, text: "14-day money-back guarantee" },
              { icon: <Code2 size={14} />, text: "Real projects, real code" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(165,180,252,0.55)", fontSize: 13 }}>
                <span style={{ color: "#6366f1" }}>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tracks ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {TRACKS.map(t => (
            <div key={t.id} className="card" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: t.color, fontFamily: "var(--font-display)", marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: "rgba(165,180,252,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t.id === "rag" ? "2 weeks · 1 project" : t.id === "mcp" ? "2 weeks · 1 project" : t.id === "langgraph" ? "2 weeks · 1 project" : "2 weeks · 1 project"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you build ── */}
      <section style={{ background: "rgba(10,15,30,0.5)", borderTop: "1px solid rgba(99,102,241,0.1)", borderBottom: "1px solid rgba(99,102,241,0.1)", padding: "48px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em", marginBottom: 8, fontFamily: "var(--font-display)" }}>
            What you&apos;ll ship
          </h2>
          <p style={{ color: "rgba(165,180,252,0.6)", fontSize: 15, marginBottom: 36 }}>4 production-ready projects you can put in your portfolio</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            {[
              { emoji: "📄", title: "Document Q&A RAG", desc: "Multi-source RAG with hybrid search, reranking and cited answers", tag: "RAG", color: "#6366f1" },
              { emoji: "🔌", title: "Custom MCP Server", desc: "Production MCP server exposing your data to Claude Desktop", tag: "MCP", color: "#8b5cf6" },
              { emoji: "🕵️", title: "Research Agent", desc: "LangGraph multi-step agent with human approval gates", tag: "LangGraph", color: "#06b6d4" },
              { emoji: "🏭", title: "Production Agent System", desc: "Full agent with tracing, cost controls and graceful fallbacks", tag: "Agents", color: "#22c55e" },
            ].map(p => (
              <div key={p.title} className="card" style={{ padding: "20px", textAlign: "left" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{p.emoji}</div>
                <TagBadge text={p.tag} color={p.color} />
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f4ff", margin: "10px 0 6px", fontFamily: "var(--font-display)" }}>{p.title}</div>
                <div style={{ color: "rgba(165,180,252,0.6)", fontSize: 12, lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section id="curriculum" style={{ maxWidth: 720, margin: "0 auto", padding: "64px 20px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em", marginBottom: 8, fontFamily: "var(--font-display)" }}>8-week curriculum</h2>
        <p style={{ color: "rgba(165,180,252,0.6)", fontSize: 15, marginBottom: 32 }}>Click any module to see what&apos;s inside</p>
        {MODULES.map((m, i) => (
          <ModuleCard key={i} m={m} open={openModule === i} onToggle={() => setOpenModule(openModule === i ? null : i)} />
        ))}
        <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <Lock size={16} style={{ color: "rgba(165,180,252,0.4)", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f4ff" }}>Bonus: AI System Design Patterns</div>
            <div style={{ fontSize: 12, color: "rgba(165,180,252,0.45)" }}>For Lifetime members — production architecture patterns from real AI startups</div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: "rgba(10,15,30,0.5)", borderTop: "1px solid rgba(99,102,241,0.1)", padding: "64px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em", marginBottom: 32, textAlign: "center", fontFamily: "var(--font-display)" }}>
            What graduates say
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <TagBadge text={t.tag} color="#6366f1" />
                <p style={{ color: "rgba(240,244,255,0.8)", fontSize: 14, lineHeight: 1.6, margin: "12px 0 16px" }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#f0f4ff" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(165,180,252,0.45)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ maxWidth: 960, margin: "0 auto", padding: "64px 20px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em", marginBottom: 8, textAlign: "center", fontFamily: "var(--font-display)" }}>Simple pricing</h2>
        <p style={{ color: "rgba(165,180,252,0.6)", fontSize: 15, marginBottom: 40, textAlign: "center" }}>14-day money-back guarantee. No risk.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? "rgba(99,102,241,0.08)" : "rgba(10,15,30,0.8)",
              border: `1px solid ${plan.highlight ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.14)"}`,
              borderRadius: 20,
              padding: "28px 24px",
              position: "relative",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#6366f1", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f0f4ff", marginBottom: 4, fontFamily: "var(--font-display)" }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? "#818cf8" : "#f0f4ff", fontFamily: "var(--font-display)" }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: "rgba(165,180,252,0.5)" }}>{plan.period}</span>
              </div>
              <div style={{ color: "rgba(165,180,252,0.5)", fontSize: 12, marginBottom: 20 }}>{plan.desc}</div>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                  <CheckCircle size={14} style={{ color: "#6366f1", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: "rgba(240,244,255,0.75)", fontSize: 13 }}>{f}</span>
                </div>
              ))}
              <a href={plan.name === "Team (5 seats)" ? "mailto:hello@aicoachlab.dev" : "#join"}
                style={{ display: "block", textAlign: "center", marginTop: 20, background: plan.highlight ? "#6366f1" : "transparent", color: plan.highlight ? "#fff" : "#818cf8", border: plan.highlight ? "none" : "1px solid rgba(99,102,241,0.4)", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: plan.highlight ? "0 4px 20px rgba(99,102,241,0.35)" : "none" }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 64px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em", marginBottom: 28, fontFamily: "var(--font-display)" }}>FAQ</h2>
        {FAQS.map((f, i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.1)", marginBottom: 0 }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "transparent", border: "none", color: "#f0f4ff", fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left", gap: 16 }}>
              <span>{f.q}</span>
              <span style={{ color: "rgba(165,180,252,0.4)", flexShrink: 0 }}>
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
            {openFaq === i && (
              <div style={{ paddingBottom: 16, color: "rgba(165,180,252,0.7)", fontSize: 14, lineHeight: 1.7 }}>{f.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* ── Email CTA ── */}
      <section id="join" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.06))", borderTop: "1px solid rgba(99,102,241,0.2)", padding: "64px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <Layers size={32} style={{ color: "#6366f1", marginBottom: 16 }} />
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#f0f4ff", letterSpacing: "-0.03em", marginBottom: 10, fontFamily: "var(--font-display)" }}>
            Start building this week
          </h2>
          <p style={{ color: "rgba(165,180,252,0.65)", fontSize: 15, marginBottom: 28 }}>
            Join 500+ developers learning RAG, MCP, LangGraph &amp; AI Agents — by building, not watching.
          </p>
          {joined ? (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "16px", color: "#22c55e", fontWeight: 600 }}>
              ✓ You&apos;re on the list! Check your inbox for next steps.
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email) setJoined(true); }} style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={{ flex: 1, background: "rgba(4,7,15,0.8)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "12px 14px", color: "#f0f4ff", fontSize: 14, outline: "none" }} />
              <button type="submit" style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Get access →
              </button>
            </form>
          )}
          <p style={{ color: "rgba(165,180,252,0.3)", fontSize: 12, marginTop: 12 }}>14-day money-back guarantee · No spam · Unsubscribe anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(99,102,241,0.1)", padding: "24px 20px", background: "rgba(10,15,30,0.5)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Code2 size={15} style={{ color: "#6366f1" }} />
            <span style={{ fontWeight: 700, color: "#f0f4ff", fontFamily: "var(--font-display)" }}>AICoachLab</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} style={{ color: "rgba(165,180,252,0.35)", textDecoration: "none", fontSize: 12 }}>{l}</a>
            ))}
          </div>
          <span style={{ color: "rgba(100,116,139,0.5)", fontSize: 12 }}>&copy; 2026 AICoachLab</span>
        </div>
      </footer>
    </div>
  );
}

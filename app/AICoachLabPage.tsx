"use client";
// Compact landing — max 3 desktop viewport scrolls
// bg-[#080810], accent indigo/violet #6366f1 → #7c3aed
// Sections: Navbar | Hero (split ~70vh) | Role tabs | 3-col features | 2-card pricing | Footer

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ArrowRight, Send, X, Bot, CheckCircle, Zap, Mic, MicOff } from "lucide-react";

const ACCENT = "#6366f1";
const ACCENT2 = "#7c3aed";
const BG = "#080810";
const ease: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease },
});

// ── Role tabs ───────────────────────────────────────────────────────────────
const ROLES = [
  {
    label: "Software Engineer",
    emoji: "{ }",
    color: "#6366f1",
    questions: [
      "Reverse a linked list in O(n) time without extra space.",
      "Design a rate limiter for a distributed API gateway.",
      "Explain the difference between process and thread with real examples.",
    ],
  },
  {
    label: "Product Manager",
    emoji: "◈",
    color: "#f59e0b",
    questions: [
      "How would you prioritise features with conflicting stakeholder needs?",
      "Design a metrics framework for a newly launched mobile app.",
      "Walk me through how you'd handle a P0 bug the night before a launch.",
    ],
  },
  {
    label: "System Design",
    emoji: "⬡",
    color: "#10b981",
    questions: [
      "Design a URL shortener that handles 10B requests per day.",
      "How would you architect a real-time collaborative document editor?",
      "Design the notification system for a social platform at Twitter scale.",
    ],
  },
  {
    label: "Behavioural",
    emoji: "◎",
    color: "#ec4899",
    questions: [
      "Tell me about a time you disagreed with your manager. What happened?",
      "Describe a project where you had to influence without authority.",
      "Give an example of a high-pressure deadline you delivered under.",
    ],
  },
  {
    label: "Data Science",
    emoji: "∿",
    color: "#38bdf8",
    questions: [
      "How would you detect and handle outliers in a production ML pipeline?",
      "Explain bias-variance tradeoff with a practical example.",
      "Design an A/B test for a new recommendation algorithm.",
    ],
  },
] as const;

// ── 3-col features ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "⚡",
    title: "Real-time Feedback",
    desc: "AI scores your answer on clarity, structure and depth within seconds.",
  },
  {
    icon: "🎤",
    title: "Speech Analysis",
    desc: "Practice out loud. Detect filler words, pacing and confidence signals.",
  },
  {
    icon: "⭐",
    title: "STAR Tracking",
    desc: "Automatic STAR framework detection. Know if your answer is structured.",
  },
];

// ── Pricing ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    note: "3 sessions / day",
    features: ["All role tracks", "AI scoring", "Written feedback", "Practice questions"],
    highlight: false,
    cta: "Start free interview",
    href: "/interview",
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    note: "Unlimited sessions",
    features: ["Everything in Free", "Speech analysis", "STAR tracking", "Export reports"],
    highlight: true,
    cta: "Get Pro",
    href: "/api/checkout",
  },
];

// ── Interview chat mockup ───────────────────────────────────────────────────
function ChatMockup({ role }: { role: typeof ROLES[number] }) {
  return (
    <motion.div
      key={role.label}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      style={{
        background: "rgba(8,8,16,0.92)",
        border: `1px solid rgba(99,102,241,0.18)`,
        borderRadius: 20,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 48px rgba(99,102,241,0.08), 0 20px 60px rgba(0,0,0,0.5)",
        width: "100%",
        maxWidth: 380,
      }}
    >
      {/* header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center" }}>
          <BrainCircuit size={14} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#f0f4ff", margin: 0 }}>Interview Coach</p>
          <p style={{ fontSize: 10, color: "rgba(167,139,250,0.5)", margin: 0 }}>{role.label} · Practice mode</p>
        </div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b98180" }} />
      </div>

      {/* messages */}
      <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* AI question */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `rgba(99,102,241,0.15)`, border: "1px solid rgba(99,102,241,0.25)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <BrainCircuit size={11} color={ACCENT} />
          </div>
          <div style={{ padding: "9px 12px", borderRadius: "12px 12px 12px 4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#e2e8f0", lineHeight: 1.55, maxWidth: 280 }}>
            {role.questions[0]}
          </div>
        </div>

        {/* user typing */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ padding: "9px 12px", borderRadius: "12px 12px 4px 12px", background: `rgba(99,102,241,0.15)`, border: `1px solid rgba(99,102,241,0.25)`, fontSize: 12, color: "#e2e8f0", lineHeight: 1.55, maxWidth: 240 }}>
            I&apos;d use three pointers...
            <span style={{ display: "inline-block", width: 2, height: 12, background: ACCENT, marginLeft: 3, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />
          </div>
        </div>

        {/* AI feedback badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          <span style={{ color: "#10b981", fontWeight: 700 }}>+12pts</span> Strong use of STAR structure. Add complexity analysis.
        </div>
      </div>

      {/* input row */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(99,102,241,0.1)", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.12)", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Answer in text or voice...
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center" }}>
          <Send size={13} color="#fff" />
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </motion.div>
  );
}

// ── Chatbot ─────────────────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; text: string };
const SYSTEM_PROMPT = "You are an interview coach for AICoachLab. Help users prepare for tech interviews with concise, actionable advice.";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I&apos;m your interview coach. Ask me anything about preparing for your next tech interview." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, systemPrompt: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.message || "Sorry, try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Connection error." }]);
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    if (!hasVoice) setHasVoice(true);
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SpeechRec();
    rec.lang = "en-US"; rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => send(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec; rec.start(); setListening(true);
  }, [listening, hasVoice, send]);

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, width: 50, height: 50, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: `0 4px 24px rgba(99,102,241,0.45)` }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={20} color="#fff" /></motion.span>
            : <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Bot size={20} color="#fff" /></motion.span>}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease }}
            style={{ position: "fixed", bottom: 82, right: 24, zIndex: 200, width: 320, maxHeight: 480, display: "flex", flexDirection: "column", borderRadius: 16, background: "rgba(8,8,16,0.96)", border: "1px solid rgba(99,102,241,0.22)", backdropFilter: "blur(20px)", overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }}
          >
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center" }}><BrainCircuit size={14} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#f0f4ff", margin: 0 }}>Interview Coach</p>
                <p style={{ fontSize: 10, color: "rgba(167,139,250,0.5)", margin: 0 }}>Ask about any role</p>
              </div>
              <button onClick={toggleVoice} style={{ background: listening ? "rgba(99,102,241,0.15)" : "transparent", border: `1px solid ${listening ? ACCENT : "rgba(99,102,241,0.2)"}`, borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                {listening ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}><Mic size={12} color="#a78bfa" /></motion.span> : <MicOff size={12} color="rgba(167,139,250,0.5)" />}
                <span style={{ fontSize: 10, color: listening ? "#a78bfa" : "rgba(167,139,250,0.4)" }}>{listening ? "Listening" : "Voice"}</span>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.role === "user" ? `rgba(99,102,241,0.18)` : "rgba(255,255,255,0.04)", border: m.role === "user" ? `1px solid rgba(99,102,241,0.28)` : "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "#e2e8f0", lineHeight: 1.5 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: "12px 12px 12px 4px", alignSelf: "flex-start" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                      style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(99,102,241,0.1)", display: "flex", gap: 6 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about interview prep…"
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: 8, padding: "7px 10px", color: "#f0f4ff", fontSize: 12, outline: "none" }} />
              <motion.button onClick={() => send(input)} whileTap={{ scale: 0.9 }} disabled={!input.trim() || loading}
                style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : "rgba(99,102,241,0.08)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "grid", placeItems: "center" }}>
                <Send size={13} color={input.trim() ? "#fff" : "rgba(99,102,241,0.3)"} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AICoachLabPage({ showPricing = true }: { showPricing?: boolean }) {
  const [activeRole, setActiveRole] = useState(0);

  const role = ROLES[activeRole];

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#f0f4ff", overflowX: "hidden" }}>
      <style>{`
        html, body { overflow-x: hidden; max-width: 100vw; }
        .acl-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .acl-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .acl-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .acl-nav-links { display: flex; gap: 6px; align-items: center; }
        .acl-cta-note { font-size: 12px; color: rgba(180,190,220,0.3); }
        .acl-mockup-col { display: flex; justify-content: center; }
        @media (max-width: 768px) {
          .acl-hero-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .acl-feature-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .acl-pricing-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .acl-mockup-col { display: none !important; }
          .acl-cta-note { display: none !important; }
        }
        @media (max-width: 640px) {
          .acl-role-strip { overflow-x: auto; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
          .acl-role-strip::-webkit-scrollbar { display: none; }
          .acl-nav-links a { display: none; }
          .acl-feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ambient glows */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "-8%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "rgba(8,8,16,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center" }}>
            <BrainCircuit size={13} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.3px" }}>AI<span style={{ color: "#a78bfa" }}>Coach</span>Lab</span>
        </div>
        <div className="acl-nav-links">
          {[["Interview", "/interview"], ["Tracks", "/tracks"], ["Learn", "/learn"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, color: "rgba(180,190,220,0.55)", textDecoration: "none", padding: "6px 10px", borderRadius: 7 }}>{label}</a>
          ))}
          <motion.a href="/interview" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ marginLeft: 4, padding: "7px 16px", borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Start free →
          </motion.a>
        </div>
      </nav>

      {/* ── SECTION 1: HERO ────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "clamp(64px,10vw,80px) clamp(16px,4vw,32px) 36px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box", width: "100%" }}>
        <div className="acl-hero-grid">

          {/* Left */}
          <motion.div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* eyebrow */}
            <motion.div {...fadeUp(0)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)", fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <Zap size={10} style={{ color: "#f97316" }} /> AI-powered mock interviews
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1 {...fadeUp(0.08)} style={{ fontSize: "clamp(2.1rem, 4.5vw, 3.4rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", margin: 0 }}>
              Ace your next{" "}
              <span style={{ background: `linear-gradient(135deg,${ACCENT} 0%,#a78bfa 50%,#f97316 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 32px rgba(99,102,241,0.4))" }}>
                interview.
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.14)} style={{ fontSize: "clamp(13px,2vw,16px)", color: "rgba(180,190,220,0.5)", lineHeight: 1.65, margin: 0, maxWidth: 420 }}>
              AI-powered mock interviews with real-time coaching. Practice every role, every day. Free to start.
            </motion.p>

            {/* role pills */}
            <motion.div {...fadeUp(0.18)} className="acl-role-strip" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ROLES.map((r, i) => (
                <button key={r.label} onClick={() => setActiveRole(i)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px",
                    borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${i === activeRole ? r.color : "rgba(99,102,241,0.18)"}`,
                    background: i === activeRole ? `${r.color}16` : "transparent",
                    color: i === activeRole ? r.color : "rgba(180,190,220,0.4)",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                  }}>
                  <span style={{ fontSize: 11 }}>{r.emoji}</span> {r.label}
                </button>
              ))}
            </motion.div>

            {/* active role preview */}
            <AnimatePresence mode="wait">
              <motion.div key={activeRole}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25, ease }}
                style={{ padding: "12px 14px", borderRadius: 10, background: `${role.color}0d`, border: `1px solid ${role.color}28` }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: role.color, margin: "0 0 4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Sample question
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.55 }}>
                  &ldquo;{role.questions[0]}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA */}
            <motion.div {...fadeUp(0.26)} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <motion.a href="/interview" whileHover={{ scale: 1.03, boxShadow: `0 0 28px rgba(99,102,241,0.45)` }} whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: `0 0 20px rgba(99,102,241,0.25)` }}>
                Try free interview <ArrowRight size={15} />
              </motion.a>
              <span className="acl-cta-note">✓ No signup · 3 sessions/day free</span>
            </motion.div>
          </motion.div>

          {/* Right: chat mockup — hidden on mobile */}
          <div className="acl-mockup-col">
            <ChatMockup role={role} />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: 3-COL FEATURES ──────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(99,102,241,0.08)", padding: "24px clamp(16px,4vw,32px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="acl-feature-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease }}
                whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}
                style={{ padding: "20px 22px", borderRadius: 14, background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)", backdropFilter: "blur(10px)" }}
              >
                <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff", margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "rgba(180,190,220,0.45)", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: PRICING (2 compact cards, inline) ────────── */}
      {showPricing && (
        <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(99,102,241,0.08)", padding: "24px clamp(16px,4vw,32px) 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.7rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
                <span style={{ background: `linear-gradient(120deg,${ACCENT},#a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simple pricing.</span>{" "}
                No surprises.
              </h2>
              <p style={{ fontSize: 13, color: "rgba(180,190,220,0.4)", margin: 0 }}>Cancel any time. No questions asked.</p>
            </div>
            <div className="acl-pricing-grid">
              {PLANS.map((p, i) => (
                <motion.div key={p.name}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  style={{ padding: "22px 20px", borderRadius: 16, position: "relative", overflow: "hidden", background: p.highlight ? "rgba(99,102,241,0.09)" : "rgba(255,255,255,0.02)", border: p.highlight ? `1px solid rgba(99,102,241,0.38)` : "1px solid rgba(99,102,241,0.1)", backdropFilter: "blur(10px)" }}
                >
                  {p.highlight && (
                    <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.18)", color: "#a78bfa", fontWeight: 700 }}>POPULAR</span>
                  )}
                  <p style={{ fontSize: 12, color: "rgba(180,190,220,0.5)", fontWeight: 600, margin: "0 0 6px" }}>{p.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 3 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", color: p.highlight ? "#a78bfa" : "#f0f4ff" }}>{p.price}</span>
                    <span style={{ fontSize: 13, color: "rgba(180,190,220,0.4)" }}>{p.period}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(180,190,220,0.35)", margin: "0 0 14px" }}>{p.note}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(180,190,220,0.65)" }}>
                        <CheckCircle size={11} color={p.highlight ? "#a78bfa" : ACCENT} /> {f}
                      </div>
                    ))}
                  </div>
                  <motion.a href={p.href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "block", padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none", background: p.highlight ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : "rgba(99,102,241,0.1)", color: p.highlight ? "#fff" : "#a78bfa", border: p.highlight ? "none" : `1px solid rgba(99,102,241,0.22)`, boxSizing: "border-box" }}>
                    {p.cta}
                  </motion.a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(99,102,241,0.08)", padding: "14px clamp(16px,4vw,32px)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 13, fontWeight: 800 }}>AI<span style={{ color: "#a78bfa" }}>Coach</span>Lab</span>
        <span style={{ fontSize: 11, color: "rgba(180,190,220,0.25)" }}>© 2026 · Interview smarter, land faster.</span>
      </footer>

      <Chatbot />
    </div>
  );
}

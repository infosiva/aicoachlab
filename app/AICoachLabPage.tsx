"use client";
// Light theme redesign — #f8fafc bg, #f97316 orange accent, white cards
// Sections: Navbar | Hero (split ~70vh) | Role tabs | 3-col features | 2-card pricing | Footer

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LiveStatsBar from "@/components/LiveStatsBar";
import { BrainCircuit, ArrowRight, Send, X, Bot, CheckCircle, Mic, MicOff } from "lucide-react";

const ACCENT = "#f97316";
const ACCENT2 = "#ea580c";
const BG = "#f8fafc";
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
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        width: "100%",
        maxWidth: 380,
      }}
    >
      {/* header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10, background: "#fff" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center" }}>
          <BrainCircuit size={14} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>Interview Coach</p>
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>{role.label} · Practice mode</p>
        </div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b98150" }} />
      </div>

      {/* messages */}
      <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, background: "#f8fafc" }}>
        {/* AI question */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `rgba(249,115,22,0.1)`, border: `1px solid rgba(249,115,22,0.2)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <BrainCircuit size={11} color={ACCENT} />
          </div>
          <div style={{ padding: "9px 12px", borderRadius: "12px 12px 12px 4px", background: "#fff", border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", lineHeight: 1.55, maxWidth: 280, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {role.questions[0]}
          </div>
        </div>

        {/* user typing */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ padding: "9px 12px", borderRadius: "12px 12px 4px 12px", background: `rgba(249,115,22,0.08)`, border: `1px solid rgba(249,115,22,0.2)`, fontSize: 12, color: "#334155", lineHeight: 1.55, maxWidth: 240 }}>
            I&apos;d use three pointers...
            <span style={{ display: "inline-block", width: 2, height: 12, background: ACCENT, marginLeft: 3, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />
          </div>
        </div>

        {/* AI feedback badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", fontSize: 11, color: "#475569" }}>
          <span style={{ color: "#10b981", fontWeight: 700 }}>+12pts</span> Strong use of STAR structure. Add complexity analysis.
        </div>
      </div>

      {/* input row */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "center", background: "#fff" }}>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12, color: "#94a3b8" }}>
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
    { role: "assistant", text: "Hi! I'm your interview coach. Ask me anything about preparing for your next tech interview." },
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
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, width: 50, height: 50, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: `0 4px 24px rgba(249,115,22,0.35)` }}
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
            style={{ position: "fixed", bottom: 82, right: 24, zIndex: 200, width: 320, maxHeight: 480, display: "flex", flexDirection: "column", borderRadius: 16, background: "#fff", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, background: "#fff" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center" }}><BrainCircuit size={14} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>Interview Coach</p>
                <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Ask about any role</p>
              </div>
              <button onClick={toggleVoice} style={{ background: listening ? "rgba(249,115,22,0.08)" : "transparent", border: `1px solid ${listening ? ACCENT : "#e2e8f0"}`, borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                {listening ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}><Mic size={12} color={ACCENT} /></motion.span> : <MicOff size={12} color="#94a3b8" />}
                <span style={{ fontSize: 10, color: listening ? ACCENT : "#94a3b8" }}>{listening ? "Listening" : "Voice"}</span>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 8, background: "#f8fafc" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.role === "user" ? `rgba(249,115,22,0.08)` : "#fff", border: m.role === "user" ? `1px solid rgba(249,115,22,0.2)` : "1px solid #e2e8f0", fontSize: 12, color: "#334155", lineHeight: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: "#fff", borderRadius: "12px 12px 12px 4px", alignSelf: "flex-start", border: "1px solid #e2e8f0" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                      style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "8px 10px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 6, background: "#fff" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about interview prep…"
                style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", color: "#0f172a", fontSize: 13, outline: "none" }} />
              <motion.button onClick={() => send(input)} whileTap={{ scale: 0.9 }} disabled={!input.trim() || loading}
                style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : "#f1f5f9", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "grid", placeItems: "center" }}>
                <Send size={13} color={input.trim() ? "#fff" : "#94a3b8"} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Promo code inline ───────────────────────────────────────────────────────
function PromoCodeInline({ accentColor }: { accentColor: string }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function apply() {
    if (!code.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/promo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      const data = await res.json()
      if (data.valid) { setState('success'); setMsg(`Pro unlocked for ${data.daysUnlocked} days!`) }
      else { setState('error'); setMsg(data.message || 'Invalid code') }
    } catch { setState('error'); setMsg('Something went wrong') }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
      Have a promo code?
    </button>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="Enter code" style={{ flex: 1, maxWidth: 140, padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, outline: 'none' }} />
        <button onClick={apply} disabled={state === 'loading'}
          style={{ padding: '6px 12px', borderRadius: 8, background: accentColor, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {state === 'loading' ? '…' : 'Apply'}
        </button>
      </div>
      {msg && <p style={{ fontSize: 12, margin: 0, color: state === 'success' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{msg}</p>}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AICoachLabPage({ showPricing = true }: { showPricing?: boolean }) {
  const [activeRole, setActiveRole] = useState(0);
  const role = ROLES[activeRole];

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "Inter,system-ui,sans-serif", color: "#0f172a", overflowX: "hidden" }}>
      {/* soft orange ambient glow — top right */}
      <div style={{ position: "fixed", top: -120, right: -80, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      {/* soft glow — bottom left */}
      <div style={{ position: "fixed", bottom: -100, left: -60, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,247,237,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid #fed7aa", padding: "0 clamp(16px,4vw,32px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 56, gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <BrainCircuit size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", color: "#0f172a" }}>
              AI<span style={{ color: ACCENT }}>Coach</span>Lab
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
            <a href="#features" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Pricing</a>
            <motion.a href="/interview" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "7px 16px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 8px rgba(249,115,22,0.3)" }}>
              Try free
            </motion.a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "clamp(32px,6vh,64px) clamp(16px,4vw,32px) clamp(24px,4vh,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="acl-hero-grid" style={{ display: "grid", gap: "clamp(24px,4vw,48px)", alignItems: "center" }}>

            {/* Left: copy */}
            <motion.div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <motion.div {...fadeUp(0.0)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", width: "fit-content" }}>
                <BrainCircuit size={13} color={ACCENT} />
                <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>AI-Powered Mock Interviews</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 1, y: 0 }} style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0, color: "#0f172a" }}>
                Land the job you{" "}
                <span style={{ background: `linear-gradient(120deg,${ACCENT},${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  deserve.
                </span>
                <br />
                Practice smarter.
              </motion.h1>

              <motion.p {...fadeUp(0.14)} style={{ fontSize: "clamp(13px,2vw,16px)", color: "#64748b", lineHeight: 1.65, margin: 0, maxWidth: 420 }}>
                AI-powered mock interviews with real-time coaching. Practice every role, every day. Free to start.
              </motion.p>

              {/* role pills */}
              <motion.div {...fadeUp(0.18)} className="acl-role-strip" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {ROLES.map((r, i) => (
                  <button key={r.label} onClick={() => setActiveRole(i)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px",
                      borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: "pointer",
                      border: `1px solid ${i === activeRole ? r.color : "#e2e8f0"}`,
                      background: i === activeRole ? `${r.color}12` : "#fff",
                      color: i === activeRole ? r.color : "#64748b",
                      transition: "border-color 0.18s, background 0.18s, color 0.18s",
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
                  style={{ padding: "12px 14px", borderRadius: 10, background: `${role.color}08`, border: `1px solid ${role.color}22` }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, color: role.color, margin: "0 0 4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Sample question
                  </p>
                  <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.55 }}>
                    &ldquo;{role.questions[0]}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* CTA */}
              <motion.div {...fadeUp(0.26)} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <motion.a href="/interview" whileHover={{ scale: 1.03, boxShadow: `0 0 28px rgba(249,115,22,0.35)` }} whileTap={{ scale: 0.97 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: `0 4px 16px rgba(249,115,22,0.3)` }}>
                  Try free interview <ArrowRight size={15} />
                </motion.a>
                <span className="acl-cta-note" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>✓ No signup · 3 sessions/day free</span>
              </motion.div>
              <PromoCodeInline accentColor={ACCENT} />
            </motion.div>

            {/* Right: chat mockup */}
            <div className="acl-mockup-col" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ChatMockup role={role} />
            </div>
          </div>
        </div>
      </section>

      <LiveStatsBar />

      {/* ── SECTION 2: 3-COL FEATURES ──────────────────────────────── */}
      <div id="features" style={{ position: "relative", zIndex: 1, borderTop: "1px solid #f1f5f9", padding: "24px clamp(16px,4vw,32px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="acl-feature-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease }}
                whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(249,115,22,0.1)" }}
                style={{ padding: "20px 22px", borderRadius: 14, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: PRICING ──────────────────────────────────────── */}
      {showPricing && (
        <div id="pricing" style={{ position: "relative", zIndex: 1, borderTop: "1px solid #f1f5f9", padding: "24px clamp(16px,4vw,32px) 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.7rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px", color: "#0f172a" }}>
                <span style={{ background: `linear-gradient(120deg,${ACCENT},${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simple pricing.</span>{" "}
                No surprises.
              </h2>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Cancel any time. No questions asked.</p>
            </div>
            <div className="acl-pricing-grid">
              {PLANS.map((p, i) => (
                <motion.div key={p.name}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  style={{ padding: "22px 20px", borderRadius: 16, position: "relative", overflow: "hidden", background: p.highlight ? "#fff" : "#fff", border: p.highlight ? `2px solid ${ACCENT}` : "1px solid #e2e8f0", boxShadow: p.highlight ? `0 4px 24px rgba(249,115,22,0.15)` : "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  {p.highlight && (
                    <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `rgba(249,115,22,0.1)`, color: ACCENT, fontWeight: 700 }}>POPULAR</span>
                  )}
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: "0 0 6px" }}>{p.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 3 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", color: p.highlight ? ACCENT : "#0f172a" }}>{p.price}</span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{p.period}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 14px" }}>{p.note}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#475569" }}>
                        <CheckCircle size={11} color={p.highlight ? ACCENT : "#10b981"} /> {f}
                      </div>
                    ))}
                  </div>
                  <motion.a href={p.href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "block", padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none", background: p.highlight ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : "#f8fafc", color: p.highlight ? "#fff" : "#64748b", border: p.highlight ? "none" : `1px solid #e2e8f0`, boxSizing: "border-box" }}>
                    {p.cta}
                  </motion.a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid #f1f5f9", padding: "14px clamp(16px,4vw,32px)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>AI<span style={{ color: ACCENT }}>Coach</span>Lab</span>
        <span style={{ fontSize: 11, color: "#cbd5e1" }}>© 2026 · Interview smarter, land faster.</span>
      </footer>

      <Chatbot />

      <style>{`
        .acl-hero-grid { grid-template-columns: 1fr 1fr; }
        .acl-feature-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .acl-pricing-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
        .acl-mockup-col { display: flex; }
        .acl-role-strip button:hover { opacity: 0.85; }
        @media (max-width: 768px) {
          .acl-hero-grid { grid-template-columns: 1fr !important; }
          .acl-mockup-col { display: none !important; }
          .acl-feature-grid { grid-template-columns: 1fr !important; }
          .acl-pricing-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

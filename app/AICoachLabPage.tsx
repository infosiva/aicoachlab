"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { Terminal, Cpu, Network, Bot, ChevronDown, ArrowRight, Zap, Users, Clock, Star, CheckCircle, MessageSquare, DollarSign, ShieldCheck, Send, Mic, MicOff, X, TrendingUp, BrainCircuit } from "lucide-react";

/* ── icon map (content.json uses string names) ── */
const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  MessageSquare, DollarSign, Cpu, Network, Bot, Terminal, Clock, Zap, Users, Star, CheckCircle, ShieldCheck, TrendingUp, BrainCircuit
};

/* ── animated counter ── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { stiffness: 100, damping: 30 });
  const [display, setDisplay] = useState("0");
  useEffect(() => { if (inView) count.set(target); }, [inView, count, target]);
  useEffect(() => rounded.on("change", v => setDisplay(Math.round(v).toString())), [rounded]);
  return <span ref={ref}>{display}{suffix}</span>;
}

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease } as const }),
};
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ── types ── */
interface Track { icon: string; label: string; sub: string; color: string; bg: string; border: string; audience: string; }
interface CurriculumItem { week: string; title: string; tag: string; color: string; desc: string; }
interface StatItem { label: string; value: number | string; suffix: string; icon: string; color: string; raw?: boolean; }
interface Plan { name: string; price: string; period: string; features: string[]; highlight: boolean; badge?: string; }
interface FaqItem { q: string; a: string; }
interface TrustItem { icon: string; text: string; }
interface ChatbotConfig { systemPrompt: string; welcomeMessage: string; voiceEnabled: boolean; suggestedQuestions: string[]; }
interface Content {
  hero: { eyebrow: string; headline: string[]; subheadline: string; };
  tracks: Track[];
  trendingTopics: string[];
  curriculum: CurriculumItem[];
  stats: StatItem[];
  plans: Plan[];
  faqs: FaqItem[];
  trust: TrustItem[];
  chatbot: ChatbotConfig;
}

/* ── chatbot message ── */
interface Message { role: "user" | "assistant"; text: string; }

/* ── chatbot component ── */
function Chatbot({ config }: { config: ChatbotConfig }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: config.welcomeMessage }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) setHasVoice(true);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, systemPrompt: config.systemPrompt }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.message || "Sorry, try again." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, config.systemPrompt]);

  const toggleVoice = useCallback(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRec();
    rec.lang = "en-US";
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, send]);

  return (
    <>
{/* Animated blob bg */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} aria-hidden>
        <motion.div
          style={{ position: 'absolute', top: '-15%', left: '-8%', width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          style={{ position: 'absolute', bottom: '-10%', right: '-6%', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234,88,12,0.10) 0%, transparent 70%)', filter: 'blur(90px)' }}
          animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
        />
      </div>
      {/* ── floating chat button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        className="acl-chatbot"
        style={{ position: "fixed", bottom: 28, left: 28, zIndex: 200, width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(124,58,237,0.5)" }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} color="#fff" /></motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Bot size={22} color="#fff" /></motion.span>}
        </AnimatePresence>
      </motion.button>

      {/* ── chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease }}
            className="acl-chatbot-panel"
            style={{ position: "fixed", bottom: 92, left: 28, zIndex: 200, width: 340, maxHeight: 520, display: "flex", flexDirection: "column", borderRadius: 18, background: "rgba(7,8,15,0.95)", border: "1px solid rgba(124,58,237,0.25)", backdropFilter: "blur(20px)", overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }}>

            {/* header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "grid", placeItems: "center" }}>
                <BrainCircuit size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>Interview Coach</div>
                <div style={{ fontSize: 11, color: "rgba(167,139,250,0.5)" }}>Ask about any role track</div>
              </div>
              {hasVoice && (
                <motion.button onClick={toggleVoice} whileTap={{ scale: 0.9 }}
                  style={{ marginLeft: "auto", background: listening ? "rgba(124,58,237,0.2)" : "transparent", border: listening ? "1px solid #7c3aed" : "1px solid rgba(124,58,237,0.2)", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  {listening
                    ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}><Mic size={13} color="#a78bfa" /></motion.span>
                    : <MicOff size={13} color="rgba(167,139,250,0.5)" />}
                  <span style={{ fontSize: 10, color: listening ? "#a78bfa" : "rgba(167,139,250,0.5)" }}>{listening ? "Listening..." : "Voice"}</span>
                </motion.button>
              )}
            </div>

            {/* messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "82%", padding: "9px 12px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                    border: m.role === "user" ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(124,58,237,0.08)",
                    fontSize: 13, color: "#f0f4ff", lineHeight: 1.55
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, paddingLeft: 4 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed" }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* suggested questions (first message only) */}
            {messages.length === 1 && (
              <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {config.suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.85)", cursor: "pointer", textAlign: "left" }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(124,58,237,0.1)", display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about interview tracks, roles..."
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10, padding: "8px 12px", color: "#f0f4ff", fontSize: 13, outline: "none" }}
              />
              <motion.button onClick={() => send(input)} whileTap={{ scale: 0.9 }} disabled={!input.trim() || loading}
                style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(124,58,237,0.07)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={14} color={input.trim() ? "#fff" : "rgba(124,58,237,0.3)"} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── trending ticker ── */
function TrendingTicker({ topics }: { topics: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % topics.length), 3200);
    return () => clearInterval(t);
  }, [topics]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", maxWidth: "fit-content" }}>
      <TrendingUp size={11} color="#a78bfa" />
      <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.06em" }}>TRENDING</span>
      <AnimatePresence mode="wait">
        <motion.span key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}
          style={{ fontSize: 12, color: "rgba(180,190,220,0.75)" }}>
          {topics[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function AICoachLabPage({ showPricing = false }: { showPricing?: boolean }) {
  const [content, setContent] = useState<Content | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [activeTrack, setActiveTrack] = useState(0);

  /* load config from public/content.json — update without code change */
  useEffect(() => {
    fetch("/content.json")
      .then(r => r.json())
      .then(setContent)
      .catch(() => {});
  }, []);

  /* rotate active track */
  useEffect(() => {
    if (!content) return;
    const t = setInterval(() => setActiveTrack(p => (p + 1) % content.tracks.length), 2600);
    return () => clearInterval(t);
  }, [content]);

  if (!content) return (
    <div style={{ background: "#07080f", minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(124,58,237,0.3)" }} />
    </div>
  );

  const track = content.tracks[activeTrack];
  const TrackIcon = ICONS[track.icon] || Bot;

  return (
    <div style={{ background: "#07080f", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#f0f4ff", overflowX: "hidden" }}>
      <style>{`
        html, body { overflow-x: hidden; max-width: 100%; }
        .acl-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .acl-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .acl-pricing-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 48px; align-items: start; }
        @media (max-width: 768px) {
          .acl-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .acl-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .acl-pricing-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .acl-section { padding: 80px 16px 40px !important; }
          .acl-pricing-section { padding: 40px 16px !important; }
          .acl-nav { padding: 12px 16px !important; }
          .acl-chatbot { left: 12px !important; right: auto !important; bottom: 12px !important; width: 46px !important; height: 46px !important; }
          .acl-chatbot-panel { left: 12px !important; right: auto !important; bottom: 68px !important; width: calc(100vw - 24px) !important; max-width: 380px !important; }
        }
      `}</style>

      {/* ── ambient gradient mesh ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ position: "absolute", bottom: "10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{ position: "absolute", top: "40%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(124,58,237,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* ── nav ── */}
      <nav className="acl-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", background: "rgba(7,8,15,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "grid", placeItems: "center" }}>
            <BrainCircuit size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", color: "#f0f4ff" }}>AI<span style={{ color: "#a78bfa" }}>Coach</span>Lab</span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#tracks" style={{ fontSize: 13, color: "rgba(180,190,220,0.7)", textDecoration: "none" }}>Tracks</a>
          <a href="/tracks" style={{ fontSize: 13, color: "rgba(167,139,250,0.85)", textDecoration: "none", fontWeight: 500 }}>Practice</a>
          <a href="#pricing" style={{ fontSize: 13, color: "rgba(180,190,220,0.7)", textDecoration: "none" }}>Pricing</a>
          <motion.a href="/interview" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: "7px 16px", borderRadius: 8, background: "transparent", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            Try free
          </motion.a>
          <motion.a href="#pricing" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: "7px 18px", borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            Get Pro
          </motion.a>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          SECTION 1 — Full-screen hero (100vh)
      ═══════════════════════════════════════ */}
      <section className="acl-section" style={{ position: "relative", zIndex: 1, padding: "100px 40px 64px", maxWidth: 1240, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div className="acl-hero-grid">

          {/* ── left ── */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* trending ticker */}
            <motion.div variants={fadeUp} custom={0}>
              <TrendingTicker topics={content.trendingTopics} />
            </motion.div>

            {/* eyebrow */}
            <motion.div variants={fadeUp} custom={1}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.07)", fontSize: 12, color: "#a78bfa", fontWeight: 500, letterSpacing: "0.04em" }}>
                <Zap size={11} /> {content.hero.eyebrow}
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1 variants={fadeUp} custom={2} style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", margin: 0, color: "#f0f4ff" }}>
              {content.hero.headline[0]}{" "}
              <span style={{ background: "linear-gradient(120deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{content.hero.headline[1]}</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={3} style={{ fontSize: 16, color: "rgba(180,190,220,0.65)", lineHeight: 1.65, margin: 0, maxWidth: 440 }}>
              {content.hero.subheadline}
            </motion.p>

            {/* track pills */}
            <motion.div variants={fadeUp} custom={4} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {content.tracks.map((t, i) => {
                const TIcon = ICONS[t.icon] || Bot;
                return (
                  <motion.button key={i} onClick={() => setActiveTrack(i)}
                    animate={{ background: i === activeTrack ? t.bg : "transparent", borderColor: i === activeTrack ? t.border : "rgba(167,243,208,0.1)", color: i === activeTrack ? t.color : "rgba(167,243,208,0.4)", scale: i === activeTrack ? 1.05 : 1 }}
                    transition={{ duration: 0.35, ease }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", background: "transparent" }}>
                    <TIcon size={12} /> {t.label}
                    <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>{t.audience}</span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* active track detail */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTrack} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3, ease }}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: track.color }}>
                <TrackIcon size={14} />
                <span>{track.sub}</span>
              </motion.div>
            </AnimatePresence>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={5} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <motion.a href="/interview" whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(124,58,237,0.5)" }} whileTap={{ scale: 0.96 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", letterSpacing: "-0.2px", cursor: "pointer" }}>
                Start mock interview — free <ArrowRight size={16} />
              </motion.a>
              <motion.a href="/tracks" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 10, background: "transparent", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", fontWeight: 600, fontSize: 14, textDecoration: "none", cursor: "pointer" }}>
                Practice tracks
              </motion.a>
            </motion.div>
            <div style={{ fontSize: 11, color: "rgba(180,190,220,0.35)", marginTop: 4 }}>
              ✓ No account needed · 3 sessions/day free · Upgrade anytime
            </div>

            {/* trust */}
            <motion.div variants={fadeUp} custom={6} style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              {content.trust.map((t, i) => (
                <span key={i} style={{ fontSize: 12, color: "rgba(180,190,220,0.5)", display: "flex", alignItems: "center", gap: 4 }}>{t.icon} {t.text}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── right: stats + curriculum (config-driven) ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }}
            className="acl-stats-grid">

            {content.stats.map((s, i) => {
              const SIcon = ICONS[s.icon] || Zap;
              return (
                <motion.div key={i} whileHover={{ scale: 1.04, y: -3 }} transition={{ duration: 0.2 }}
                  style={{ padding: "20px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.1)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <SIcon size={18} color={s.color} />
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: s.color }}>
                    {s.raw ? s.value : <Counter target={s.value as number} suffix={s.suffix} />}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(180,190,220,0.5)", fontWeight: 500 }}>{s.label}</div>
                </motion.div>
              );
            })}

            {/* curriculum strip — spans full width, track-aware */}
            <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}>
              {content.curriculum.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.07, duration: 0.4, ease }}
                  whileHover={{ x: 4 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: activeTrack === i ? `${c.color}10` : "rgba(255,255,255,0.02)", border: activeTrack === i ? `1px solid ${c.color}40` : "1px solid rgba(124,58,237,0.08)", cursor: "pointer", transition: "background 0.35s, border 0.35s" }}
                  onClick={() => setActiveTrack(i)}>
                  <CheckCircle size={13} color={c.color} />
                  <span style={{ fontSize: 11, color: "rgba(180,190,220,0.4)", minWidth: 44 }}>{c.week}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff" }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(180,190,220,0.35)", marginTop: 1 }}>{c.desc}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${c.color}18`, color: c.color, fontWeight: 600, whiteSpace: "nowrap" }}>{c.tag}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 1.5 — Practice Tracks Banner
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.a
          href="/tracks"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease }}
          whileHover={{ boxShadow: "0 0 48px rgba(124,58,237,0.25)", borderColor: "rgba(124,58,237,0.5)" }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 24,
            padding: "28px 32px",
            borderRadius: 18,
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.2)",
            backdropFilter: "blur(10px)",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                color: "#7c3aed", background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)", borderRadius: 5,
                padding: "3px 8px",
              }}>NEW</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#a78bfa" }}>PRACTICE TRACKS</div>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "#f0f4ff" }}>
              Exercism-style interview practice
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(167,139,250,0.65)", lineHeight: 1.55, maxWidth: 560 }}>
              4 tracks · Behavioural, System Design, SWE, PM · Easy → Medium → Hard progression · AI scores your answers against specific criteria · Model answers revealed after submission
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {["Behavioural", "System Design", "SWE Coding", "Product Management"].map((t) => (
                <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{t}</span>
              ))}
            </div>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}
          >
            Start practising <ArrowRight size={16} />
          </motion.div>
        </motion.a>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — Pricing + FAQ
      ═══════════════════════════════════════ */}
      {showPricing && (<section id="pricing" className="acl-pricing-section" style={{ position: "relative", zIndex: 1, padding: "60px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="acl-pricing-grid">

          {/* pricing */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}
              style={{ marginBottom: 24 }}>
              <h2 id="pricing-title" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px", color: "#f0f4ff" }}>
                <span style={{ background: "linear-gradient(120deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simple pricing.</span> No surprises.
              </h2>
              <p style={{ fontSize: 14, color: "rgba(180,190,220,0.5)", margin: 0 }}>Cancel monthly any time. Team invoices available.</p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {content.plans.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease }} whileHover={{ scale: 1.03, y: -4 }}
                  style={{ padding: "22px 18px", borderRadius: 16, position: "relative", overflow: "hidden",
                    background: p.highlight ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)",
                    border: p.highlight ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(124,58,237,0.1)",
                    backdropFilter: "blur(10px)" }}>
                  {p.badge && (
                    <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(124,58,237,0.2)", color: "#a78bfa", fontWeight: 600 }}>{p.badge}</span>
                  )}
                  <div style={{ fontSize: 12, color: "rgba(180,190,220,0.5)", fontWeight: 500, marginBottom: 8 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: p.highlight ? "#a78bfa" : "#f0f4ff" }}>{p.price}</span>
                    <span style={{ fontSize: 12, color: "rgba(180,190,220,0.4)" }}>{p.period}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 18px" }}>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(180,190,220,0.65)" }}>
                        <CheckCircle size={11} color={p.highlight ? "#a78bfa" : "#7c3aed"} /> {f}
                      </div>
                    ))}
                  </div>
                  {p.price === "$0" ? (
                    <motion.a href="/interview" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      style={{ display: "block", width: "100%", padding: "10px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        background: "rgba(124,58,237,0.1)", color: "#a78bfa", textAlign: "center", textDecoration: "none",
                        border: "1px solid rgba(124,58,237,0.25)", boxSizing: "border-box" }}>
                      Start mock interview →
                    </motion.a>
                  ) : (
                    <motion.a href="/api/checkout" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      style={{ display: "block", width: "100%", padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                        background: p.highlight ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(124,58,237,0.07)",
                        color: p.highlight ? "#fff" : "rgba(180,190,220,0.8)", textAlign: "center", textDecoration: "none",
                        boxSizing: "border-box" }}>
                      Get Pro
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            <h3 style={{ fontSize: "clamp(1.1rem,2vw,1.4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>FAQ</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {content.faqs.map((f, i) => (
                <motion.div key={i} layout style={{ borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(124,58,237,0.1)", overflow: "hidden" }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "transparent", border: "none", color: "#f0f4ff", fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left", gap: 8 }}>
                    <span>{f.q}</span>
                    <motion.span animate={{ rotate: faqOpen === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown size={14} color="rgba(180,190,220,0.4)" />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease }}>
                        <p style={{ margin: 0, padding: "0 16px 14px", fontSize: 13, color: "rgba(180,190,220,0.55)", lineHeight: 1.6 }}>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }}
              style={{ marginTop: 24, padding: "20px", borderRadius: 14, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", textAlign: "center" }}>
              <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Ready to ace your next interview?</p>
              <motion.a href="/interview" whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(124,58,237,0.4)" }} whileTap={{ scale: 0.96 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none", cursor: "pointer" }}>
                Start mock interview <ArrowRight size={14} />
              </motion.a>
              <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(180,190,220,0.4)" }}>30-day money-back guarantee · no questions asked</p>
            </motion.div>
          </motion.div>
        </div>
      </section>)}

      {/* ── footer ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "24px 32px", borderTop: "1px solid rgba(124,58,237,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>AI<span style={{ color: "#a78bfa" }}>Coach</span>Lab</span>
        <span style={{ fontSize: 12, color: "rgba(180,190,220,0.3)" }}>© 2026 · Interview smarter, land faster.</span>
      </footer>

      {/* ── floating AI chatbot (always-on) ── */}
      <Chatbot config={content.chatbot} />
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "@infosiva/shared-ui/modern";
import Logo from "@/components/Logo";
import { AI_CODING_ECOSYSTEM } from "@/lib/guides/ai-coding-ecosystem";

// Demo plays real questions from the shipped /guides content (no invented exchanges).
const QS = AI_CODING_ECOSYSTEM.layers.flatMap((l) => l.questions);
const clip = (t: string, n: number) => (t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "..." : t);

const ROLES = ["Software Engineer", "Product Manager", "System Design", "Behavioural", "Data Science", "Frontend Engineer"];

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  position: "relative",
  overflow: "hidden",
};

function Demo() {
  const [n, setN] = useState(0);
  const [ex, setEx] = useState(0);
  const q = QS[ex];
  const msgs = [
    { who: "Interviewer", text: q.q },
    { who: "Coach: what they probe", text: clip(q.testing, 150) },
    { who: "Coach: strong answer", text: clip(q.answer, 170) },
  ];
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(msgs.length); return; }
    const t = setInterval(() => {
      setN((v) => {
        if (v >= msgs.length + 2) { setEx((e) => (e + 1) % QS.length); return 0; }
        return v + 1;
      });
    }, 1900);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div aria-label="Interview question with coaching" style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 190 }}>
      {msgs.slice(0, Math.min(n, msgs.length)).map((m, i) => (
        <motion.div key={`${ex}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{
            alignSelf: m.who === "Interviewer" ? "flex-start" : "flex-end", maxWidth: "92%", padding: "8px 12px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
            background: m.who === "Interviewer" ? "var(--surface-2)" : "var(--accent-dim)",
            border: m.who === "Interviewer" ? "1px solid var(--border)" : "1px solid var(--accent)",
            color: "var(--text)",
          }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: m.who === "Interviewer" ? "var(--text-3)" : "var(--accent)", marginBottom: 2 }}>{m.who}</span>
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

function Wave() {
  return (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 28 }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <i key={i} className="acl-bar" style={{ width: 6, height: "100%", borderRadius: 3, background: "var(--accent)", animationDelay: `${i * 0.09}s` }} />
      ))}
    </div>
  );
}

const linkStyle: React.CSSProperties = { color: "var(--accent)", fontSize: 14, fontWeight: 600, display: "inline-block", minHeight: 44, lineHeight: "44px", marginTop: 2 };

export default function AICoachLabPage({ showPricing = true }: { showPricing?: boolean }) {
  return (
    <>
      <div className="acl-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <header style={{ maxWidth: 1120, margin: "0 auto", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" aria-label="AICoachLab home"><Logo /></Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
            <Link href="/tracks" className="acl-nav-link">Tracks</Link>
            <Link href="/learn" className="acl-nav-link">Learn</Link>
            {showPricing && <a href="#pricing" className="acl-nav-link">Pricing</a>}
          </nav>
        </header>

        <main style={{ maxWidth: 1120, margin: "0 auto", padding: "4px 16px 16px" }}>
          <section className="acl-hero">
            <div>
              <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
                Practice the interview <span style={{ color: "var(--accent)" }}>out loud.</span>
              </h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", margin: "12px 0 18px", maxWidth: 480, lineHeight: 1.5 }}>
                An AI interviewer asks, you answer, a coach tells you what to fix. No signup to start.
              </p>
              <Link href="/interview" style={{ textDecoration: "none" }}>
                <MagneticButton
                  style={{ padding: "12px 24px", minHeight: 48, borderRadius: 12, background: "var(--accent)", color: "var(--ink)", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 10px 40px var(--accent-glow)" }}>
                  Start a mock interview
                </MagneticButton>
              </Link>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }} aria-label="Pick your role">
                {ROLES.map((r) => (
                  <Link key={r} href="/interview" style={{ padding: "4px 10px", minHeight: 44, display: "inline-flex", alignItems: "center", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12.5, textDecoration: "none" }}>{r}</Link>
                ))}
              </div>
            </div>
            <motion.div style={{ ...card, padding: 16 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 8px" }}>From the AI-tooling interview guide (as of 2026-10)</p>
              <Demo />
            </motion.div>
          </section>

          <section aria-label="What you get" className="acl-bento">
            <motion.div style={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>Answer by voice</h2>
              <Wave />
              <Link href="/interview/live" style={linkStyle}>Try live mode</Link>
            </motion.div>
            <motion.div style={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>Blindfold mode</h2>
              <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>Guess human or bot.</p>
              <Link href="/interview/blindfold" style={linkStyle}>Play blindfold</Link>
            </motion.div>
            <motion.div style={card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>Learn the topics</h2>
              <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>Tracks and lessons.</p>
              <Link href="/tracks" style={linkStyle}>Browse tracks</Link>
            </motion.div>
            {showPricing && (
              <motion.div id="pricing" style={{ ...card, borderStyle: "dashed" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }}>
                <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>Free · $0</h2>
                <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>All modes, rate-limited. No paid plan exists yet: tell us what you would pay for via Feedback.</p>
              </motion.div>
            )}
          </section>
        </main>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "10px 16px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          AICoachLab · <Link href="/privacy" style={{ color: "var(--text-2)" }}>Privacy</Link>
        </footer>
      </div>

      <style>{`
        .acl-hero { display: grid; gap: 24px; grid-template-columns: 1fr 1fr; align-items: center; margin-bottom: 14px; }
        .acl-bento { display: grid; gap: 12px; grid-template-columns: repeat(4, 1fr); }
        .acl-nav-link { color: var(--text-2); text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; }
        .acl-nav-link:hover { color: var(--accent); }
        @media (max-width: 900px) { .acl-hero { grid-template-columns: 1fr; gap: 14px; } .acl-bento { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .acl-bento p { display: none; } }
      `}</style>
    </>
  );
}

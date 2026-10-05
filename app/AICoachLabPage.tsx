"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "@infosiva/shared-ui/modern";
import Logo from "@/components/Logo";

// Sample interview exchange for the demo tile. Labelled as a sample in the UI.
const SAMPLE = [
  { who: "Interviewer", text: "Design a rate limiter for a public API." },
  { who: "You", text: "I'd use a token bucket per API key, stored in Redis with a TTL..." },
  { who: "Coach", text: "Good start. Name the trade-off: fixed window vs token bucket, and say what happens if Redis fails." },
];

const ROLES = ["Software Engineer", "Product Manager", "System Design", "Behavioural", "Data Science", "Frontend Engineer"];

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 22,
  position: "relative",
  overflow: "hidden",
};

function Demo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(SAMPLE.length); return; }
    const t = setInterval(() => setN((v) => (v >= SAMPLE.length + 2 ? 0 : v + 1)), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div aria-label="Sample interview exchange" style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 210 }}>
      {SAMPLE.slice(0, Math.min(n, SAMPLE.length)).map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{
            alignSelf: m.who === "You" ? "flex-end" : "flex-start", maxWidth: "88%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.5,
            background: m.who === "Coach" ? "var(--accent-dim)" : m.who === "You" ? "var(--surface-2)" : "transparent",
            border: m.who === "Coach" ? "1px solid var(--accent)" : "1px solid var(--border)",
            color: "var(--text)",
          }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: m.who === "Coach" ? "var(--accent)" : "var(--text-3)", marginBottom: 2 }}>{m.who}</span>
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

function Wave() {
  return (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 56 }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <i key={i} className="acl-bar" style={{ width: 6, height: "100%", borderRadius: 3, background: "var(--accent)", animationDelay: `${i * 0.09}s` }} />
      ))}
    </div>
  );
}

const linkStyle: React.CSSProperties = { color: "var(--accent)", fontSize: 14, fontWeight: 600, display: "inline-block", minHeight: 44, lineHeight: "44px" };

export default function AICoachLabPage({ showPricing = true }: { showPricing?: boolean }) {
  return (
    <>
      <div className="acl-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <header style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" aria-label="AICoachLab home"><Logo /></Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
            <Link href="/tracks" className="acl-nav-link">Tracks</Link>
            <Link href="/learn" className="acl-nav-link">Learn</Link>
            {showPricing && <a href="#pricing" className="acl-nav-link">Pricing</a>}
          </nav>
        </header>

        <main style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 16px 72px" }}>
          <section style={{ maxWidth: 760, marginBottom: 36 }}>
            <h1 style={{ fontSize: "clamp(34px, 7vw, 64px)", lineHeight: 1.04, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
              Practice the interview <span style={{ color: "var(--accent)" }}>out loud.</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-2)", margin: "18px 0 26px", maxWidth: 560, lineHeight: 1.55 }}>
              An AI interviewer asks, you answer, a coach tells you what to fix. No signup to start.
            </p>
            <Link href="/interview" style={{ textDecoration: "none" }}>
              <MagneticButton
                style={{ padding: "14px 28px", minHeight: 48, borderRadius: 12, background: "var(--accent)", color: "var(--ink)", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 10px 40px var(--accent-glow)" }}>
                Start a mock interview
              </MagneticButton>
            </Link>
          </section>

          <section aria-label="What you get" className="acl-bento">
            <motion.div className="acl-t-demo" style={card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 12px" }}>Sample exchange, not a real user session</p>
              <Demo />
            </motion.div>

            <motion.div style={card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
              <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Answer by voice</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, margin: "0 0 18px" }}>Speak your answer like the real thing, or type it.</p>
              <Wave />
              <Link href="/interview/live" style={{ ...linkStyle, marginTop: 12 }}>Try live mode</Link>
            </motion.div>

            <motion.div style={card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
              <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Pick your role</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, margin: "0 0 14px" }}>Questions tuned to what you are interviewing for.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ROLES.map((r) => (
                  <Link key={r} href="/interview" style={{ padding: "8px 12px", minHeight: 44, display: "inline-flex", alignItems: "center", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13, textDecoration: "none" }}>{r}</Link>
                ))}
              </div>
            </motion.div>

            <motion.div style={card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}>
              <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Blindfold mode</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, margin: "0 0 8px" }}>Interview a mystery interviewer, then guess human or bot.</p>
              <Link href="/interview/blindfold" style={linkStyle}>Play blindfold</Link>
            </motion.div>

            <motion.div style={card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}>
              <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Learn the topics</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, margin: "0 0 8px" }}>Tracks and lessons to study between sessions.</p>
              <Link href="/tracks" style={linkStyle}>Browse tracks</Link>
            </motion.div>
          </section>

          {showPricing && (
            <section id="pricing" style={{ marginTop: 64 }}>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", margin: "0 0 20px" }}>Pricing</h2>
              <div className="acl-pricing">
                <div style={card}>
                  <h3 style={{ fontSize: 18, margin: 0 }}>Free</h3>
                  <p style={{ fontSize: 34, fontWeight: 700, margin: "8px 0 14px", fontFamily: "var(--font-display)" }}>$0</p>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", fontSize: 14, lineHeight: 1.8 }}>
                    <li>Mock interviews with AI feedback</li>
                    <li>Blindfold and live modes</li>
                    <li>Tracks and lessons</li>
                    <li>Rate-limited to keep the service free</li>
                  </ul>
                </div>
                <div style={{ ...card, borderStyle: "dashed" }}>
                  <h3 style={{ fontSize: 18, margin: 0 }}>Pro</h3>
                  <p style={{ fontSize: 20, fontWeight: 600, margin: "14px 0", color: "var(--text-2)" }}>Not available yet</p>
                  <p style={{ color: "var(--text-3)", fontSize: 14, margin: 0 }}>No paid plan exists today. Use the feedback button to tell us what you would pay for.</p>
                </div>
              </div>
            </section>
          )}
        </main>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 16px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          AICoachLab · <Link href="/privacy" style={{ color: "var(--text-2)" }}>Privacy</Link>
        </footer>
      </div>

      <style>{`
        .acl-bento { display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); }
        .acl-t-demo { grid-column: span 2; grid-row: span 2; }
        .acl-pricing { display: grid; gap: 16px; grid-template-columns: repeat(2, 1fr); max-width: 760px; }
        .acl-nav-link { color: var(--text-2); text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; }
        .acl-nav-link:hover { color: var(--accent); }
        @media (max-width: 820px) {
          .acl-bento, .acl-pricing { grid-template-columns: 1fr; }
          .acl-t-demo { grid-column: auto; grid-row: auto; }
        }
      `}</style>
    </>
  );
}

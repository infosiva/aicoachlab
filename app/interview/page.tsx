'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mic, MessageSquare, Eye, Zap } from 'lucide-react'

const ROLES = [
  { id: 'swe',         label: 'Software Engineer',  icon: '{ }',   sub: 'DSA · Systems · Architecture',       color: '#7c3aed', glow: 'rgba(124,58,237,0.4)' },
  { id: 'pm',          label: 'Product Manager',     icon: '◈',    sub: 'Strategy · Metrics · Roadmap',        color: '#0ea5e9', glow: 'rgba(14,165,233,0.4)' },
  { id: 'system',      label: 'System Design',       icon: '⬡',    sub: 'Scale · Infra · Trade-offs',          color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  { id: 'behavioural', label: 'Behavioural',         icon: '◎',    sub: 'Leadership · STAR · Conflict',        color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  { id: 'data',        label: 'Data Science',        icon: '∿',    sub: 'ML · Stats · Product Analytics',      color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
  { id: 'frontend',    label: 'Frontend Engineer',   icon: '◻',    sub: 'React · Performance · UX',            color: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
]

const MODES = [
  {
    id: 'blindfold',
    href: '/interview/blindfold',
    title: 'Blindfold',
    tagline: 'Bot or human? You decide.',
    desc: 'Interview with a mystery interviewer. Voice-first. Reveal at the end.',
    badge: 'Most viral',
    badgeColor: '#f59e0b',
    Icon: Eye,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
  },
  {
    id: 'live',
    href: '/interview/live',
    title: 'Live Coach',
    tagline: 'Real-time mid-answer feedback.',
    desc: 'AI coach whispers tips as you speak. STAR tracker, filler counter, pacing alerts.',
    badge: 'Most useful',
    badgeColor: '#10b981',
    Icon: Zap,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    id: 'classic',
    href: '/interview/classic',
    title: 'Mock Interview',
    tagline: 'Face-to-face. Just you and AI.',
    desc: 'Classic mock interview — choose your role, answer questions, get scored.',
    badge: 'Best for practice',
    badgeColor: '#0ea5e9',
    Icon: MessageSquare,
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.35)',
  },
]

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }

export default function InterviewHub() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState('swe')
  const [selectedMode, setSelectedMode] = useState('classic')

  function launch() {
    const mode = MODES.find(m => m.id === selectedMode)
    if (!mode) return
    router.push(`${mode.href}?role=${selectedRole}`)
  }

  const activeMode = MODES.find(m => m.id === selectedMode)!
  const activeRole = ROLES.find(r => r.id === selectedRole)!

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden', position: 'relative' }}>

      {/* ── Atmosphere ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 700, borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%)`,
          filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 10%, transparent 80%)' }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '12px 24px',
        borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)',
        background: 'rgba(7,8,15,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.button onClick={() => router.push('/')}
          whileHover={{ x: -3 }} whileTap={{ scale: 0.94 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'grid', placeItems: 'center', fontSize: 12, color: '#fff', fontWeight: 800 }}>A</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.2px' }}>AI<span style={{ color: 'var(--violet-2)' }}>Coach</span>Lab</span>
        </motion.button>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/tracks" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>Practice tracks</a>
          <a href="/learn" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>Learn</a>
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1060, margin: '0 auto',
        padding: '48px 24px 80px' }}>

        {/* Header */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', background: 'var(--violet-dim)',
            border: '1px solid rgba(124,58,237,0.3)', borderRadius: 99,
            fontSize: 11, fontWeight: 700, color: 'var(--violet-2)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            <Mic size={11} /> Voice-first · No account needed
          </motion.div>

          <motion.h1 variants={fadeUp}
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 16px' }}>
            Your interview room.
            <br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 55%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Practice like it's real.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp}
            style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 480, margin: '0 auto',
              lineHeight: 1.65 }}>
            Pick your role. Pick your mode. Start talking. AI interviewer is waiting.
          </motion.p>
        </motion.div>

        {/* ── Two-column picker ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
          alignItems: 'start' }}>

          {/* LEFT — Role selector */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
              1 — Choose your role
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map(r => {
                const active = r.id === selectedRole
                return (
                  <motion.button key={r.id} onClick={() => setSelectedRole(r.id)}
                    whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                      border: `1.5px solid ${active ? r.color + '60' : 'var(--border)'}`,
                      background: active ? `${r.color}12` : 'var(--surface)',
                      color: 'var(--text)',
                      boxShadow: active ? `0 0 24px ${r.glow}40` : 'none',
                      transition: `all 220ms var(--ease)` }}>
                    <span style={{ fontSize: 20, color: active ? r.color : 'var(--text-3)',
                      fontFamily: 'monospace', fontWeight: 700, minWidth: 28,
                      textAlign: 'center', transition: 'color 200ms' }}>
                      {r.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                        color: active ? 'var(--text)' : 'var(--text-2)' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.sub}</div>
                    </div>
                    <motion.span
                      animate={{ opacity: active ? 1 : 0, x: active ? 0 : 4 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontSize: 11, fontWeight: 700, color: r.color,
                        flexShrink: 0, letterSpacing: '-0.01em' }}>
                      Start →
                    </motion.span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* RIGHT — Mode selector + Launch */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>
              2 — Choose your mode
            </div>

            {MODES.map(m => {
              const active = m.id === selectedMode
              const MIcon = m.Icon
              return (
                <motion.button key={m.id} onClick={() => setSelectedMode(m.id)}
                  whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '18px 20px', borderRadius: 16, textAlign: 'left',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    border: `1.5px solid ${active ? m.color + '55' : 'var(--border)'}`,
                    background: active ? `${m.color}0f` : 'var(--surface)',
                    boxShadow: active ? `0 0 32px ${m.glow}` : 'none',
                    transition: `all 250ms var(--ease)` }}>
                  {active && (
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0,
                      width: 3, background: m.color, borderRadius: '0 16px 16px 0' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: active ? `${m.color}22` : 'var(--surface-2)',
                      border: `1px solid ${active ? m.color + '40' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 220ms' }}>
                      <MIcon size={16} color={active ? m.color : 'var(--text-3)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em',
                          color: active ? 'var(--text)' : 'var(--text-2)' }}>
                          {m.title}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px',
                          borderRadius: 99, background: `${m.badgeColor}18`,
                          color: m.badgeColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {m.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: active ? m.color : 'var(--text-3)',
                        fontWeight: 600, marginBottom: 4 }}>{m.tagline}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{m.desc}</div>
                    </div>
                  </div>
                </motion.button>
              )
            })}

            {/* Summary strip */}
            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: 18 }}>{activeRole.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Role</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: activeRole.color }}>{activeRole.label}</div>
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: 18 }}>{activeMode.id === 'blindfold' ? '🕶️' : activeMode.id === 'live' ? '⚡' : '💬'}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mode</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: activeMode.color }}>{activeMode.title}</div>
                </div>
              </div>
            </div>

            {/* Launch button */}
            <motion.button onClick={launch}
              whileHover={{ scale: 1.02, boxShadow: `0 0 48px ${activeMode.glow}` }}
              whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '16px 28px', borderRadius: 14,
                border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 16,
                letterSpacing: '-0.02em', color: '#fff',
                background: `linear-gradient(135deg, ${activeRole.color} 0%, ${activeMode.color} 100%)`,
                boxShadow: `0 0 32px ${activeMode.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: `all 300ms var(--ease)` }}>
              <Mic size={18} />
              Start {activeMode.title} — {activeRole.label}
              <ArrowRight size={18} />
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)',
              letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              Voice-first · No signup · Free · Groq-powered
            </p>
          </motion.div>
        </div>

        {/* ── Face-to-face preview strip ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease }}
          style={{ marginTop: 56, padding: '28px 32px', borderRadius: 20,
            background: 'var(--surface)', border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24,
            alignItems: 'center' }}>

            {/* Interviewer side */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.2))',
                border: '2px solid rgba(124,58,237,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
                🤖
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>AI Interviewer</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Ready to interview you</div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 10 }}>
                {[0,1,2,3,4].map(i => (
                  <motion.div key={i}
                    style={{ width: 3, borderRadius: 99, background: 'var(--violet-2)' }}
                    animate={{ height: [4, 14+i*3, 4], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 0.7+i*0.1, repeat: Infinity, delay: i*0.12, ease: 'easeInOut' }} />
                ))}
              </div>
            </div>

            {/* VS divider */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>vs</div>
              <div style={{ width: 1, height: 60, background: 'var(--border)', margin: '0 auto' }} />
            </div>

            {/* You side */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg, rgba(14,165,233,0.3), rgba(16,185,129,0.15))',
                border: '2px solid rgba(14,165,233,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, boxShadow: '0 0 30px rgba(14,165,233,0.25)' }}>
                🧑‍💻
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>You</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {ROLES.find(r=>r.id===selectedRole)?.label ?? 'Candidate'}
              </div>
              <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
                border: '1px solid rgba(16,185,129,0.25)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
                  boxShadow: '0 0 6px var(--green)', display: 'inline-block' }} />
                Ready
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .interview-grid { grid-template-columns: 1fr !important; }
          .preview-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  )
}

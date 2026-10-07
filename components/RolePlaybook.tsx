'use client'
import { useEffect, useState } from 'react'
import type { Role } from '@/lib/roles'

const ACCENT = '#ec13d6'
const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12 } as const
const label = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 } as const

export default function RolePlaybook({ role }: { role: Role }) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setActive(a => (a + 1) % role.steps.length), 3200)
    return () => clearInterval(t)
  }, [playing, role.steps.length])

  const step = role.steps[active]
  const item = role.stack.find(s => s.id === step.stackId)

  const pick = (i: number) => {
    setActive(i)
    setPlaying(false)
    try { window.dispatchEvent(new CustomEvent('role_step', { detail: { role: role.slug, step: i } })) } catch {}
  }

  return (
    <div className="rp-shell" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1fr)' }}>
      <style>{`
        @media (min-width: 900px) { .rp-shell { grid-template-columns: 300px minmax(0,1fr) !important; } .rp-pane { max-height: calc(100dvh - 220px); overflow-y: auto; } }
        @media (max-width: 899px) { .rp-steps { display: flex !important; overflow-x: auto; overflow-y: hidden; gap: 8px; } .rp-steps li { flex: none; } .rp-steps .rp-step { white-space: nowrap; } .rp-detail { max-height: 56dvh; overflow-y: auto; } }
        @keyframes rp-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(236,19,214,.45) } 50% { box-shadow: 0 0 0 8px rgba(236,19,214,0) } }
        @keyframes rp-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        .rp-active { animation: rp-pulse 1.8s ease-in-out infinite; }
        .rp-card { animation: rp-in .35s ease-out; }
        .rp-step { transition: transform .15s ease, background .2s ease; }
        .rp-step:active { transform: scale(.98); }
        @media (prefers-reduced-motion: reduce) { .rp-active, .rp-card { animation: none; } .rp-step { transition: none; } }
      `}</style>

      <ol aria-label="Workflow" className="rp-pane rp-steps" style={{ ...card, listStyle: 'none', margin: 0, padding: 12, display: 'grid', gap: 6, alignContent: 'start' }}>
        {role.steps.map((s, i) => (
          <li key={s.stackId}>
            <button
              type="button"
              onClick={() => pick(i)}
              aria-current={i === active ? 'step' : undefined}
              className={`rp-step ${i === active ? 'rp-active' : ''}`}
              style={{
                width: '100%', minHeight: 44, textAlign: 'left', cursor: 'pointer', padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10, color: '#f0f4ff',
                background: i === active ? 'rgba(236,19,214,0.18)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === active ? ACCENT : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <span aria-hidden style={{
                width: 26, height: 26, flex: 'none', borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
                background: i <= active ? ACCENT : 'rgba(255,255,255,0.1)', color: i <= active ? '#0c0714' : '#d5dae6',
              }}>{i + 1}</span>
              <span style={{ fontSize: 14 }}>{s.label}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setPlaying(p => !p)} style={{ minHeight: 44, width: '100%', cursor: 'pointer', borderRadius: 10, background: 'transparent', color: '#a9b0c0', border: '1px dashed rgba(255,255,255,0.2)' }}>
            {playing ? 'Pause animation' : 'Play animation'}
          </button>
        </li>
      </ol>

      <section key={active} className="rp-card rp-pane rp-detail" aria-live="polite" style={{ ...card, padding: 20, borderColor: 'rgba(236,19,214,0.35)', background: 'rgba(12,7,20,0.85)' }}>
        <p style={{ ...label, color: '#8892a4', margin: 0 }}>Step {active + 1} of {role.steps.length}: what happens</p>
        <p style={{ margin: '6px 0 16px', color: '#d5dae6', lineHeight: 1.6 }}>{step.happens}</p>
        {item && (
          <>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '0 0 4px', color: ACCENT }}>{item.name}</h3>
            <p style={{ margin: '0 0 12px', color: '#f0f4ff' }}>{item.what}</p>
            <dl style={{ margin: 0, lineHeight: 1.65, color: '#d5dae6' }}>
              <dt style={{ ...label, color: '#8892a4' }}>Why this pick</dt>
              <dd style={{ margin: '2px 0 10px' }}>{item.why}</dd>
              <dt style={{ ...label, color: '#10b981' }}>What the role must know</dt>
              <dd style={{ margin: '2px 0 10px' }}>
                <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc' }}>{item.mustKnow.map(m => <li key={m}>{m}</li>)}</ul>
              </dd>
              <dt style={{ ...label, color: '#f87171' }}>Beginner mistake</dt>
              <dd style={{ margin: '2px 0 0' }}>{item.mistake}</dd>
            </dl>
          </>
        )}
      </section>
    </div>
  )
}

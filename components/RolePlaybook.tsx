'use client'
import { useEffect, useState } from 'react'
import type { Role } from '@/lib/roles'

const STEP_MS = 3600

export default function RolePlaybook({ role }: { role: Role }) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const n = role.steps.length

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setActive(a => (a + 1) % n), STEP_MS)
    return () => clearInterval(t)
  }, [playing, n])

  const step = role.steps[active]
  const item = role.stack.find(s => s.id === step.stackId)

  const pick = (i: number) => {
    setActive(i)
    setPlaying(false)
    try { window.dispatchEvent(new CustomEvent('role_step', { detail: { role: role.slug, step: i } })) } catch {}
  }

  return (
    <div className={`rp${playing ? ' rp-run' : ''}`}>
      <ol className="rp-flow" aria-label="Workflow">
        {role.steps.map((s, i) => (
          <li key={s.stackId} className={`${i <= active ? 'done' : ''} ${i === active ? 'on' : ''}`.trim()}>
            <button type="button" className="rp-node" onClick={() => pick(i)} aria-current={i === active ? 'step' : undefined}>
              <span className="rp-dot" aria-hidden>{i + 1}</span>
              <span className="rp-lab">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="rp-bar" aria-hidden><i key={`${active}-${playing}`} /></div>
      <div className="rp-tools">
        <button type="button" className="rp-play" onClick={() => setPlaying(p => !p)}>{playing ? 'Pause' : 'Play'}</button>
      </div>

      <section key={active} className="rp-detail" aria-live="polite">
        <div>
          <p className="rp-p">{step.happens}</p>
          {item && (
            <>
              <h2 className="rp-name">{item.name}</h2>
              <p className="rp-what">{item.what}</p>
              <p className="rp-k">Why this pick</p>
              <p className="rp-p">{item.why}</p>
            </>
          )}
        </div>
        {item && (
          <div className="rp-col2">
            <p className="rp-k acc">What the role must know</p>
            <ul className="rp-know">
              {item.mustKnow.map(m => (
                <li key={m}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            <p className="rp-k">Beginner mistake</p>
            <div className="rp-warn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
              <span>{item.mistake}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

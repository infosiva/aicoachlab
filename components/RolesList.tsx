'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type Item = { slug: string; title: string; blurb: string; steps: string[]; tools: string[] }

export default function RolesList({ items, children }: { items: Item[]; children?: React.ReactNode }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(items[0]?.slug)
  const ref = useRef<HTMLInputElement>(null)

  // "/" focuses search
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); ref.current?.focus() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items
    return items.filter(i => `${i.title} ${i.blurb} ${i.tools.join(' ')}`.toLowerCase().includes(t))
  }, [q, items])

  const cur = list.find(i => i.slug === sel) ?? list[0]

  return (
    <>
      <div>
        {children}
        <label className="rl-search">
          <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Search roles</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={ref} className="rl-in" type="search" inputMode="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search a role or tool: Kubernetes, SIEM, dbt…" autoComplete="off" />
          <span className="rl-key" aria-hidden>/</span>
        </label>
        <p className="rl-count" aria-live="polite">{list.length} of {items.length} roles</p>
        <ul className="rl-list">
          {list.map((r, i) => (
            <li key={r.slug}>
              <Link
                href={`/roles/${r.slug}`}
                className="rl-row"
                data-sel={cur?.slug === r.slug}
                style={{ ['--i' as string]: i }}
                onPointerEnter={() => setSel(r.slug)}
                onFocus={() => setSel(r.slug)}
              >
                <span className="rl-n">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <h2 className="rl-t">{r.title}</h2>
                  <p className="rl-b">{r.blurb}</p>
                </span>
                <span className="rl-go"><span>{r.steps.length} steps</span><b aria-hidden>→</b></span>
              </Link>
            </li>
          ))}
          {list.length === 0 && <li className="rl-empty">No role matches “{q}”. Try a tool name or clear the search.</li>}
        </ul>
      </div>

      <aside className="rv" aria-label="Role preview">
        {cur && (
          <div className="rv-in" key={cur.slug}>
            <h2 className="rv-t">{cur.title}</h2>
            <p className="rv-s">{cur.blurb}</p>
            <ol className="rv-steps">
              {cur.steps.map((s, i) => (
                <li key={s} style={{ ['--i' as string]: i }}><span>{i + 1}</span>{s}</li>
              ))}
            </ol>
            <ul className="rv-chips">{cur.tools.map(t => <li key={t}>{t}</li>)}</ul>
            <Link href={`/roles/${cur.slug}`} className="rv-cta">Open playbook <span aria-hidden>→</span></Link>
          </div>
        )}
      </aside>
    </>
  )
}

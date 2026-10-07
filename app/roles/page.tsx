import type { Metadata } from 'next'
import Link from 'next/link'
import { ROLES } from '@/lib/roles'

export const metadata: Metadata = {
  title: 'IT Role Playbooks: how the stack fits together | AICoachLab',
  description: 'One realistic scenario per in-demand IT role, with an animated workflow and a plain explanation of every tool in the stack.',
  alternates: { canonical: 'https://aicoachlab.app/roles' },
}

export default function RolesIndex() {
  return (
    <main style={{ minHeight: '100dvh', background: '#0c0714', color: '#f0f4ff', padding: '48px 16px 96px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,6vw,40px)', margin: 0 }}>
          IT role <span style={{ color: '#ec13d6' }}>playbooks</span>
        </h1>
        <p style={{ color: '#a9b0c0', margin: '12px 0 32px' }}>
          See how a real project flows through the stack, step by step, then practise explaining it.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          {ROLES.map(r => (
            <Link key={r.slug} href={`/roles/${r.slug}`} style={{
              display: 'block', padding: 20, borderRadius: 14, textDecoration: 'none', color: 'inherit',
              background: 'rgba(236,19,214,0.06)', border: '1px solid rgba(236,19,214,0.28)',
            }}>
              <strong style={{ fontSize: 18 }}>{r.title}</strong>
              <p style={{ color: '#a9b0c0', margin: '6px 0 0', fontSize: 14 }}>{r.blurb}</p>
              <p style={{ color: '#8892a4', margin: '10px 0 0', fontSize: 12 }}>{r.steps.length} steps · {r.stack.length} stack pieces · as of {r.asOf}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

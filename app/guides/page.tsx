import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'AI Tooling Interview Guides | AICoachLab',
  description: 'Learn the AI tooling landscape and how to answer interview questions about it with trade-offs, not buzzwords.',
  alternates: { canonical: 'https://aicoachlab.app/guides' },
}

export default function GuidesIndex() {
  return (
    <main style={{ minHeight: '100dvh', background: '#0c0714', color: '#f0f4ff', padding: '48px 16px 96px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,6vw,40px)', margin: 0 }}>
          AI tooling <span style={{ color: '#ec13d6' }}>interview guides</span>
        </h1>
        <p style={{ color: '#a9b0c0', margin: '12px 0 32px' }}>
          Know the tools, then answer with a claim, a trade-off, evidence and a fallback.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          {GUIDES.map(g => (
            <Link key={g.slug} href={`/guides/${g.slug}`} style={{
              display: 'block', padding: 20, borderRadius: 14, textDecoration: 'none', color: 'inherit',
              background: 'rgba(236,19,214,0.06)', border: '1px solid rgba(236,19,214,0.28)',
            }}>
              <strong style={{ fontSize: 18 }}>{g.title}</strong>
              <p style={{ color: '#a9b0c0', margin: '6px 0 0', fontSize: 14 }}>{g.description}</p>
              <p style={{ color: '#8892a4', margin: '10px 0 0', fontSize: 12 }}>
                {g.layers.length} layers · {g.layers.reduce((n, l) => n + l.questions.length, 0)} questions · as of {g.asOf}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

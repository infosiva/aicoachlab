import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDES, getGuide } from '@/lib/guides'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => GUIDES.map(g => ({ slug: g.slug }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide((await params).slug)
  if (!g) return {}
  return {
    title: `${g.title}: interview questions and answers | AICoachLab`,
    description: g.description,
    alternates: { canonical: `https://aicoachlab.app/guides/${g.slug}` },
  }
}

const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12 } as const

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug)
  if (!g) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: g.layers.flatMap(l => l.questions).map(q => ({
      '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  }

  return (
    <main style={{ minHeight: '100dvh', background: '#0c0714', color: '#f0f4ff', padding: '40px 16px 96px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/guides" style={{ color: '#a9b0c0', fontSize: 14 }}>← All guides</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,6vw,40px)', margin: '16px 0 8px' }}>{g.title}</h1>
        <p style={{ color: '#a9b0c0', margin: 0 }}>{g.description}</p>
        <p style={{ color: '#8892a4', fontSize: 12, margin: '8px 0 24px' }}>
          Source: {g.source}. Tool landscape as of {g.asOf}; check current versions before an interview.
        </p>

        <section style={{ ...card, padding: 20, borderColor: 'rgba(236,19,214,0.35)' }}>
          <h2 style={{ fontSize: 16, margin: '0 0 8px', color: '#ec13d6' }}>How to answer anything here</h2>
          <ol style={{ margin: 0, paddingLeft: 20, listStyle: 'decimal', color: '#d5dae6', lineHeight: 1.7 }}>
            {g.framework.map(f => <li key={f}>{f}</li>)}
          </ol>
        </section>

        <nav aria-label="Layers" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '24px 0' }}>
          {g.layers.map(l => (
            <a key={l.slug} href={`#${l.slug}`} style={{
              padding: '10px 14px', minHeight: 44, display: 'inline-flex', alignItems: 'center',
              borderRadius: 99, fontSize: 13, color: '#f0f4ff', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>{l.title}</a>
          ))}
        </nav>

        {g.layers.map((l, i) => (
          <section key={l.slug} id={l.slug} style={{ marginBottom: 40, scrollMarginTop: 16 }}>
            <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>{i + 1}. {l.title}</h2>
            <p style={{ color: '#a9b0c0', margin: '0 0 12px' }}>{l.blurb}</p>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
              {l.tools.map(t => (
                <li key={t.name} title={t.note} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'rgba(236,19,214,0.12)', color: '#f5c6f0' }}>
                  {t.name}
                </li>
              ))}
            </ul>
            <div style={{ display: 'grid', gap: 10 }}>
              {l.questions.map(q => (
                <details key={q.q} style={{ ...card, padding: '14px 16px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, minHeight: 44, display: 'flex', alignItems: 'center' }}>{q.q}</summary>
                  <dl style={{ margin: '8px 0 0', lineHeight: 1.65, color: '#d5dae6' }}>
                    <dt style={{ color: '#8892a4', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>What they are testing</dt>
                    <dd style={{ margin: '2px 0 10px' }}>{q.testing}</dd>
                    <dt style={{ color: '#10b981', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>A strong answer</dt>
                    <dd style={{ margin: '2px 0 10px' }}>{q.answer}</dd>
                    <dt style={{ color: '#f87171', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Red flag</dt>
                    <dd style={{ margin: '2px 0 0' }}>{q.redFlag}</dd>
                  </dl>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

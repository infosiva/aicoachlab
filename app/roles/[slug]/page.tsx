import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ROLES, getRole } from '@/lib/roles'
import RolePlaybook from '@/components/RolePlaybook'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => ROLES.map(r => ({ slug: r.slug }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRole((await params).slug)
  if (!r) return {}
  return {
    title: `${r.title}: real-world scenario and stack | AICoachLab`,
    description: `${r.blurb} Walk through "${r.scenario.title}" step by step.`,
    alternates: { canonical: `https://aicoachlab.app/roles/${r.slug}` },
  }
}

export default async function RolePage({ params }: Props) {
  const r = getRole((await params).slug)
  if (!r) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: r.stack.map(s => ({
      '@type': 'Question',
      name: `What is ${s.name} and why does a ${r.title} use it?`,
      acceptedAnswer: { '@type': 'Answer', text: `${s.what} ${s.why}` },
    })),
  }

  return (
    <main style={{ minHeight: '100dvh', background: '#0c0714', color: '#f0f4ff', padding: '24px 16px 96px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/roles" style={{ color: '#a9b0c0', fontSize: 14 }}>← All roles</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,5vw,34px)', margin: '8px 0 4px' }}>{r.title}</h1>
        <p style={{ color: '#d5dae6', margin: 0 }}><strong>{r.scenario.title}.</strong> {r.scenario.story}</p>
        <details style={{ margin: '10px 0 16px', color: '#8892a4', fontSize: 12 }}>
          <summary style={{ cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}>Why this role (sources) · tools as of {r.asOf}</summary>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {r.demand.map(d => <li key={d.url}>{d.claim} <a href={d.url} rel="noopener noreferrer" target="_blank" style={{ color: '#ec13d6' }}>{d.source}</a></li>)}
          </ul>
        </details>
        <RolePlaybook role={r} />
      </div>
    </main>
  )
}

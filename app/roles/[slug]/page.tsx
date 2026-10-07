import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ROLES, getRole } from '@/lib/roles'
import RolePlaybook from '@/components/RolePlaybook'
import RolesNav from '@/components/RolesNav'
import '@/components/roles.css'

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
    <main className="r-root">
      <div className="r-aurora" aria-hidden />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <RolesNav current="roles" />
      <div className="rg-wrap">
        <nav className="rg-crumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/roles">Roles</Link></li>
            <li aria-current="page">{r.title}</li>
          </ol>
        </nav>
        <h1 className="rg-h1">{r.title}</h1>
        <p className="rg-scn"><strong>{r.scenario.title}.</strong> {r.scenario.story}</p>
        <details className="rg-src">
          <summary>Sources, tools as of {r.asOf}</summary>
          <ul>
            {r.demand.map(d => <li key={d.url}>{d.claim} <a href={d.url} rel="noopener noreferrer" target="_blank">{d.source}</a></li>)}
          </ul>
        </details>
        <RolePlaybook role={r} />
      </div>
    </main>
  )
}

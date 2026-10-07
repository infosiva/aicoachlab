import type { Metadata } from 'next'
import { ROLES } from '@/lib/roles'
import RolesNav from '@/components/RolesNav'
import RolesList from '@/components/RolesList'
import '@/components/roles.css'

export const metadata: Metadata = {
  title: 'IT Role Playbooks: how the stack fits together | AICoachLab',
  description: 'Pick an IT role and watch one real project flow through its stack, step by step, with what the role must know about each tool.',
  alternates: { canonical: 'https://aicoachlab.app/roles' },
}

const items = ROLES.map(r => ({
  slug: r.slug,
  title: r.title,
  blurb: r.blurb,
  steps: r.steps.map(s => s.label),
  tools: r.stack.map(s => s.name),
}))

export default function RolesIndex() {
  return (
    <main className="r-root">
      <div className="r-aurora" aria-hidden />
      <RolesNav current="roles" />
      <div className="ri-wrap">
        <RolesList items={items}>
          <h1 className="ri-h1">IT role <em>playbooks</em></h1>
          <p className="ri-sub">Pick a role. Watch one real project flow through its stack, step by step.</p>
        </RolesList>
      </div>
    </main>
  )
}

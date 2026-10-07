import Link from 'next/link'

// Sticky top bar for /roles pages: always a way back home. Styles live in roles.css.
export default function RolesNav({ current }: { current?: string }) {
  return (
    <header className="rn">
      <Link href="/" className="brand" aria-label="AICoachLab home">AI<b>Coach</b>Lab</Link>
      <nav aria-label="Primary" style={{ display: 'flex', gap: 4 }}>
        <Link href="/">Home</Link>
        <Link href="/roles" aria-current={current === 'roles' ? 'page' : undefined}>Roles</Link>
      </nav>
    </header>
  )
}

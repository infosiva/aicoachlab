export const metadata = { title: 'Terms of Use', alternates: { canonical: '/terms' } }

const h2 = { fontSize: 20, fontWeight: 700, marginTop: 32 } as const
const link = { color: '#e810d4' } as const

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', lineHeight: 1.7, color: '#f0f4ff', background: '#0a0612', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Terms of Use</h1>
      <p style={{ color: '#a5b4fc', marginBottom: 40 }}>Last updated: October 2026</p>

      <h2 style={h2}>Using AICoachLab</h2>
      <p>AICoachLab is an educational site about IT roles and AI skills. Use it for personal learning. Do not scrape it at scale or try to disrupt it.</p>

      <h2 style={h2}>Content is for learning</h2>
      <p>Role playbooks, tools and examples are general guidance as of the date shown on each page. They are not career, professional or legal advice, and tools change. Check current vendor documentation before relying on them.</p>

      <h2 style={h2}>No warranty</h2>
      <p>The service is provided as is, without warranties. To the extent the law allows, we are not liable for losses from using it.</p>

      <h2 style={h2}>Third-party links and ads</h2>
      <p>We link to third-party sites and show ads. We do not control those sites. See the <a href="/privacy" style={link}>Privacy Policy</a> for how data is handled.</p>
    </main>
  )
}

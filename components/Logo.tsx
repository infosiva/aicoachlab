export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="AICoachLab">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#150d22" />
        <path d="M14 12h36a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H32l-10 9v-9h-8a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" fill="#ec13d6" />
        <rect x="19" y="30" width="5" height="9" rx="2.5" fill="#0c0714" />
        <rect x="29.5" y="22" width="5" height="17" rx="2.5" fill="#0c0714" />
        <rect x="40" y="26" width="5" height="13" rx="2.5" fill="#0c0714" />
      </svg>
      <span className="font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        AI<span style={{ color: 'var(--accent)' }}>Coach</span>Lab
      </span>
    </span>
  )
}

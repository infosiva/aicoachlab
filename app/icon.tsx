import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #c2410c, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="1.5" fill="white" />
      </svg>
    </div>
  )
}

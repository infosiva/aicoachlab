import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: '#0c0714', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 120, height: 96, background: '#ec13d6', borderRadius: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, paddingBottom: 22 }}>
          <div style={{ width: 14, height: 26, background: '#0c0714', borderRadius: 7 }} />
          <div style={{ width: 14, height: 46, background: '#0c0714', borderRadius: 7 }} />
          <div style={{ width: 14, height: 36, background: '#0c0714', borderRadius: 7 }} />
        </div>
      </div>
    ),
    size,
  )
}

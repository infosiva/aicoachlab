'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BG = 'rgba(12,7,20,0.98)'
const BORDER = 'rgba(236,19,214,0.35)'
const BOTTOM_OFFSET = 84

type M = { role: 'user' | 'bot'; text: string }

export default function FloatingChatWrapper() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msgs, setMsgs] = useState<M[]>([
    { role: 'bot', text: 'Which role are you interviewing for? Ask me anything about prep.' },
  ])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const next: M[] = [...msgs, { role: 'user', text }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(1).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
        }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.message || 'Please try again in a moment.' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Please try again in a moment.' }])
    } finally { setBusy(false) }
  }

  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
    width: '100%', height: `calc(100dvh - ${BOTTOM_OFFSET}px)`,
    borderRadius: '16px 16px 0 0', background: BG, border: `1px solid ${BORDER}`,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  } : {
    position: 'fixed', bottom: 88, right: 24, zIndex: 9998,
    width: 340, height: 440, borderRadius: 16, background: BG, border: `1px solid ${BORDER}`,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close AICoachLab chat' : 'Open AICoachLab chat'}
        aria-expanded={open}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#ec13d6,#a30d94)', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(236,19,214,0.4)', zIndex: 9999,
          color: '#0c0714', fontSize: 20, fontWeight: 800 }}>
        {open ? '×' : '?'}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-label="AICoachLab chat" style={panelStyle}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.2 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 700, color: '#f6effc', flexShrink: 0 }}>
              AICoachLab assistant
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'rgba(236,19,214,0.28)' : 'rgba(255,255,255,0.07)',
                  padding: '8px 12px', borderRadius: 10, fontSize: 13, color: '#f6effc', maxWidth: '85%' }}>
                  {m.text}
                </div>
              ))}
              {busy && <div style={{ fontSize: 12, color: '#a193b8' }}>Thinking...</div>}
              <div ref={endRef} />
            </div>
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                aria-label="Message" placeholder="Ask about interview prep..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: '8px 10px', fontSize: 16, color: '#f6effc', outline: 'none', minHeight: 44 }} />
              <button onClick={send} aria-label="Send" disabled={busy}
                style={{ background: '#ec13d6', border: 'none', borderRadius: 8, minWidth: 44, minHeight: 44, fontSize: 16, fontWeight: 700, color: '#0c0714', cursor: 'pointer' }}>
                {'→'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

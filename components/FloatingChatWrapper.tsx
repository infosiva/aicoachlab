'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BG = 'rgba(8,8,20,0.97)'
const BORDER = 'rgba(249,115,22,0.35)'
const BOTTOM_OFFSET = 84

export default function FloatingChatWrapper() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Which track are you on — RAG, MCP, LangGraph, or AI agents? I'll help you build the next thing." },
  ])
  const [input, setInput] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send() {
    if (!input.trim()) return
    const userMsg = input
    setMsgs(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMsg }] }) })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.text || 'Happy to help!' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Try again in a moment!' }])
    }
  }

  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
    width: '100%', height: `calc(100dvh - ${BOTTOM_OFFSET}px)`,
    borderRadius: '16px 16px 0 0',
    background: BG,
    border: `1px solid ${BORDER}`,
    boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'aicoach-slide-bottom 0.3s cubic-bezier(0.23,1,0.32,1)',
  } : {
    position: 'fixed', bottom: 88, right: 24, zIndex: 9998,
    width: 320, height: 420, borderRadius: 16,
    background: BG,
    border: `1px solid ${BORDER}`,
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    animation: 'aicoach-slide-up 0.22s ease-out',
  }

  return (
    <>
      <style>{`
        @keyframes aicoach-slide-bottom {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes aicoach-slide-up {
          from { transform: translateY(12px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aicoach-panel { animation: none !important; }
        }
      `}</style>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        aria-label="Open AICoachLab AI chat"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: '0 4px 20px rgba(249,115,22,0.35)', zIndex: 9999, fontSize: 20 }}>
        {open ? '✕' : '🎯'}
      </motion.button>
      <AnimatePresence>
        {open && (
          <div className="aicoach-panel" style={panelStyle}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 700, color: '#f8fafc', flexShrink: 0 }}>
              AICoachLab AI
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.06)',
                  padding: '8px 12px', borderRadius: 10, fontSize: 12, color: 'rgba(248,250,252,0.9)', maxWidth: '85%' }}>
                  {m.text}
                </div>
              ))}
              <div ref={msgsEndRef} />
            </div>
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about coaching or your goals..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: '6px 10px', fontSize: isMobile ? 16 : 13.5, color: '#f8fafc', outline: 'none' }} />
              <button onClick={send} style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#fff', cursor: 'pointer' }}>→</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

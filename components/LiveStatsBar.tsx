'use client'
import { useEffect, useState } from 'react'

interface Stats { sessionsStarted: number; questionsAnswered: number; tracksCompleted: number }

export default function LiveStatsBar() {
  const [stats, setStats] = useState<Stats>({ sessionsStarted: 0, questionsAnswered: 0, tracksCompleted: 0 })

  useEffect(() => {
    fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
    const t = setInterval(() => {
      fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  if (stats.sessionsStarted === 0 && stats.questionsAnswered === 0 && stats.tracksCompleted === 0) return null

  const items = [
    { label: 'Sessions started', value: stats.sessionsStarted },
    { label: 'Questions answered', value: stats.questionsAnswered },
    { label: 'Tracks completed', value: stats.tracksCompleted },
  ].filter(i => i.value > 0)

  return (
    <div className="border-y py-3 px-5" style={{ background: 'var(--surface-2, #fff7ed)', borderColor: 'var(--border, #fed7aa)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 flex-wrap">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[18px] font-black tabular-nums" style={{ color: 'var(--accent, #ea580c)' }}>
              {item.value.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">{item.label} this session</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface STARStatus {
  situation: boolean
  task: boolean
  action: boolean
  result: boolean
  score: number
  missing: string[]
  tips: string[]
}

const SIGNALS = {
  situation: ['when', 'at', 'working at', 'our team', 'the company', 'last year', 'project', 'challenge', 'we were', 'i was'],
  task: ['my role', 'responsible for', 'tasked with', 'needed to', 'had to', 'my job', 'my goal', 'objective'],
  action: ['i did', 'i built', 'i implemented', 'i led', 'i created', 'i worked', 'i designed', 'specifically', 'i decided', 'i chose'],
  result: ['result', 'outcome', 'impact', 'increased', 'decreased', 'reduced', 'improved', 'saved', '%', 'revenue', 'users', 'shipped'],
}

export function trackSTAR(transcript: string): STARStatus {
  const lower = transcript.toLowerCase()
  const found = {
    situation: SIGNALS.situation.some(s => lower.includes(s)),
    task: SIGNALS.task.some(s => lower.includes(s)),
    action: SIGNALS.action.some(s => lower.includes(s)),
    result: SIGNALS.result.some(s => lower.includes(s)),
  }

  const missing: string[] = []
  const tips: string[] = []

  if (!found.situation) { missing.push('Situation'); tips.push('Set the scene — when/where did this happen?') }
  if (!found.task) { missing.push('Task'); tips.push('Clarify your specific role or responsibility') }
  if (!found.action) { missing.push('Action'); tips.push('Say what YOU specifically did, not "we"') }
  if (!found.result) { missing.push('Result'); tips.push('Add a metric — numbers make results real') }

  const completed = Object.values(found).filter(Boolean).length
  return { ...found, score: completed * 25, missing, tips }
}

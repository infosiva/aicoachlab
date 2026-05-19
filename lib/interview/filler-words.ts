export const FILLERS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'actually', 'so', 'right', 'okay', 'kind of', 'sort of',
  'I mean', 'just', 'very', 'really', 'thing', 'stuff',
]

export interface FillerResult {
  count: number
  words: { word: string; count: number }[]
  rate: number
  highlighted: string
}

export function analyseFillers(transcript: string): FillerResult {
  const totalWords = transcript.split(/\s+/).filter(Boolean).length
  const counts: Record<string, number> = {}

  for (const filler of FILLERS) {
    const re = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = transcript.match(re)
    if (matches && matches.length > 0) counts[filler] = matches.length
  }

  let highlighted = transcript
  for (const filler of FILLERS) {
    const re = new RegExp(`\\b(${filler})\\b`, 'gi')
    highlighted = highlighted.replace(re, '<mark style="background:rgba(239,68,68,0.3);border-radius:3px;padding:0 2px">$1</mark>')
  }

  const totalFillers = Object.values(counts).reduce((a, b) => a + b, 0)
  const words = Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)

  return {
    count: totalFillers,
    words,
    rate: totalWords > 0 ? Math.round((totalFillers / totalWords) * 100) : 0,
    highlighted,
  }
}

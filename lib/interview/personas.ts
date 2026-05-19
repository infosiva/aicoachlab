export interface Persona {
  id: string
  name: string
  title: string
  style: 'robotic' | 'human-warm' | 'human-direct' | 'human-nervous'
  systemPrompt: string
  voiceRate: number
  voicePitch: number
  hesitations: string[]
  isHuman: boolean
}

export const PERSONAS: Persona[] = [
  {
    id: 'alex-human',
    name: 'Alex',
    title: 'Senior Engineer @ Scale AI',
    style: 'human-warm',
    systemPrompt: 'You are Alex, a senior engineer conducting a technical interview. Be warm but thorough. Ask follow-up questions. Occasionally say "interesting" or "tell me more". Sound human.',
    voiceRate: 0.95,
    voicePitch: 1.0,
    hesitations: ['So...', 'Hmm, interesting.', 'Right, right.', 'Got it.'],
    isHuman: true,
  },
  {
    id: 'sigma-bot',
    name: 'Sigma',
    title: 'AI Interviewer',
    style: 'robotic',
    systemPrompt: 'You are Sigma, an AI conducting a structured technical interview. Be precise, systematic, and objective. Evaluate answers methodically. Keep responses concise and professional.',
    voiceRate: 0.88,
    voicePitch: 0.82,
    hesitations: [],
    isHuman: false,
  },
  {
    id: 'priya-human',
    name: 'Priya',
    title: 'Staff PM @ Google',
    style: 'human-direct',
    systemPrompt: "You are Priya, a staff PM who interviews directly. You ask sharp follow-ups and don't let vague answers slide. Occasionally challenge the candidate.",
    voiceRate: 1.0,
    voicePitch: 1.05,
    hesitations: ['Okay, but...', 'Walk me through that.', 'Why specifically?'],
    isHuman: true,
  },
  {
    id: 'nova-bot',
    name: 'Nova',
    title: 'Neural Interviewer v2',
    style: 'robotic',
    systemPrompt: 'You are Nova, an advanced AI interviewer. You ask structured questions, evaluate against rubrics, and give systematic feedback. Be precise and analytical.',
    voiceRate: 0.85,
    voicePitch: 0.78,
    hesitations: [],
    isHuman: false,
  },
]

export function getRandomPersona(): Persona {
  return PERSONAS[Math.floor(Math.random() * PERSONAS.length)]
}

export function speakWithPersona(text: string, persona: Persona): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance()
  utt.rate = persona.voiceRate
  utt.pitch = persona.voicePitch
  if (persona.isHuman && persona.hesitations.length > 0 && Math.random() > 0.6) {
    const h = persona.hesitations[Math.floor(Math.random() * persona.hesitations.length)]
    utt.text = `${h} ${text}`
  } else {
    utt.text = text
  }
  return utt
}

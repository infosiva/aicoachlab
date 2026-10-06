import { AI_CODING_ECOSYSTEM, type Guide } from './ai-coding-ecosystem'

export type { Guide, GuideLayer, GuideQuestion } from './ai-coding-ecosystem'

// Add each new pasted reference here as it becomes a guide.
export const GUIDES: Guide[] = [AI_CODING_ECOSYSTEM]

export const getGuide = (slug: string) => GUIDES.find(g => g.slug === slug)

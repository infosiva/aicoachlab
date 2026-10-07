import { AI_ENGINEER } from './ai-engineer'
import { FORWARD_DEPLOYED_ENGINEER } from './forward-deployed-engineer'
import type { Role } from './types'

export type { Role, StackItem, WorkflowStep } from './types'

// Add roles 3-6 (Data Engineer, ML/MLOps, Cybersecurity, DevOps) after the 2-role test (HANDOFF section 2).
export const ROLES: Role[] = [AI_ENGINEER, FORWARD_DEPLOYED_ENGINEER]

export const getRole = (slug: string) => ROLES.find(r => r.slug === slug)

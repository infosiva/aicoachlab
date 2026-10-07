import { AI_ENGINEER } from './ai-engineer'
import { FORWARD_DEPLOYED_ENGINEER } from './forward-deployed-engineer'
import { DATA_ENGINEER } from './data-engineer'
import { ML_MLOPS_ENGINEER } from './ml-mlops-engineer'
import { CYBERSECURITY_ENGINEER } from './cybersecurity-engineer'
import { DEVOPS_PLATFORM_ENGINEER } from './devops-platform-engineer'
import type { Role } from './types'

export type { Role, StackItem, WorkflowStep } from './types'

export const ROLES: Role[] = [
  AI_ENGINEER,
  FORWARD_DEPLOYED_ENGINEER,
  DATA_ENGINEER,
  ML_MLOPS_ENGINEER,
  CYBERSECURITY_ENGINEER,
  DEVOPS_PLATFORM_ENGINEER,
]

export const getRole = (slug: string) => ROLES.find(r => r.slug === slug)

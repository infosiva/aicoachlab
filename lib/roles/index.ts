import type { Role } from './types'
import { AI_ENGINEER } from './ai-engineer'
import { FORWARD_DEPLOYED_ENGINEER } from './forward-deployed-engineer'
import { DATA_ENGINEER } from './data-engineer'
import { ML_MLOPS_ENGINEER } from './ml-mlops-engineer'
import { CYBERSECURITY_ENGINEER } from './cybersecurity-engineer'
import { DEVOPS_PLATFORM_ENGINEER } from './devops-platform-engineer'
import { FRONTEND_ENGINEER } from './frontend-engineer'
import { BACKEND_ENGINEER } from './backend-engineer'
import { QA_SDET_ENGINEER } from './qa-sdet-engineer'
import { MOBILE_ENGINEER } from './mobile-engineer'
import { SRE } from './sre'
import { CLOUD_ARCHITECT } from './cloud-architect'
import { DATABASE_ENGINEER } from './database-engineer'
import { APPSEC_ENGINEER } from './appsec-engineer'
import { DATA_SCIENTIST } from './data-scientist'
import { DATA_ANALYST } from './data-analyst'
import { NETWORK_ENGINEER } from './network-engineer'
import { TECHNICAL_PM } from './technical-pm'

export type { Role } from './types'

export const ROLES: Role[] = [
  AI_ENGINEER, FORWARD_DEPLOYED_ENGINEER, DATA_ENGINEER, ML_MLOPS_ENGINEER, CYBERSECURITY_ENGINEER, DEVOPS_PLATFORM_ENGINEER,
  FRONTEND_ENGINEER, BACKEND_ENGINEER, QA_SDET_ENGINEER, MOBILE_ENGINEER, SRE, CLOUD_ARCHITECT,
  DATABASE_ENGINEER, APPSEC_ENGINEER, DATA_SCIENTIST, DATA_ANALYST, NETWORK_ENGINEER, TECHNICAL_PM,
]

export const getRole = (slug: string) => ROLES.find(r => r.slug === slug)

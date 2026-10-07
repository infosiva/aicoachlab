// Role Playbooks data model. Evidence: agents/docs/startup/demand-2026-10-07-it-roles.md
// No salaries, hiring stats or "asked at Company X" in content; demand lines carry a source link.

export interface StackItem {
  id: string
  name: string
  what: string // one sentence: what it is
  why: string // why this scenario picks it
  mustKnow: string[] // what the role must know about it (2-4 bullets)
  mistake: string // typical beginner mistake
}

export interface WorkflowStep {
  stackId: string
  label: string // short node label
  happens: string // what happens at this point of the scenario
}

export interface Role {
  slug: string
  title: string
  blurb: string
  asOf: string
  demand: { claim: string; source: string; url: string }[]
  scenario: { title: string; story: string }
  steps: WorkflowStep[]
  stack: StackItem[]
}

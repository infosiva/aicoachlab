import type { Role } from './types'

export const TECHNICAL_PM: Role = {
  slug: 'technical-product-manager',
  title: 'Technical Product Manager',
  blurb: 'Owns what gets built for a technical product and why, working closely with engineers on APIs, platforms and trade-offs.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Launching a public API for a payments product',
    story:
      'A company wants to let partners create payments through a public API instead of a manual dashboard. You define what the first version must do, agree the contract with engineering, and run the launch so partners can integrate without a support call.',
  },
  steps: [
    { stackId: 'discovery', label: 'Understand partners', happens: 'Interview partner developers and read their support tickets to find the integration that hurts most today.' },
    { stackId: 'requirements', label: 'Write the spec', happens: 'Write a short document with the problem, scope, non-goals, success metrics and open questions.' },
    { stackId: 'api', label: 'Agree the API contract', happens: 'Review endpoints, authentication, error formats and versioning with engineers before any code is written.' },
    { stackId: 'delivery', label: 'Plan and unblock', happens: 'Break the work into milestones with engineering, track dependencies and cut scope when risk grows.' },
    { stackId: 'metrics', label: 'Instrument and measure', happens: 'Track time to first successful call, error rates and weekly active integrations from day one.' },
    { stackId: 'launch', label: 'Launch and iterate', happens: 'Release to a few partners first, publish docs and a changelog, then fix what their feedback shows.' },
  ],
  stack: [
    {
      id: 'discovery', name: 'Customer and developer discovery',
      what: 'Talking to the people who use your product and reading their tickets to find real problems.',
      why: 'For an API the customer is a developer, so you learn most from watching one try to integrate.',
      mustKnow: ['Ask about past behaviour, not hypothetical wishes', 'Combine interviews with support and usage data', 'Separate the problem a partner states from the solution they suggest'],
      mistake: 'Building the feature the loudest partner asked for without checking whether others need it.',
    },
    {
      id: 'requirements', name: 'Specs, prioritisation and roadmap',
      what: 'Written product requirements and a ranked list of work with clear scope and non-goals.',
      why: 'A clear spec lets engineers make good decisions without asking you every hour.',
      mustKnow: ['State the problem and success metric before the solution', 'Use a simple framework such as impact versus effort to rank work', 'List non-goals explicitly'],
      mistake: 'Writing a long spec of features without saying what is not included in version one.',
    },
    {
      id: 'api', name: 'APIs, system design and technical literacy',
      what: 'Enough understanding of REST, authentication, webhooks, rate limits and data models to discuss design with engineers.',
      why: 'API decisions are hard to change once partners depend on them, so you must weigh the trade-offs early.',
      mustKnow: ['Read an OpenAPI spec and an example request and response', 'Why versioning and backward compatibility matter', 'Idempotency, pagination and error design for payments-style calls'],
      mistake: 'Approving a breaking change to a live endpoint without a deprecation plan.',
    },
    {
      id: 'delivery', name: 'Agile delivery and stakeholder management',
      what: 'Working in sprints or similar cycles with engineering, design, legal, support and sales.',
      why: 'A payments API touches compliance and support, and the launch slips when those teams hear late.',
      mustKnow: ['Run planning and refine the backlog with the team', 'Raise risks and dependencies early', 'Say no clearly and explain the trade-off'],
      mistake: 'Adding scope mid-sprint without removing something.',
    },
    {
      id: 'metrics', name: 'Product analytics and metrics',
      what: 'Measuring usage and outcomes with SQL, event analytics tools and dashboards.',
      why: 'Without numbers you cannot tell whether partners succeed or simply stop trying.',
      mustKnow: ['Pick one primary success metric and a few guardrails', 'Read a funnel such as signup, first call and first live payment', 'Write simple SQL queries yourself'],
      mistake: 'Tracking sign-ups only, so a high drop-off before the first successful call stays hidden.',
    },
    {
      id: 'launch', name: 'Launch, documentation and developer experience',
      what: 'Docs, sandbox, changelog and a staged release that make integrating easy.',
      why: 'For developer products the docs are part of the product, and a bad first hour loses the partner.',
      mustKnow: ['Quickstart that gets a first call working in minutes', 'Staged rollout with a few friendly partners first', 'Publish a changelog and communicate deprecations early'],
      mistake: 'Launching to everyone at once with docs that were never tested by someone outside the team.',
    },
  ],
}

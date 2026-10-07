import type { Role } from './types'

export const QA_SDET_ENGINEER: Role = {
  slug: 'qa-sdet-engineer',
  title: 'QA / SDET Engineer',
  blurb: 'Builds the automated tests and quality checks that let a team release often without breaking what already works.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Release safety net for a web app with a checkout flow',
    story:
      'A team ships weekly, but each release needs two days of manual testing and bugs still reach customers. You build an automated suite that covers the checkout flow and API, runs on every pull request, and tells the team clearly when a release is safe.',
  },
  steps: [
    { stackId: 'strategy', label: 'Plan the strategy', happens: 'List the risks, decide what is tested at unit, API and UI level, and agree what must pass before release.' },
    { stackId: 'e2e', label: 'UI tests', happens: 'Write a few stable end-to-end tests for sign-up and checkout using Playwright.' },
    { stackId: 'api-test', label: 'API tests', happens: 'Test the order and payment endpoints directly, including bad input and error cases.' },
    { stackId: 'data', label: 'Test data', happens: 'Create each test\'s own data through the API or a seeded database, and clean up afterwards.' },
    { stackId: 'ci', label: 'Run in CI', happens: 'Run the suite on every pull request in parallel, keep the traces, and block merges on failures.' },
    { stackId: 'flaky', label: 'Keep it healthy', happens: 'Track failing and flaky tests, fix root causes and report quality trends to the team.' },
  ],
  stack: [
    {
      id: 'strategy', name: 'Test strategy and the test pyramid',
      what: 'The plan for what to test at which level: many fast unit tests, fewer API tests and a small number of UI tests.',
      why: 'Putting every check in slow UI tests makes the suite flaky and too slow to run on every change.',
      mustKnow: ['Test by risk: money, auth and data loss first', 'Push checks down to the cheapest level that catches the bug', 'Define what "done" means for a release'],
      mistake: 'Automating every manual test case as a UI test and ending up with a slow, brittle suite.',
    },
    {
      id: 'e2e', name: 'End-to-end testing (Playwright)',
      what: 'Browser automation that drives the real app the way a user does, for example with Playwright.',
      why: 'Checkout is the flow that must never break, so a few real-browser tests guard it.',
      mustKnow: ['Select elements by role, label or test id, not fragile CSS paths', 'Rely on auto-waiting instead of fixed sleeps', 'Use traces and screenshots to debug failures'],
      mistake: 'Adding sleep calls to fix timing instead of waiting for the actual condition.',
    },
    {
      id: 'api-test', name: 'API and contract testing',
      what: 'Tests that call endpoints directly with a tool or library, plus contract checks that the response shape does not change.',
      why: 'API tests are faster and steadier than UI tests and cover error cases the UI never triggers.',
      mustKnow: ['Check status codes, bodies and error messages', 'Test auth and permission failures', 'Validate responses against the OpenAPI schema'],
      mistake: 'Only testing the happy path and never sending invalid or unauthorised requests.',
    },
    {
      id: 'data', name: 'Test data and environments',
      what: 'How tests get their data and where they run: factories, seeded databases, containers and isolated environments.',
      why: 'Tests that share data or depend on leftover state fail randomly and hide real bugs.',
      mustKnow: ['Each test creates and owns its data', 'Use containers or ephemeral environments for isolation', 'Never run tests against production data'],
      mistake: 'Having tests depend on a shared account that another test might change.',
    },
    {
      id: 'ci', name: 'CI integration and parallel runs',
      what: 'Running the suite automatically on every pull request in a pipeline such as GitHub Actions, in parallel and with saved reports.',
      why: 'A suite nobody runs automatically protects nothing, and slow feedback gets ignored.',
      mustKnow: ['Shard tests to keep feedback under a few minutes', 'Save traces, videos and reports as artifacts', 'Make failing tests block the merge'],
      mistake: 'Letting a red build be re-run until it goes green without looking at why.',
    },
    {
      id: 'flaky', name: 'Flaky tests, coverage and quality metrics',
      what: 'Finding tests that pass and fail without code changes, and tracking coverage and escaped bugs as quality signals.',
      why: 'Once the team stops trusting the suite, they stop reading its failures.',
      mustKnow: ['Quarantine a flaky test, then fix the cause quickly', 'Coverage shows what is untested, not what is well tested', 'Track bugs found in production as the real quality signal'],
      mistake: 'Chasing a coverage percentage with tests that assert nothing meaningful.',
    },
  ],
}

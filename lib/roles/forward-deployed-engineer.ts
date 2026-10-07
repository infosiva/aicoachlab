import type { Role } from './types'

export const FORWARD_DEPLOYED_ENGINEER: Role = {
  slug: 'forward-deployed-engineer',
  title: 'Forward Deployed Engineer',
  blurb: 'Embeds with a customer, turns their messy workflow into a working AI integration, and owns it in production.',
  asOf: '2026-10',
  demand: [
    {
      claim: 'FDE job postings rose more than 1000% between January and August 2026 versus the same period a year earlier (from a small base).',
      source: 'Fortune citing Lightcast, 2026-09-03',
      url: 'https://fortune.com/2026/09/03/forward-deployed-engineers-fast-growing-six-figure-silicon-valley-job-integrate-ai-with-customers-tech-careers-palantir/',
    },
  ],
  scenario: {
    title: 'Automating invoice intake for a mid-size logistics customer',
    story:
      'The customer receives 800 supplier invoices a week by email as PDFs and keys them into an ERP by hand. In three weeks on site you ship an extraction pipeline with human review, then hand it over with a runbook.',
  },
  steps: [
    { stackId: 'discovery', label: 'Discover', happens: 'Sit with the AP team, collect 50 real invoices, and write down what "correct" means to them.' },
    { stackId: 'ingest', label: 'Ingest mail', happens: 'A mailbox hook pulls attachments, dedupes them and stores the originals.' },
    { stackId: 'extract', label: 'Extract fields', happens: 'OCR plus an LLM returns vendor, date, lines and total as schema-checked JSON.' },
    { stackId: 'review', label: 'Human review', happens: 'Low-confidence or mismatched totals go to a review screen; the rest pass through.' },
    { stackId: 'erp', label: 'Write to ERP', happens: 'Approved records post through the ERP API with an idempotency key.' },
    { stackId: 'measure', label: 'Measure + hand over', happens: 'Accuracy vs the hand-keyed baseline, time saved and a runbook the customer can run.' },
  ],
  stack: [
    {
      id: 'discovery', name: 'Customer discovery',
      what: 'Finding the real workflow, data and success measure before writing code.',
      why: 'Most failed integrations solve the described problem, not the actual one.',
      mustKnow: ['Ask for real samples, not descriptions', 'Define one measurable success number with the customer', 'Write down what is out of scope'],
      mistake: 'Starting to build after one meeting with a manager and never seeing the operator\'s screen.',
    },
    {
      id: 'ingest', name: 'Data ingestion',
      what: 'Reliably getting the customer\'s files or events into your system.',
      why: 'Customer data arrives duplicated, malformed and late; ingestion decides trust in everything after.',
      mustKnow: ['Idempotency and dedupe', 'Keep the original file untouched', 'Least-privilege access to their mailbox or storage'],
      mistake: 'Parsing in the ingest step and losing the original when parsing is wrong.',
    },
    {
      id: 'extract', name: 'LLM extraction with schema',
      what: 'Using OCR and a model to return structured fields that a validator can check.',
      why: 'A schema plus arithmetic checks (lines sum to total) catches wrong output without a human.',
      mustKnow: ['Validate output against a typed schema', 'Add rule checks, not just model confidence', 'Measure on the customer\'s own samples'],
      mistake: 'Accepting free-text model output and parsing it with regex.',
    },
    {
      id: 'review', name: 'Human-in-the-loop review',
      what: 'A screen where a person confirms or fixes uncertain records.',
      why: 'It lets the customer trust the system on day one and gives you labelled corrections.',
      mustKnow: ['Route by confidence and rule failures', 'Store every correction as future test data', 'Make review faster than manual keying or nobody uses it'],
      mistake: 'Building review as an afterthought that is slower than the old process.',
    },
    {
      id: 'erp', name: 'System integration (ERP/API)',
      what: 'Writing approved results into the customer\'s system of record.',
      why: 'The value is only real when the record lands where their team already works.',
      mustKnow: ['Idempotency keys so retries never double-post', 'Sandbox first, then production with a dry-run mode', 'Handle rate limits and partial failure'],
      mistake: 'Posting directly to production on the first test and creating duplicate invoices.',
    },
    {
      id: 'measure', name: 'Evaluation, monitoring and handover',
      what: 'Proving it works against a baseline and leaving the customer able to run it.',
      why: 'FDEs are judged on a result the customer can see and a system they can keep.',
      mustKnow: ['Compare to the hand-keyed baseline on the same invoices', 'Alerts for drift and failure queues', 'Runbook, owner and escalation path'],
      mistake: 'Leaving without documentation, so every issue needs you.',
    },
  ],
}

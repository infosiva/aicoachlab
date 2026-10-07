import type { Role } from './types'

export const SRE: Role = {
  slug: 'site-reliability-engineer',
  title: 'Site Reliability Engineer',
  blurb: 'Keeps production services fast and available by measuring reliability, automating away toil and leading incident response.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Making a checkout API reliable before a big sale',
    story:
      'An online shop runs its checkout API on Kubernetes and has had two slow-response incidents this quarter. Before a seasonal sale, you set reliability targets, build alerts that page only on real user pain, and rehearse the response.',
  },
  steps: [
    { stackId: 'slo', label: 'Set SLOs', happens: 'Agree that 99.9% of checkout requests should succeed and be fast, and turn that into an error budget.' },
    { stackId: 'observability', label: 'Observe', happens: 'Metrics, logs and traces from the API are collected so you can see latency per step of a checkout.' },
    { stackId: 'alerting', label: 'Alert', happens: 'Alerts fire when the error budget burns too fast, not on every CPU spike.' },
    { stackId: 'incident', label: 'Respond', happens: 'On-call follows a runbook, someone leads the incident, and a status update goes out.' },
    { stackId: 'automation', label: 'Automate', happens: 'Repeated manual fixes become scripts, autoscaling rules and safe rollbacks.' },
    { stackId: 'capacity', label: 'Test capacity', happens: 'A load test at sale-day traffic finds the database connection limit before customers do.' },
  ],
  stack: [
    {
      id: 'slo', name: 'SLIs, SLOs and error budgets',
      what: 'A measurable signal of user experience (the SLI), a target for it (the SLO) and the amount of failure you can afford (the budget).',
      why: 'It gives product and engineering one shared answer to "is it reliable enough to ship more features?"',
      mustKnow: ['Pick SLIs users feel, such as success rate and latency, not CPU', 'Target below 100% on purpose', 'When the budget is spent, slow feature work and fix reliability'],
      mistake: 'Setting a 99.99% target nobody can afford instead of one based on what users actually need.',
    },
    {
      id: 'observability', name: 'Observability (Prometheus, Grafana, OpenTelemetry)',
      what: 'Collecting metrics, logs and distributed traces so you can ask new questions about a running system.',
      why: 'When checkout slows down, traces show which downstream call is responsible.',
      mustKnow: ['Metrics tell you something is wrong, traces tell you where', 'Use consistent labels and avoid unbounded ones such as user id', 'Dashboards should follow the SLOs'],
      mistake: 'Building forty dashboards and still not being able to answer where the time goes.',
    },
    {
      id: 'alerting', name: 'Alerting and on-call',
      what: 'Rules that page a human when users are affected, plus a rota so someone always owns the response.',
      why: 'Noisy alerts train people to ignore them, and silent ones let outages grow.',
      mustKnow: ['Alert on symptoms and error-budget burn rate', 'Every page needs a clear action or a runbook link', 'Review noisy alerts every week and delete or fix them'],
      mistake: 'Paging on every high CPU reading and burning out the on-call engineer.',
    },
    {
      id: 'incident', name: 'Incident response and postmortems',
      what: 'A repeatable way to detect, mitigate and learn from outages, ending in a blameless written review.',
      why: 'The same failure should not surprise you twice.',
      mustKnow: ['Mitigate first (rollback, failover), find root cause after', 'Name an incident lead and a communicator', 'Postmortems focus on system fixes and have owned follow-up actions'],
      mistake: 'Debugging the root cause for an hour while customers still cannot check out and a rollback was available.',
    },
    {
      id: 'automation', name: 'Automation and infrastructure as code (Terraform, Kubernetes)',
      what: 'Describing infrastructure and operational tasks in code so they are repeatable and reviewable.',
      why: 'Toil, the manual repetitive work, grows with the service unless you remove it.',
      mustKnow: ['Keep infrastructure in version control and apply changes through review', 'Roll out gradually with canaries and automatic rollback', 'Make scripts safe to run twice'],
      mistake: 'Fixing production by hand with a console click that nobody records or can repeat.',
    },
    {
      id: 'capacity', name: 'Capacity planning and load testing',
      what: 'Estimating the traffic you need to handle and proving it with load tests such as k6.',
      why: 'Sale-day traffic is the one moment a hidden limit gets found the hard way.',
      mustKnow: ['Test with a realistic traffic mix, not one endpoint', 'Look for the first bottleneck, often the database or a connection pool', 'Set autoscaling limits and headroom deliberately'],
      mistake: 'Load testing a staging system that is a tenth the size of production and trusting the result.',
    },
  ],
}

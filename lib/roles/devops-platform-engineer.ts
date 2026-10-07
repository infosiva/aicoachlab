import type { Role } from './types'

export const DEVOPS_PLATFORM_ENGINEER: Role = {
  slug: 'devops-platform-engineer',
  title: 'DevOps / Platform / Cloud Engineer',
  blurb: 'Builds the paved road that lets developers ship a service to production quickly, safely and repeatably.',
  asOf: '2026-10',
  demand: [
    {
      claim: 'DevOps engineer and network/cloud engineer are among the 10 technology roles in highest demand, with above-average sequential growth and consistent demand over the past 12 months.',
      source: 'Robert Half, 2026',
      url: 'https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand',
    },
  ],
  scenario: {
    title: 'Shipping a new API service to Kubernetes with confidence',
    story:
      'A team has a new API and releases by hand over SSH, which broke production last month. You set up a pipeline where every merge is tested, built, deployed gradually and watched, with a clear plan for when it fails.',
  },
  steps: [
    { stackId: 'ci', label: 'Test on merge', happens: 'Each pull request runs tests, lint and a security scan before it can merge.' },
    { stackId: 'container', label: 'Build image', happens: 'The pipeline builds a small, pinned container image and tags it with the commit.' },
    { stackId: 'iac', label: 'Infra as code', happens: 'The cluster, network and database are defined in code and changed through reviewed pull requests.' },
    { stackId: 'deploy', label: 'Deploy', happens: 'A GitOps tool rolls the new version out gradually and reverts it if health checks fail.' },
    { stackId: 'observe', label: 'Observe', happens: 'Metrics, logs and traces show request rate, errors and latency for the new version.' },
    { stackId: 'slo', label: 'SLO + on-call', happens: 'A reliability target and alert rules decide when a person is paged, with a runbook ready.' },
  ],
  stack: [
    {
      id: 'ci', name: 'CI pipeline (GitHub Actions or similar)',
      what: 'Automation that runs tests, linting and scans on every change.',
      why: 'It catches the bug before it reaches production and makes releases routine.',
      mustKnow: ['Keep the pipeline fast, or developers will bypass it', 'Cache dependencies and run independent jobs in parallel', 'Store secrets in the CI secret store, never in the repo'],
      mistake: 'A 40-minute pipeline that people learn to ignore or skip.',
    },
    {
      id: 'container', name: 'Containers (Docker) and image registry',
      what: 'Packaging the app and its dependencies into an image that runs the same everywhere.',
      why: 'It removes "works on my machine" and gives one artifact to test, scan and deploy.',
      mustKnow: ['Use small base images and pin versions', 'Run as a non-root user', 'Tag by commit, not only "latest"'],
      mistake: 'Deploying the "latest" tag and not knowing which code is actually running.',
    },
    {
      id: 'iac', name: 'Infrastructure as code (Terraform)',
      what: 'Describing cloud resources in files that are reviewed and applied by tooling.',
      why: 'Environments become reproducible and every change has an author and a history.',
      mustKnow: ['Keep state in a shared, locked backend', 'Review the plan before applying', 'Split environments so a test change cannot touch production'],
      mistake: 'Clicking changes in the cloud console and letting the code drift from reality.',
    },
    {
      id: 'deploy', name: 'Kubernetes and GitOps (Helm, Argo CD)',
      what: 'Kubernetes runs the containers; a GitOps tool keeps the cluster matching what is in Git.',
      why: 'Rolling updates and health checks let you ship without downtime, and Git becomes the audit trail.',
      mustKnow: ['Set readiness and liveness probes', 'Set resource requests and limits', 'Use rolling or canary releases with automatic rollback'],
      mistake: 'Skipping readiness probes so traffic reaches pods that are not ready yet.',
    },
    {
      id: 'observe', name: 'Observability (Prometheus, Grafana, OpenTelemetry)',
      what: 'Metrics, logs and traces that show what the system is doing.',
      why: 'Fast diagnosis depends on seeing a problem the moment a release causes it.',
      mustKnow: ['Watch rate, errors and duration for each service', 'Use traces to follow a request across services', 'Keep metric labels low-cardinality to control cost'],
      mistake: 'Collecting every log line and still having no dashboard that answers "is it healthy?"',
    },
    {
      id: 'slo', name: 'SLOs, alerting and incident response',
      what: 'A target such as 99.9% of requests succeeding, with alerts tied to it and a plan for incidents.',
      why: 'It turns "be reliable" into a number and stops people being paged for harmless noise.',
      mustKnow: ['Alert on user impact, not every CPU spike', 'Keep a runbook with the first steps for each alert', 'Run blameless post-incident reviews and fix the cause'],
      mistake: 'Paging on every warning until the on-call engineer ignores the pager.',
    },
  ],
}

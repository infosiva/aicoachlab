import type { Role } from './types'

export const CYBERSECURITY_ENGINEER: Role = {
  slug: 'cybersecurity-engineer',
  title: 'Cybersecurity Engineer (AI + Cloud)',
  blurb: 'Finds how a system can be attacked, closes the gaps and makes sure the team notices if something still gets through.',
  asOf: '2026-10',
  demand: [
    {
      claim: 'AI security and cloud security are each named as a top technical skills need by 15% of cybersecurity hiring managers.',
      source: 'ISC2, 2026-04-17',
      url: 'https://www.isc2.org/Insights/2026/04/aligning-skills-people-and-hiring-in-cybersecurity',
    },
    {
      claim: 'Cybersecurity engineer is one of the 10 technology roles in highest demand, with above-average sequential growth and consistent demand over the past 12 months.',
      source: 'Robert Half, 2026',
      url: 'https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand',
    },
  ],
  scenario: {
    title: 'Securing an internal AI assistant that reads company documents',
    story:
      'The company is launching a chat assistant on its cloud account that answers questions from HR and finance documents. Before launch you must show it cannot leak documents to the wrong person or be talked into misbehaving.',
  },
  steps: [
    { stackId: 'threat', label: 'Threat model', happens: 'Draw the data flow and list who could abuse each step, using STRIDE and the OWASP LLM risks.' },
    { stackId: 'identity', label: 'Identity + access', happens: 'The assistant only retrieves documents the signed-in user is already allowed to read.' },
    { stackId: 'secrets', label: 'Secrets + network', happens: 'Keys live in a vault, the model and database sit on private networks, and data is encrypted.' },
    { stackId: 'guard', label: 'Prompt guardrails', happens: 'Untrusted text is treated as data, outputs are checked, and the assistant has no power it does not need.' },
    { stackId: 'detect', label: 'Log + detect', happens: 'Requests, denials and tool calls feed a SIEM with alerts for unusual patterns.' },
    { stackId: 'respond', label: 'Test + respond', happens: 'A red-team pass tries injection and data theft, and an incident runbook is agreed before launch.' },
  ],
  stack: [
    {
      id: 'threat', name: 'Threat modelling (STRIDE, OWASP Top 10 for LLM apps)',
      what: 'A structured way to ask what can go wrong at each step of the system before it is built or launched.',
      why: 'It finds design flaws such as an assistant that can read every document, which no scanner will report.',
      mustKnow: ['Draw trust boundaries on the data-flow diagram', 'Rank risks by impact and likelihood', 'Know the main LLM risks: prompt injection, sensitive data disclosure, excessive agency'],
      mistake: 'Running a vulnerability scanner and calling it a threat model.',
    },
    {
      id: 'identity', name: 'Identity and access management (IAM, least privilege)',
      what: 'Controls on who and what can reach each resource, in your cloud provider and in the app.',
      why: 'The most likely leak is an assistant using one broad service account to read documents for everyone.',
      mustKnow: ['Filter retrieval by the end user\'s permissions, not the service\'s', 'Grant the smallest role that works', 'Use short-lived credentials and review access regularly'],
      mistake: 'Giving the assistant\'s service account read access to the whole document bucket.',
    },
    {
      id: 'secrets', name: 'Secrets, network and encryption',
      what: 'A vault or key service for credentials, private network paths for services, and encryption of data at rest and in transit.',
      why: 'It limits what an attacker gets if one component is compromised.',
      mustKnow: ['Never put keys in code, images or prompts', 'Use private endpoints for the database and model API', 'Rotate keys and know who can read them'],
      mistake: 'Committing an API key to the repository and relying on deleting it later.',
    },
    {
      id: 'guard', name: 'Prompt-injection defence and guardrails',
      what: 'Controls that stop retrieved or user text from changing the assistant\'s instructions, and checks on what it says and does.',
      why: 'A document or message can contain hidden instructions, and a model cannot reliably tell them from yours.',
      mustKnow: ['Treat all retrieved text as untrusted input', 'Give the assistant the fewest tools and require approval for risky actions', 'Filter outputs for sensitive data, but do not rely on filters alone'],
      mistake: 'Believing a stern system prompt is enough protection.',
    },
    {
      id: 'detect', name: 'Logging, SIEM and detection',
      what: 'Collecting security-relevant logs in one place, with rules that alert on suspicious behaviour.',
      why: 'You cannot respond to an attack you cannot see.',
      mustKnow: ['Log who asked, what was retrieved and what was denied, without storing secrets', 'Alert on unusual volume or repeated denials', 'Keep logs tamper-resistant and retained long enough to investigate'],
      mistake: 'Logging full prompts that contain personal data into a widely readable tool.',
    },
    {
      id: 'respond', name: 'Red-teaming and incident response',
      what: 'Deliberately attacking your own system before launch, and a rehearsed plan for when something goes wrong.',
      why: 'It shows which defences actually hold and who does what in the first hour of an incident.',
      mustKnow: ['Test injection, data extraction and permission bypass', 'Write down severity levels, owners and who is told', 'Fix findings and re-test, do not just report them'],
      mistake: 'Writing the incident plan only after the first incident.',
    },
  ],
}

import type { Role } from './types'

export const APPSEC_ENGINEER: Role = {
  slug: 'application-security-engineer',
  title: 'Application Security Engineer',
  blurb: 'Finds and prevents security flaws in software by working with developers from design through release.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Securing a customer portal before its public launch',
    story:
      'A company is about to launch a web portal where customers log in and download invoices. You threat-model it, add automated security checks to the pipeline, review the login and file-access code, and prepare a plan for handling a reported vulnerability.',
  },
  steps: [
    { stackId: 'threat', label: 'Threat model', happens: 'Map the portal, its data flows and who could abuse them, such as one customer trying to read another\'s invoice.' },
    { stackId: 'owasp', label: 'Check common flaws', happens: 'Review against the OWASP Top 10, including broken access control and injection.' },
    { stackId: 'authn', label: 'Auth and sessions', happens: 'Login uses a vetted identity provider, multi-factor authentication and safe session handling.' },
    { stackId: 'pipeline', label: 'Automate checks', happens: 'Static analysis, dependency scanning and secret scanning run on every pull request.' },
    { stackId: 'testing', label: 'Test the app', happens: 'A penetration-style test hits the running portal and the findings are fixed and re-tested.' },
    { stackId: 'response', label: 'Respond', happens: 'A disclosure process and patch plan are ready so a reported flaw has a clear owner and deadline.' },
  ],
  stack: [
    {
      id: 'threat', name: 'Threat modeling',
      what: 'A structured look at what you are protecting, who might attack it and how, done at design time.',
      why: 'It finds design flaws, such as missing authorization on a download link, before any code exists to fix.',
      mustKnow: ['Draw data flows and trust boundaries', 'Use a prompt such as STRIDE to avoid missing threat types', 'Rank by impact and likelihood and track the fixes'],
      mistake: 'Starting security work only after the feature is finished and the design is hard to change.',
    },
    {
      id: 'owasp', name: 'OWASP Top 10 and secure coding',
      what: 'The widely used list of the most common web application flaws, with matching defensive coding practice.',
      why: 'Broken access control and injection still account for many real vulnerabilities, and the fixes are well known.',
      mustKnow: ['Check authorization on the server for every object, not just login', 'Use parameterized queries and output encoding', 'Validate input at trust boundaries'],
      mistake: 'Hiding the invoice link in the interface and assuming nobody will guess the URL.',
    },
    {
      id: 'authn', name: 'Authentication, sessions and secrets',
      what: 'How users prove who they are, how sessions are kept, and how API keys and passwords are stored.',
      why: 'Login is the front door, and homemade versions of it are a common source of breaches.',
      mustKnow: ['Prefer a proven provider using OAuth 2.0 and OpenID Connect over custom login', 'Store passwords only as salted hashes from a slow algorithm such as Argon2', 'Keep secrets in a secrets manager, never in the repository'],
      mistake: 'Committing an API key to the repository and relying on deleting it later.',
    },
    {
      id: 'pipeline', name: 'Security in CI/CD (SAST, SCA, secret scanning)',
      what: 'Automated checks on code, dependencies and secrets that run whenever a developer opens a pull request.',
      why: 'Catching a vulnerable dependency or leaked key at the pull request is cheaper than after release.',
      mustKnow: ['Static analysis finds code patterns, dependency scanning finds known vulnerable libraries', 'Tune rules so developers trust the results', 'Block merges only on findings that really matter'],
      mistake: 'Turning on every rule at once so developers drown in noise and ignore the scanner.',
    },
    {
      id: 'testing', name: 'Security testing and code review',
      what: 'Manual code review, dynamic scanning and penetration testing against a running copy of the application.',
      why: 'Some flaws, such as logic and access control errors, are only found by a person trying to break the app.',
      mustKnow: ['Test authorization by trying one account\'s ids from another account', 'Tools like Burp Suite or OWASP ZAP help intercept and replay requests', 'Write each finding with steps to reproduce and a recommended fix'],
      mistake: 'Handing developers a scanner report with no reproduction steps or priority.',
    },
    {
      id: 'response', name: 'Vulnerability management and response',
      what: 'Tracking known issues, setting fix deadlines by severity and handling reports from researchers.',
      why: 'Every system will eventually have a vulnerability, so a calm, practiced process limits the damage.',
      mustKnow: ['Rate severity using a scale such as CVSS plus real exposure', 'Publish a security contact and disclosure policy', 'Keep an inventory of dependencies so you can answer "are we affected?" quickly'],
      mistake: 'Having no owner for a reported vulnerability, so it sits unanswered for weeks.',
    },
  ],
}

import type { Role } from './types'

export const BACKEND_ENGINEER: Role = {
  slug: 'backend-engineer',
  title: 'Backend Engineer',
  blurb: 'Builds the services, APIs and databases behind a product so they stay correct, secure and fast as usage grows.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Order and payments API for an online store',
    story:
      'A growing store needs a backend that accepts orders, charges cards and tells the warehouse what to ship. Duplicate charges and lost orders are not acceptable, and the checkout must stay fast during sales. You design the API and the data behind it.',
  },
  steps: [
    { stackId: 'api', label: 'Design the API', happens: 'Define endpoints for creating and reading orders, with clear request and response shapes and error codes.' },
    { stackId: 'service', label: 'Write the service', happens: 'Implement the order logic in a typed service layer, keeping business rules out of the route handlers.' },
    { stackId: 'database', label: 'Model the data', happens: 'Store orders and items in Postgres with constraints, and use a transaction when an order and its payment record are written.' },
    { stackId: 'async', label: 'Background work', happens: 'Move slow work such as emails and warehouse notifications to a queue with retries.' },
    { stackId: 'security', label: 'Secure it', happens: 'Authenticate callers, check what each one may access, validate input and keep secrets out of the code.' },
    { stackId: 'observe', label: 'Deploy and observe', happens: 'Ship in a container through CI, with logs, metrics and alerts so a failing checkout is seen quickly.' },
  ],
  stack: [
    {
      id: 'api', name: 'API design (REST and OpenAPI)',
      what: 'The contract other systems use to call your service, usually REST over HTTP described in an OpenAPI file.',
      why: 'The web app, mobile app and warehouse all depend on the same stable contract.',
      mustKnow: ['Use correct HTTP methods and status codes', 'Make create calls idempotent with an idempotency key', 'Version the API and never break existing callers silently'],
      mistake: 'Returning 200 with an error message in the body, so clients cannot tell success from failure.',
    },
    {
      id: 'service', name: 'Service language and framework',
      what: 'The runtime and framework the service is written in, for example TypeScript with Node, Python with FastAPI, Go or Java with Spring Boot.',
      why: 'A typed service layer keeps business rules testable and separate from HTTP details.',
      mustKnow: ['Separate routes, business logic and data access', 'Validate input at the edge with a schema', 'Handle errors in one consistent place'],
      mistake: 'Mixing SQL, business rules and HTTP handling in one function.',
    },
    {
      id: 'database', name: 'Relational database (PostgreSQL)',
      what: 'A transactional SQL database that stores orders, items and payments with constraints and indexes.',
      why: 'Orders and money need transactions and foreign keys so data stays consistent.',
      mustKnow: ['Use transactions for writes that must succeed together', 'Add indexes for the queries you actually run and read query plans', 'Write schema changes as versioned migrations'],
      mistake: 'Looping over rows and querying inside the loop, causing hundreds of queries per request.',
    },
    {
      id: 'async', name: 'Queues, caching and background jobs',
      what: 'A message queue or job runner such as a managed queue, Redis-based jobs or Kafka, plus a cache such as Redis.',
      why: 'Checkout should return quickly while emails and warehouse messages are handled in the background.',
      mustKnow: ['Jobs can run twice, so make them idempotent', 'Use retries with backoff and a dead-letter queue', 'Cache data with a clear expiry and invalidation rule'],
      mistake: 'Calling a slow third-party service inside the request and timing out the checkout.',
    },
    {
      id: 'security', name: 'Authentication, authorization and secrets',
      what: 'Proving who the caller is, deciding what they may do, and storing credentials safely.',
      why: 'An order API exposes customer data and money, so one missing check becomes a breach.',
      mustKnow: ['Check ownership on every record, not only that the user is logged in', 'Validate and escape all input to prevent injection', 'Keep secrets in a secret manager, never in the repo'],
      mistake: 'Trusting an order id from the client and returning another customer\'s order.',
    },
    {
      id: 'observe', name: 'Containers, CI/CD and observability',
      what: 'Packaging the service in a container, deploying through a pipeline, and watching it with logs, metrics and traces such as OpenTelemetry.',
      why: 'You need to ship small changes safely and find out quickly when checkout starts failing.',
      mustKnow: ['Run tests and migrations in the pipeline', 'Use structured logs with a request id', 'Alert on error rate and latency, not only on server down'],
      mistake: 'Deploying with no logs or alerts and learning about failures from customers.',
    },
  ],
}

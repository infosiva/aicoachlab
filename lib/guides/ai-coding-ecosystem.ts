// Guide 01 source: docs/references/01-ai-coding-agent-ecosystem.md
// Tool landscape as of 2026-10. Guidance is general engineering judgement, no benchmarks or hiring stats claimed.

export interface GuideQuestion {
  q: string
  testing: string // what the interviewer is really probing
  answer: string // how to structure a strong answer
  redFlag: string // answer pattern to avoid
}

export interface GuideTool {
  name: string
  note: string
}

export interface GuideLayer {
  slug: string
  title: string
  blurb: string
  tools: GuideTool[]
  questions: GuideQuestion[]
}

export interface Guide {
  slug: string
  title: string
  description: string
  source: string
  asOf: string
  framework: string[] // answer pattern shared by all questions
  layers: GuideLayer[]
}

export const AI_CODING_ECOSYSTEM: Guide = {
  slug: 'ai-coding-agent-ecosystem',
  title: 'AI Coding Agent Ecosystem',
  description:
    'The tools from prompt to production, layer by layer, with the interview questions each layer attracts and how to answer them with trade-offs.',
  source: 'Infographic by Rathnakumar Udayakumar (@rathanuday)',
  asOf: '2026-10',
  framework: [
    'Claim: state your pick in one sentence.',
    'Trade-off: name what you give up and the alternative you rejected.',
    'Evidence: say how you would measure it (eval set, latency, cost per task).',
    'Fallback: say what you do when it fails or the vendor changes.',
  ],
  layers: [
    {
      slug: 'foundation-model',
      title: 'Foundation Model',
      blurb: 'The reasoning engine. Interviews test whether you choose by measured fit, not by brand.',
      tools: [
        { name: 'Claude', note: 'Anthropic hosted models' },
        { name: 'GPT-5', note: 'OpenAI hosted models' },
        { name: 'Gemini', note: 'Google hosted models' },
        { name: 'Llama', note: 'Meta open-weight models' },
        { name: 'Mistral', note: 'Open-weight and hosted models' },
        { name: 'DeepSeek', note: 'Open-weight and hosted models' },
      ],
      questions: [
        {
          q: 'How do you choose a model for a coding agent?',
          testing: 'Do you evaluate on your own tasks, and think in cost per finished task rather than price per token?',
          answer:
            'List the criteria: task fit, tool-calling reliability, context window, latency, cost per completed task, licence and data rules. Build a small eval set from real tasks, run candidates on it, then route: a cheap model for simple steps, a stronger one for hard steps.',
          redFlag: '"Use the newest or biggest model." No eval, no cost view.',
        },
        {
          q: 'Open-weight or hosted API?',
          testing: 'Can you reason about control versus operational burden?',
          answer:
            'Hosted wins on speed to ship and top quality. Open-weight (Llama, Mistral, DeepSeek) wins when you need data control, fixed cost at volume, or fine-tuning, but you own serving, GPUs and upgrades. Many teams start hosted and move a stable, high-volume step to open-weight once evals prove parity.',
          redFlag: 'Treating one option as always better, or ignoring who runs the servers.',
        },
        {
          q: 'A provider deprecates your model next month. What happens?',
          testing: 'Vendor lock-in and change management.',
          answer:
            'Calls go through one gateway layer so the model is config, not code. Pin versions, keep an eval suite, run the replacement against it, shadow-test a slice of traffic, then switch with a rollback path.',
          redFlag: 'Provider SDK calls scattered through feature code.',
        },
      ],
    },
    {
      slug: 'ai-coding-assistant',
      title: 'AI Coding Assistant',
      blurb: 'Day-to-day tools. Interviewers want judgement about trusting generated code.',
      tools: [
        { name: 'Claude Code', note: 'Terminal agent' },
        { name: 'GitHub Copilot', note: 'Inline and chat assistant' },
        { name: 'Cursor', note: 'AI-first IDE' },
        { name: 'Windsurf', note: 'AI-first IDE' },
        { name: 'Cline', note: 'Editor agent extension' },
        { name: 'Aider', note: 'Terminal pair-programmer' },
      ],
      questions: [
        {
          q: 'How do you keep AI-generated code trustworthy?',
          testing: 'Engineering discipline, not tool enthusiasm.',
          answer:
            'Small diffs, tests written or reviewed first, type-check and lint in CI, human review of every change, and a rules file that tells the assistant your conventions. Treat output as a junior contribution: verify, never assume.',
          redFlag: '"I just accept it if it runs."',
        },
        {
          q: 'Compare an inline assistant, an IDE agent and a terminal agent.',
          testing: 'Do you match the tool to the task?',
          answer:
            'Inline completion suits boilerplate while you type. An IDE agent suits multi-file edits you want to watch. A terminal agent suits larger tasks that run commands and tests. Pick by task size and how much oversight you need.',
          redFlag: 'Listing product names with no difference in how you would use them.',
        },
        {
          q: 'Tell me about a time an AI assistant was wrong.',
          testing: 'Honesty and learning, a behavioural question in disguise.',
          answer:
            'Use STAR. Say what it got wrong, how you caught it (test, review, reading the diff), the fix, and the guardrail you added afterwards.',
          redFlag: 'Claiming it never makes mistakes.',
        },
      ],
    },
    {
      slug: 'agent-frameworks',
      title: 'Agent Frameworks',
      blurb: 'Orchestration. The best answers start with "do you even need an agent?"',
      tools: [
        { name: 'LangGraph', note: 'Graph and state-machine control' },
        { name: 'CrewAI', note: 'Role-based multi-agent crews' },
        { name: 'AutoGen', note: 'Conversational multi-agent' },
        { name: 'OpenAI Agents SDK', note: 'Lightweight agent loop' },
        { name: 'Google ADK', note: 'Agent Development Kit' },
        { name: 'Semantic Kernel', note: 'Microsoft orchestration SDK' },
      ],
      questions: [
        {
          q: 'When would you use an agent instead of a fixed workflow?',
          testing: 'Restraint. Agents cost more and are less predictable.',
          answer:
            'If the steps are known, use a deterministic workflow with LLM calls inside. Use an agent only when the path depends on intermediate results and cannot be listed upfront. Start simple, add autonomy where an eval shows it helps.',
          redFlag: 'Reaching for multi-agent by default.',
        },
        {
          q: 'How would you choose between LangGraph, CrewAI and AutoGen?',
          testing: 'Can you map framework style to requirements?',
          answer:
            'Explicit state, branching, checkpoints and human approval point to a graph model like LangGraph. Role-based task delegation fits crew-style frameworks. Conversational multi-agent fits AutoGen-style setups. Decide on determinism, observability and team familiarity, and prototype both on one real task.',
          redFlag: 'Choosing by GitHub stars.',
        },
        {
          q: 'How do you stop an agent looping or burning budget?',
          testing: 'Production safety.',
          answer:
            'Max steps, per-run token and cost budgets, timeouts, tool allow-lists, loop detection on repeated calls, and human approval for destructive actions. Log every step so you can replay a failure.',
          redFlag: 'Relying on the prompt saying "stop when done".',
        },
      ],
    },
    {
      slug: 'mcp-layer',
      title: 'MCP Layer',
      blurb: 'The Model Context Protocol connects models to tools and data in a standard way.',
      tools: [
        { name: 'MCP', note: 'The protocol' },
        { name: 'FastMCP', note: 'Python server framework' },
        { name: 'GitHub MCP', note: 'Repo and PR tools' },
        { name: 'Filesystem MCP', note: 'Local file access' },
        { name: 'PostgreSQL MCP', note: 'Database access' },
        { name: 'Slack MCP', note: 'Messaging tools' },
      ],
      questions: [
        {
          q: 'What is MCP and why does it matter?',
          testing: 'Do you understand the problem, not just the acronym?',
          answer:
            'An open protocol where a client (the AI app) talks to servers that expose tools, resources and prompts. It replaces one-off integrations per app and per model with one standard interface, so a tool is written once and reused.',
          redFlag: '"It is just function calling." It standardises discovery and transport as well.',
        },
        {
          q: 'What are the security risks of connecting MCP servers?',
          testing: 'Threat modelling.',
          answer:
            'Untrusted servers, over-broad permissions, and prompt injection through tool output. Mitigate with least privilege, read-only by default, authentication, confirmation before writes or deletes, auditing every call, and treating tool results as data, never as instructions.',
          redFlag: 'Installing community servers with full database or filesystem access.',
        },
        {
          q: 'MCP server, plain REST API, or in-app function calling?',
          testing: 'Trade-off judgement.',
          answer:
            'Function calling inside one app is simplest. MCP pays off when several clients or models need the same tools. A REST API stays right for non-AI consumers. Often the MCP server is a thin wrapper over an existing API.',
          redFlag: 'Rewriting working APIs as MCP for its own sake.',
        },
      ],
    },
    {
      slug: 'context-knowledge',
      title: 'Context & Knowledge',
      blurb: 'Retrieval and vector stores. Expect "why is your RAG bad?" more than "which database?"',
      tools: [
        { name: 'Pinecone', note: 'Managed vector database' },
        { name: 'Chroma', note: 'Lightweight, easy local start' },
        { name: 'Weaviate', note: 'Vector DB with hybrid search' },
        { name: 'Milvus', note: 'Scalable self-hosted vector DB' },
        { name: 'FAISS', note: 'In-process similarity library, not a database' },
        { name: 'OpenSearch', note: 'Search engine with vector support' },
      ],
      questions: [
        {
          q: 'How would you pick a vector store?',
          testing: 'Fit to scale, ops capacity and existing stack.',
          answer:
            'Prototype with something light (Chroma or FAISS). Managed (Pinecone) when you want no ops. Weaviate or OpenSearch when you need keyword plus vector hybrid search or already run the stack. Milvus when you self-host at large scale. Note FAISS is a library: no persistence, auth or filtering out of the box.',
          redFlag: 'Naming a favourite with no workload numbers or ops reasoning.',
        },
        {
          q: 'Your RAG answers are poor. What do you check?',
          testing: 'Systematic debugging with measurements.',
          answer:
            'Measure retrieval separately from generation. Build a golden question set and track hit@k and MRR. Then work through chunking, metadata filters, hybrid search, a reranker, and query rewriting, changing one thing at a time. Only then tune the prompt.',
          redFlag: 'Immediately swapping the model or the vector database.',
        },
        {
          q: 'When is a graph better than vectors?',
          testing: 'Do you add complexity only when proven?',
          answer:
            'When questions need multi-hop relationships across entities, which plain similarity search handles badly. Prove it on a golden set of multi-hop questions first; otherwise vectors plus a reranker are simpler and cheaper.',
          redFlag: 'Choosing GraphRAG because it sounds advanced.',
        },
      ],
    },
    {
      slug: 'runtime-apis',
      title: 'Runtime & APIs',
      blurb: 'Where the code runs. LLM apps stress timeouts, streaming and scaling.',
      tools: [
        { name: 'FastAPI', note: 'Python API framework' },
        { name: 'Docker', note: 'Containers' },
        { name: 'Kubernetes', note: 'Container orchestration' },
        { name: 'AWS Lambda', note: 'Serverless functions' },
        { name: 'Cloud Run', note: 'Serverless containers' },
      ],
      questions: [
        {
          q: 'Serverless functions or containers for an LLM backend?',
          testing: 'Operational trade-offs specific to LLM workloads.',
          answer:
            'Functions are cheap and scale to zero but have request time limits and cold starts, which hurts long generations and large model loads. Containers (Cloud Run or Kubernetes) allow streaming, longer jobs and warm models. Use queues and workers for long-running agent tasks.',
          redFlag: 'Ignoring timeouts and streaming.',
        },
        {
          q: 'How do you run long agent tasks reliably?',
          testing: 'Distributed-systems basics.',
          answer:
            'Put the task on a queue, run it in a worker, make steps idempotent, persist state between steps, retry with backoff, and report status to the user by polling or events.',
          redFlag: 'Holding one HTTP request open for minutes.',
        },
      ],
    },
    {
      slug: 'evaluation-testing',
      title: 'Evaluation & Testing',
      blurb: 'The most underrated interview topic. Showing an eval habit sets you apart.',
      tools: [
        { name: 'LangSmith', note: 'Tracing and evals (LangChain)' },
        { name: 'TruLens', note: 'Feedback functions for RAG' },
        { name: 'DeepEval', note: 'Test-style LLM metrics' },
        { name: 'Promptfoo', note: 'Prompt testing and red-teaming' },
      ],
      questions: [
        {
          q: 'How do you test a non-deterministic system?',
          testing: 'Do you have a real evaluation practice?',
          answer:
            'A golden set of representative cases, including ones that must be refused. Deterministic checks where possible (format, citations, tool calls), LLM-as-judge for fuzzy quality after calibrating it against human labels, thresholds in CI, and periodic human spot checks.',
          redFlag: '"I try a few prompts and see if it looks right."',
        },
        {
          q: 'What do you measure for a RAG system?',
          testing: 'Separating retrieval quality from answer quality.',
          answer:
            'Retrieval: hit@k and MRR. Answers: groundedness (is each claim supported by the sources), relevance, and correct refusal when the corpus has no answer. Track cost and latency alongside.',
          redFlag: 'One vague "accuracy" number.',
        },
        {
          q: 'How would you gate a release on quality?',
          testing: 'Regression discipline.',
          answer:
            'Run the eval suite on every prompt, model or retrieval change. Fail the build below a recorded floor, and never lower the floor without writing down why.',
          redFlag: 'Shipping prompt changes with no regression check.',
        },
      ],
    },
    {
      slug: 'observability',
      title: 'Observability',
      blurb: 'You cannot fix what you cannot see. Traces, cost and quality in production.',
      tools: [
        { name: 'Langfuse', note: 'Open-source LLM tracing' },
        { name: 'Helicone', note: 'Proxy-based request logging' },
        { name: 'OpenTelemetry', note: 'Vendor-neutral telemetry standard' },
        { name: 'Grafana', note: 'Dashboards and alerts' },
      ],
      questions: [
        {
          q: 'What do you log for an LLM application?',
          testing: 'Operational maturity, and privacy awareness.',
          answer:
            'One trace per request: model, latency, token counts and cost, tool calls, retrieved chunks, errors and user feedback. Redact or avoid storing sensitive prompt text, and keep keys out of logs entirely.',
          redFlag: 'Logging full prompts with personal data and no retention rule.',
        },
        {
          q: 'How do you detect quality regressions in production?',
          testing: 'Closing the loop after launch.',
          answer:
            'Sample production traces into the eval pipeline, track feedback signals (thumbs, corrections), alert on cost, latency and error spikes, and compare quality by model or prompt version.',
          redFlag: 'Waiting for users to complain.',
        },
        {
          q: 'Why use OpenTelemetry instead of a single vendor SDK?',
          testing: 'Lock-in awareness.',
          answer:
            'A standard lets you change or add backends (Langfuse, Grafana, others) without re-instrumenting the code, and it correlates AI spans with the rest of your services.',
          redFlag: 'Not knowing what it is.',
        },
      ],
    },
    {
      slug: 'deployment',
      title: 'Deployment',
      blurb: 'Shipping and rolling back AI features safely, at a cost you can predict.',
      tools: [
        { name: 'Vercel', note: 'Frontend and serverless platform' },
        { name: 'AWS', note: 'Cloud platform' },
        { name: 'Azure', note: 'Cloud platform' },
        { name: 'Google Cloud', note: 'Cloud platform' },
      ],
      questions: [
        {
          q: 'How do you deploy and roll back an AI feature?',
          testing: 'Release engineering for non-deterministic code.',
          answer:
            'Version prompts and models as config, gate releases on the eval suite, roll out behind a feature flag or canary, watch cost and quality metrics, and keep a one-step rollback to the previous prompt or model.',
          redFlag: 'Editing a production prompt in place.',
        },
        {
          q: 'How do you keep AI cost predictable?',
          testing: 'Do you treat cost as a requirement?',
          answer:
            'Per-user and per-tenant limits, output caps, caching, routing simple steps to cheaper models, and budget alerts. Measure cost per completed task, not just token price.',
          redFlag: 'No limits, so one abusive user sets your bill.',
        },
        {
          q: 'Which cloud, and why?',
          testing: 'Pragmatism over loyalty.',
          answer:
            'Start from constraints: where your data and team already are, compliance needs, and which managed model services you need. Name the lock-in you accept and the abstraction that limits it.',
          redFlag: 'Naming a cloud with no constraint behind the choice.',
        },
      ],
    },
  ],
}

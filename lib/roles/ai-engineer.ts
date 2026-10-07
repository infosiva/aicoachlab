import type { Role } from './types'

export const AI_ENGINEER: Role = {
  slug: 'ai-engineer',
  title: 'AI Engineer',
  blurb: 'Ships LLM features into real products: retrieval, tool calls, evals and cost control.',
  asOf: '2026-10',
  demand: [
    {
      claim: 'Ranked #1 fastest-growing US job title (window 2023-01 to 2025-07).',
      source: 'LinkedIn Jobs on the Rise 2026',
      url: 'https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c/',
    },
    {
      claim: 'AI/ML/data-science postings reached 49,200 in 2025, up 163% on 2024.',
      source: 'Robert Half 2026',
      url: 'https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand',
    },
  ],
  scenario: {
    title: 'Support-ticket answer assistant for a SaaS company',
    story:
      'Support agents lose time searching 2,000 help-centre pages. You build an assistant that drafts a cited answer from the docs, hands off to a human when unsure, and stays within a cost budget.',
  },
  steps: [
    { stackId: 'ingest', label: 'Ingest docs', happens: 'Help pages are cleaned, split into chunks and tagged with product and version.' },
    { stackId: 'embed', label: 'Embed + store', happens: 'Each chunk becomes a vector and is saved with its metadata in a vector index.' },
    { stackId: 'retrieve', label: 'Retrieve', happens: 'The ticket text finds the top chunks; a reranker puts the best ones first.' },
    { stackId: 'llm', label: 'Generate', happens: 'The model writes a short answer using only the retrieved chunks and cites them.' },
    { stackId: 'guard', label: 'Check + route', happens: 'No supporting chunk or low confidence means: do not answer, send to a human.' },
    { stackId: 'evals', label: 'Evaluate', happens: 'A fixed question set runs on every change; the score decides if it ships.' },
    { stackId: 'observe', label: 'Observe cost', happens: 'Each request logs latency, tokens and cost so a budget alarm can fire.' },
  ],
  stack: [
    {
      id: 'ingest', name: 'Document ingestion',
      what: 'Turning messy source documents into clean, chunked text with metadata.',
      why: 'Retrieval quality is capped by chunk quality; most wrong answers start here.',
      mustKnow: ['Chunk by meaning (headings), not fixed character counts alone', 'Keep source URL and version as metadata', 'Re-ingest only what changed'],
      mistake: 'Chunking blindly at 500 characters and splitting a table or step list in half.',
    },
    {
      id: 'embed', name: 'Embeddings + vector index',
      what: 'Numeric representations of text, stored so similar meaning can be searched fast.',
      why: 'Users phrase questions differently from the docs, so keyword search alone misses them.',
      mustKnow: ['One embedding model per index; changing it means re-embedding', 'Metadata filters (product, version) beat bigger indexes', 'Examples: pgvector, Qdrant, Chroma'],
      mistake: 'Mixing embeddings from two models in one index and getting meaningless scores.',
    },
    {
      id: 'retrieve', name: 'Retrieval + reranking',
      what: 'Finding candidate chunks, then reordering them by true relevance to the question.',
      why: 'Sending 5 right chunks beats sending 30 mixed ones: cheaper and more accurate.',
      mustKnow: ['Hybrid (keyword + vector) often beats either alone', 'Measure hit-rate at k on a labelled set', 'Context budget: decide k before writing prompts'],
      mistake: 'Stuffing whole documents into the prompt and calling it RAG.',
    },
    {
      id: 'llm', name: 'LLM call + prompt',
      what: 'The model that writes the answer from the question plus retrieved context.',
      why: 'A smaller model with good context is usually enough and far cheaper than the largest one.',
      mustKnow: ['Instruct: answer only from context, cite, say "not found" otherwise', 'Cap output length', 'Route easy cases to a cheap model, hard ones up'],
      mistake: 'Trusting the model to know the product and skipping the "only from context" rule.',
    },
    {
      id: 'guard', name: 'Guardrails + human handoff',
      what: 'Rules that decide when the system must not answer or must escalate.',
      why: 'A confident wrong answer to a customer costs more than a slow human reply.',
      mustKnow: ['Refuse when no chunk passes a relevance threshold', 'Treat retrieved text as untrusted (prompt injection)', 'Log every handoff for review'],
      mistake: 'Never testing the "I should not answer" path.',
    },
    {
      id: 'evals', name: 'Evaluation set',
      what: 'A fixed list of questions with expected sources or answers, run on every change.',
      why: 'Without it, every prompt tweak is a guess and regressions ship silently.',
      mustKnow: ['Include unanswerable questions', 'Track retrieval and answer quality separately', 'Run in CI before release'],
      mistake: 'Judging quality by trying three questions by hand.',
    },
    {
      id: 'observe', name: 'Tracing, cost and limits',
      what: 'Per-request records of latency, tokens, cost and which chunks were used.',
      why: 'You cannot fix or budget what you cannot see; this also proves the free-tier ceiling.',
      mustKnow: ['Do not log raw customer text if it is personal data', 'Per-user and per-day limits', 'Alert on cost per answer, not just total'],
      mistake: 'Finding out the monthly bill from the invoice.',
    },
  ],
}

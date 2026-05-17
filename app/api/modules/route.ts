import { NextResponse } from "next/server";

const MODULES = [
  {
    week: "Week 1–2",
    title: "RAG Foundations",
    tag: "RAG",
    color: "#6366f1",
    icon: "🔍",
    lessons: [
      "Vector databases: Pinecone, Chroma, pgvector",
      "Chunking strategies that actually work",
      "Embedding models compared (OpenAI, Cohere, local)",
      "Build: Document Q&A system from scratch",
      "Advanced: Hybrid search + reranking",
    ],
    project: "Build a RAG pipeline over your own documents with source citations",
  },
  {
    week: "Week 3–4",
    title: "MCP Servers",
    tag: "MCP",
    color: "#8b5cf6",
    icon: "🔌",
    lessons: [
      "Model Context Protocol — architecture deep dive",
      "Build your first MCP server in Python/TypeScript",
      "Expose tools, resources, prompts via MCP",
      "Connect Claude Desktop to custom MCP server",
      "Deploy MCP server to production",
    ],
    project: "Ship an MCP server that gives Claude access to your own data",
  },
  {
    week: "Week 5–6",
    title: "LangGraph Workflows",
    tag: "LangGraph",
    color: "#06b6d4",
    icon: "🕸️",
    lessons: [
      "State machines vs chains — when to use which",
      "Building cyclic graphs with conditional edges",
      "Human-in-the-loop patterns",
      "Parallel execution and fan-out/fan-in",
      "Persistence and checkpointing",
    ],
    project: "Build a multi-step research agent with approval gates",
  },
  {
    week: "Week 7–8",
    title: "Production AI Agents",
    tag: "Agents",
    color: "#22c55e",
    icon: "🤖",
    lessons: [
      "ReAct, Plan-and-Execute, and Reflection patterns",
      "Tool calling: design, reliability, error handling",
      "Multi-agent orchestration with LangGraph",
      "Observability: tracing with LangSmith / AgentTrace",
      "Cost control, rate limits, graceful degradation",
    ],
    project: "Ship a production-ready AI agent with monitoring and cost controls",
  },
];

export async function GET() {
  return NextResponse.json(MODULES, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}

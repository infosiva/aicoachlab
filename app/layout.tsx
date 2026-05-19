import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import FloatingChatWrapper from '@/components/FloatingChatWrapper'

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "AICoachLab — Learn RAG, MCP, LangGraph & AI Agents by Building Real Projects",
  description: "Hands-on AI engineering coaching. Build real RAG pipelines, MCP servers, LangGraph workflows and AI agents. Project-based, not theory. Join 500+ developers.",
  keywords: ["RAG tutorial", "MCP server", "LangGraph course", "AI agents course", "AI engineering", "learn AI", "AI coaching"],
  metadataBase: new URL("https://aicoachlab.dev"),
  openGraph: {
    title: "AICoachLab — Learn AI Engineering by Building",
    description: "Hands-on coaching for RAG, MCP, LangGraph & AI Agents.",
    type: "website",
    siteName: "AICoachLab",
  },
  twitter: { card: "summary_large_image", title: "AICoachLab", description: "Learn RAG, MCP, LangGraph & AI Agents by building real projects." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body style={{ background: "#04070f", color: "#f0f4ff", fontFamily: "var(--font-body, system-ui)", margin: 0 }}>
        {children}
        <FloatingChatWrapper />
      </body>
    </html>
  );
}

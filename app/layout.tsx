import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import FloatingChatWrapper from '@/components/FloatingChatWrapper'

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "AICoachLab — Build Real AI Projects, Not Just Theory",
  description: "BetterUp costs $3k/year and never ships code. AICoachLab coaches you through RAG, MCP, and agents until you have working projects in your portfolio.",
  keywords: ["RAG tutorial", "MCP server", "LangGraph course", "AI agents course", "AI engineering", "learn AI", "AI coaching"],
  metadataBase: new URL("https://aicoachlab.app"),
  openGraph: {
    title: "AICoachLab — Build Real AI Projects, Not Just Theory",
    description: "Ship working RAG pipelines, MCP servers, and AI agents — not slides.",
    type: "website",
    siteName: "AICoachLab",
  },
  twitter: { card: "summary_large_image", title: "AICoachLab", description: "Build real RAG pipelines, MCP servers, and AI agents. Project output guaranteed." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "AICoachLab",
          "url": "https://aicoachlab.app",
          "description": "Hands-on AI engineering coaching",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://aicoachlab.app?q={search_term_string}"
          }
        })}} />
      </head>
      <body style={{ background: "#04070f", color: "#f0f4ff", fontFamily: "var(--font-body, system-ui)", margin: 0 }}>
        <div className="aurora aurora-primary" aria-hidden />
        <div className="aurora aurora-secondary" aria-hidden />
        <div className="aurora aurora-third" aria-hidden />
        <div className="grain" aria-hidden />
        <div style={{ position: "relative", zIndex: 2 }}>
          {children}
        </div>
        {/* FloatingChatWrapper removed — page.tsx has richer inline chatbot with voice */}
        <Script defer data-site="aicoachlab.app" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
    url: "https://aicoachlab.app",
    images: [{ url: "https://aicoachlab.app/og.png", width: 1200, height: 630, alt: "AICoachLab — Build Real AI Projects" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AICoachLab — Build Real AI Projects, Not Just Theory",
    description: "Build real RAG pipelines, MCP servers, and AI agents. Project output guaranteed.",
    images: ["https://aicoachlab.app/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AICoachLab",
            "url": "https://aicoachlab.app",
            "description": "Hands-on AI engineering coaching — build real RAG pipelines, MCP servers, and AI agents.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://aicoachlab.app?q={search_term_string}"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AICoachLab",
            "url": "https://aicoachlab.app",
            "description": "BetterUp costs $3k/year and never ships code. AICoachLab coaches you through RAG, MCP, and agents until you have working projects in your portfolio.",
            "applicationCategory": "EducationApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          }
        ])}} />
      </head>
      <body style={{ background: "#04070f", color: "#f0f4ff", fontFamily: "var(--font-body, system-ui)", margin: 0 }}>
        <div className="aurora aurora-primary" aria-hidden />
        <div className="aurora aurora-secondary" aria-hidden />
        <div className="aurora aurora-third" aria-hidden />
        <div className="grain" aria-hidden />
        <div style={{ position: "relative", zIndex: 2 }}>
          {children}
        </div>
        <Script defer data-site="aicoachlab.app" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

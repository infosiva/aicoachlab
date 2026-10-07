import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Inter, Space_Grotesk } from "next/font/google"
import FloatingChatWrapper from "@/components/FloatingChatWrapper"
import FeedbackWidget from "@/components/FeedbackWidget"
import BackToTop from "@/components/BackToTop"
import CookieConsent from "../components/CookieConsent"
import "./globals.css"
import { loadSiteTheme, buildThemeStyleTag, buildGa4Snippet, isWidgetHidden } from "@/lib/theme-loader"
import { AnimatedBg } from "@/components/AnimatedBg"
import { MotionProvider } from "@infosiva/shared-ui/modern"

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700"] })

const TITLE = "AICoachLab — AI mock interviews with live coaching"
const DESC = "Practice tech interviews out loud with an AI interviewer. Pick a role, answer by voice or text, get coaching on structure and clarity. Free to start."

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["mock interview", "AI interview practice", "interview coach", "STAR method", "system design interview"],
  metadataBase: new URL("https://aicoachlab.app"),
  openGraph: {
    title: TITLE, description: DESC, type: "website", siteName: "AICoachLab", url: "https://aicoachlab.app",
    images: [{ url: "https://aicoachlab.app/og.png", width: 1200, height: 630, alt: "AICoachLab" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["https://aicoachlab.app/og.png"] },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { themeColor: "#0c0714", colorScheme: "dark" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await loadSiteTheme("aicoachlab")
  const themeCSS = buildThemeStyleTag(theme, { background: "#0c0714", primary: "#ec13d6", secondary: "#a30d94" })
  const ga4 = buildGa4Snippet(theme)
  const ga4Id = theme?.analytics?.ga4Id

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4237294630161176"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AICoachLab",
              url: "https://aicoachlab.app",
              applicationCategory: "EducationalApplication",
              description: DESC,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
        {ga4 && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
            <script dangerouslySetInnerHTML={{ __html: ga4 }} />
          </>
        )}
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
      </head>
      <body>
        <AnimatedBg theme={theme} fallback="none" />
        <MotionProvider>{children}</MotionProvider>
        {!isWidgetHidden(theme, "chatbot") && <FloatingChatWrapper />}
        {!isWidgetHidden(theme, "backToTop") && <BackToTop accentColor="#ec13d6" />}
        {!isWidgetHidden(theme, "cookieConsent") && <CookieConsent />}
        <FeedbackWidget siteName="AICoachLab" accentColor="#ec13d6" accentColor2="#a30d94" position="left" />
      </body>
    </html>
  )
}

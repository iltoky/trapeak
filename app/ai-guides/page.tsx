import type { Metadata } from "next";
import Link from "next/link";

import "../guides.css";

import { BrandLogo } from "../brand";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = {
  title: "AI fitness and health guides",
  description: "Practical guides for recording, analyzing, planning and sharing permissioned fitness and health data with compatible AI assistants and trusted specialists.",
  alternates: { canonical: "/ai-guides" },
};

const useCases = [
  { href: "/use-cases/ai-workout-recommendations", label: "Choose or adjust training with AI", description: "Combine previous workouts, goals, constraints, nutrition, weight and a current check-in without inventing recovery data." },
  { href: "/use-cases/log-nutrition-with-ai", label: "Log nutrition with AI", description: "Record meals by voice, text or an AI-interpreted image while preserving calories, macros and estimation assumptions." },
  { href: "/use-cases/track-blood-tests-with-ai", label: "Track laboratory history", description: "Keep exact reported values, units, reference ranges and flags for later review with AI or a doctor." },
  { href: "/use-cases/use-multiple-ai-assistants", label: "Use multiple AI assistants", description: "Capture in one compatible AI, then analyze, chart or plan with another while keeping the same structured history." },
  { href: "/use-cases/share-data-with-coach", label: "Share with a coach, doctor or dietitian", description: "Choose Training, Nutrition or Health for a specific email, with read-only access, expiry and revoke." },
] as const;

const liveGuides = [
  { href: "/wahoo-to-chatgpt", label: "Wahoo to ChatGPT", description: "How authenticated beta users bring authorized Wahoo workout data into ChatGPT." },
  { href: "/wahoo-to-claude", label: "Wahoo to Claude", description: "How a compatible Claude client can use authorized Wahoo workout data through TRAPEAK MCP." },
  { href: "/wahoo-mcp", label: "Wahoo MCP", description: "Current tools, authentication, data boundaries and source coverage." },
  { href: "/wearable-mcp", label: "Wearable MCP roadmap", description: "The factual roadmap for Wahoo, Garmin and future dated wearable sources." },
] as const;

function GuideList({ guides, start = 1 }: Readonly<{ guides: typeof useCases | typeof liveGuides; start?: number }>) {
  return <div className="guides-index-list" aria-label="Guides">{guides.map((guide, index) => <Link href={guide.href} key={guide.href}>
    <span>{String(index + start).padStart(2, "0")}</span><div><h2>{guide.label}</h2><p>{guide.description}</p></div><b aria-hidden="true">↗</b>
  </Link>)}</div>;
}

export default function AiGuidesPage() {
  return <main className="guides-index">
    <SiteHeader />
    <section className="guides-index-hero shell">
      <p className="guide-breadcrumb"><Link href="/">TRAPEAK</Link><span>/</span><strong>AI guides</strong></p>
      <div className="eyebrow"><span className="live-dot" /> Practical product guides</div>
      <h1>Start with<br />a real question.</h1>
      <p>See what works now, which facts are used, what stays private and where the product intentionally stops.</p>
    </section>
    <section className="shell guides-group"><p className="section-index">USE CASES</p><GuideList guides={useCases} /></section>
    <section className="shell guides-group"><p className="section-index">CONNECTION & MCP GUIDES</p><GuideList guides={liveGuides} start={6} /></section>
    <section className="guides-planned"><div className="shell"><p className="section-index light">PLANNED SOURCE</p><h2>Garmin is documented,<br />but not available yet.</h2><p>Provider-specific Garmin pages remain accessible for transparent roadmap context, but are excluded from search indexing until approval and a working integration exist.</p></div></section>
    <footer className="shell guide-footer"><div className="footer-brand"><Link className="wordmark" href="/" aria-label="TRAPEAK home"><BrandLogo /></Link><p>Permissioned fitness and health data for AI.</p></div><div><b>LEGAL</b><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/data-deletion">Data Deletion</Link></div><div><b>CONTACT</b><a href="mailto:support@trapeak.com">support@trapeak.com</a></div><p className="copyright">© 2026 TRAPEAK. Private beta.</p></footer>
  </main>;
}

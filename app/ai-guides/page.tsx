import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import { BrandLogo } from "../brand";

export const metadata: Metadata = {
  title: "AI guides",
  description: "Practical guides to the planned TRAPEAK connection between authorized fitness data and MCP-compatible AI assistants.",
  alternates: { canonical: "/ai-guides" },
};

const guides = [
  { href: "/wahoo-to-chatgpt", label: "Wahoo to ChatGPT", description: "How the Wahoo connection in development is intended to bring authorized workout data into ChatGPT." },
  { href: "/wahoo-to-claude", label: "Wahoo to Claude", description: "How Claude could use authorized Wahoo workout data through a personal TRAPEAK MCP connection." },
  { href: "/wahoo-mcp", label: "Wahoo MCP", description: "The planned read-only MCP layer for querying user-authorized Wahoo workout data." },
  { href: "/garmin-to-chatgpt", label: "Garmin to ChatGPT", description: "How the planned connection is intended to bring authorized Garmin activity data into ChatGPT." },
  { href: "/garmin-to-claude", label: "Garmin to Claude", description: "How Claude could use authorized Garmin activity data through a personal TRAPEAK MCP connection." },
  { href: "/garmin-mcp", label: "Garmin MCP", description: "The planned read-only MCP layer for querying authorized Garmin activity data." },
  { href: "/wearable-mcp", label: "Wearable MCP", description: "The roadmap for a permissioned data layer spanning Wahoo, Garmin and future wearable sources." },
];

export default function AiGuidesPage() {
  return (
    <main className="guides-index">
      <SiteHeader />
      <section className="guides-index-hero shell">
        <p className="guide-breadcrumb"><Link href="/">TRAPEAK</Link><span>/</span><strong>AI guides</strong></p>
        <div className="eyebrow"><span className="live-dot" /> Practical product guides</div>
        <h1>AI guides.</h1>
        <p>Clear explanations of how TRAPEAK is intended to connect user-authorized fitness data with MCP-compatible AI assistants. Wahoo is in development; Garmin remains planned pending API approval.</p>
      </section>
      <section className="guides-index-list shell" aria-label="AI guides">
        {guides.map((guide, index) => (
          <Link href={guide.href} key={guide.href}>
            <span>0{index + 1}</span>
            <div><h2>{guide.label}</h2><p>{guide.description}</p></div>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </section>
      <footer className="shell guide-footer">
        <div className="footer-brand"><Link className="wordmark" href="/" aria-label="TRAPEAK home"><BrandLogo /></Link><p>Fitness data infrastructure for AI.</p></div>
        <div><b>LEGAL</b><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/data-deletion">Data Deletion</Link></div>
        <div><b>CONTACT</b><a href="mailto:support@trapeak.com">support@trapeak.com</a></div>
        <p className="copyright">© 2026 TRAPEAK. Product in development. Third-party names and trademarks are used descriptively and do not imply endorsement or partnership.</p>
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wahoo to Claude via MCP — Connection in Development",
  description: "See how TRAPEAK is building a secure, user-specific MCP connection for using authorized Wahoo workout data with Claude.",
  alternates: { canonical: "/wahoo-to-claude" },
  openGraph: {
    title: "Wahoo to Claude via MCP — Connection in Development",
    description: "A user-authorized MCP path in development from Wahoo workout data to Claude.",
    url: "https://trapeak.com/wahoo-to-claude",
  },
};

export default function WahooToClaudePage() {
  return <AiSearchPage
    slug="wahoo-to-claude"
    eyebrow="Wahoo to Claude"
    title="Give Claude your workout context."
    intro="TRAPEAK is building a remote, user-specific MCP connection for bringing authorized Wahoo workout data to Claude. Wahoo API access is approved, and implementation is underway."
    summary="Instead of exporting workout files for every conversation, the MCP connection is designed to let Claude request only the relevant parts of your authorized training history."
    statusLabel="IN DEVELOPMENT"
    status="The Wahoo Cloud API application is approved, but the connection described here is not yet publicly available. Compatibility also depends on the Claude client used by the user."
    steps={[
      { title: "Authorize Wahoo", description: "When released, approve read access through Wahoo's official OAuth consent flow. Access is designed to be revocable." },
      { title: "Connect Claude", description: "Add your personal TRAPEAK MCP endpoint to a Claude experience that supports remote MCP connections." },
      { title: "Continue the conversation", description: "Claude can call the relevant TRAPEAK tools when a question needs workout history or activity detail." },
    ]}
    dataTitle="A structured workout history."
    dataIntro="TRAPEAK is designed to normalize authorized Wahoo workout data before presenting it to an AI client. Exact coverage will be validated during development."
    dataPoints={["Completed workouts and basic summaries", "Distance, duration, speed, heart rate and power where available", "Detailed workout files when available and authorized", "A consistent format designed for future fitness sources"]}
    prompts={["Explain the trend across my last month of rides.", "Compare sessions completed at a similar effort.", "Which workout changed my weekly volume the most?"]}
    sourceNote="Wahoo API access is approved, and the connection remains in development."
    faqs={[
      { question: "Does Claude connect directly to Wahoo?", answer: "Not through TRAPEAK. TRAPEAK is designed to obtain user-authorized data from Wahoo and expose only the requested data through a personal MCP connection." },
      { question: "Is the Wahoo-to-Claude connection available now?", answer: "No. Wahoo API access is approved and implementation is underway, but public access has not opened." },
      { question: "Can access be revoked?", answer: "Yes, that is a core product requirement. Planned controls let users disconnect their AI client, disconnect Wahoo, and request deletion of stored data." },
      { question: "Is TRAPEAK an official Wahoo or Anthropic partner?", answer: "References to Wahoo and Claude describe intended compatibility and do not imply endorsement, affiliation, or partnership." },
    ]}
  />;
}

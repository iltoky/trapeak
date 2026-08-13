import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wahoo to Claude via MCP — Private Beta",
  description: "Use TRAPEAK private beta to make authorized Wahoo workout data available to Claude through a secure, user-specific MCP connection.",
  alternates: { canonical: "/wahoo-to-claude" },
  openGraph: {
    title: "Wahoo to Claude via MCP — Private Beta",
    description: "A private-beta, user-authorized MCP path from Wahoo workout data to Claude.",
    url: "https://trapeak.com/wahoo-to-claude",
  },
};

export default function WahooToClaudePage() {
  return <AiSearchPage
    slug="wahoo-to-claude"
    eyebrow="Wahoo to Claude"
    title="Give Claude your workout context."
    intro="TRAPEAK provides a production remote MCP endpoint for bringing authorized Wahoo workout data to Claude. Availability depends on a Claude client that supports authenticated remote MCP."
    summary="Instead of exporting workout files for every conversation, the MCP connection is designed to let Claude request only the relevant parts of your authorized training history."
    statusLabel="PRIVATE BETA"
    status="The Wahoo connection is live for authenticated beta users. Compatibility depends on the Claude client used by the user."
    steps={[
      { title: "Authorize Wahoo", description: "Approve read access through Wahoo's official OAuth consent flow. Access is revocable." },
      { title: "Connect Claude", description: "Add your personal TRAPEAK MCP endpoint to a Claude experience that supports remote MCP connections." },
      { title: "Continue the conversation", description: "Claude can call the relevant TRAPEAK tools when a question needs workout history or activity detail." },
    ]}
    dataTitle="A structured workout history."
    dataIntro="TRAPEAK normalizes authorized Wahoo workout data before presenting it to an AI client. Coverage depends on fields returned by Wahoo."
    dataPoints={["Completed workouts and basic summaries", "Distance, duration, speed, heart rate and power where available", "Detailed workout files when available and authorized", "A consistent format designed for future fitness sources"]}
    prompts={["Explain the trend across my last month of rides.", "Compare sessions completed at a similar effort.", "Which workout changed my weekly volume the most?"]}
    sourceNote="Wahoo is available in the authenticated TRAPEAK private beta."
    faqs={[
      { question: "Does Claude connect directly to Wahoo?", answer: "Not through TRAPEAK. TRAPEAK is designed to obtain user-authorized data from Wahoo and expose only the requested data through a personal MCP connection." },
      { question: "Is the Wahoo-to-Claude connection available now?", answer: "The TRAPEAK endpoint is live for authenticated beta users. The Claude client must support the required remote MCP and OAuth flow." },
      { question: "Can access be revoked?", answer: "Yes. Users can remove the AI connection, disconnect Wahoo, and request deletion of stored data." },
      { question: "Is TRAPEAK an official Wahoo or Anthropic partner?", answer: "References to Wahoo and Claude describe intended compatibility and do not imply endorsement, affiliation, or partnership." },
    ]}
  />;
}

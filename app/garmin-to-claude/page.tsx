import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Garmin to Claude via MCP — Planned Connection",
  description: "See how TRAPEAK plans to connect user-authorized Garmin activity data to Claude through a secure, user-specific MCP endpoint.",
  alternates: { canonical: "/garmin-to-claude" },
  openGraph: {
    title: "Garmin to Claude via MCP — Planned Connection",
    description: "A planned MCP path for using authorized Garmin activity data with Claude.",
    url: "https://trapeak.com/garmin-to-claude",
  },
};

export default function GarminToClaudePage() {
  return <AiSearchPage
    slug="garmin-to-claude"
    eyebrow="Garmin to Claude"
    title="Give Claude your training context."
    intro="TRAPEAK plans to add user-authorized Garmin activity data to its remote, user-specific MCP connection. Garmin is not available and depends on provider approval."
    summary="Instead of exporting FIT files for every conversation, the planned MCP connection lets Claude request the relevant parts of your authorized training history."
    statusLabel="PLANNED"
    status="The connection described here is a product plan, not a currently available integration. TRAPEAK has no official partnership with Garmin or Anthropic."
    steps={[
      { title: "Approve the source", description: "After release, authorize Garmin through its official consent flow. Access is intended to be read-only and revocable." },
      { title: "Connect Claude", description: "Add your personal TRAPEAK MCP endpoint to a Claude experience that supports remote MCP connections." },
      { title: "Continue the conversation", description: "Claude can call the relevant TRAPEAK tools when your question needs training history or activity detail." },
    ]}
    dataTitle="A structured training history."
    dataIntro="TRAPEAK is designed to normalize approved activity data before presenting it to an AI client. Planned coverage begins with running and cycling."
    dataPoints={["Completed activities and basic summaries", "Distance, duration, pace or speed and heart-rate data where available", "Activity laps and detailed samples when permitted", "A consistent format designed for later wearable sources"]}
    prompts={["Explain the trend across my last month of runs.", "Compare my easy runs at a similar pace.", "Which workout changed my weekly load the most?"]}
    sourceNote="Garmin remains a planned source and is subject to provider approval."
    faqs={[
      { question: "Does Claude connect directly to Garmin?", answer: "Not through TRAPEAK. The planned architecture has TRAPEAK obtain user-authorized data from Garmin and expose only the requested data through a personal MCP connection." },
      { question: "Is the Garmin-to-Claude connection available now?", answer: "No. Garmin depends on provider approval, as well as compatibility with the Claude client used by the user." },
      { question: "Can access be revoked?", answer: "That is a core product requirement. The planned controls allow users to disconnect their AI client, disconnect the fitness source, and request deletion of stored data." },
      { question: "Is TRAPEAK an official Garmin or Anthropic partner?", answer: "No. References to Garmin and Claude describe intended compatibility and do not imply endorsement, affiliation, or partnership." },
    ]}
  />;
}

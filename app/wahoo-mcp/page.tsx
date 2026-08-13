import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wahoo MCP Server — Private Beta",
  description: "TRAPEAK provides a user-specific MCP server for authorized Wahoo workout data, nutrition records, and laboratory results in private beta.",
  alternates: { canonical: "/wahoo-mcp" },
  openGraph: {
    title: "Wahoo MCP Server — Private Beta",
    description: "Production private-beta MCP tools for secure, user-authorized Wahoo workout data.",
    url: "https://trapeak.com/wahoo-mcp",
  },
};

export default function WahooMcpPage() {
  return <AiSearchPage
    slug="wahoo-mcp"
    eyebrow="Wahoo MCP"
    title="A personal Wahoo MCP connection."
    intro="TRAPEAK runs a production remote MCP server that exposes user-authorized Wahoo workout data to compatible AI clients. Fitness tools are read-only; Nutrition and Labs write tools require an explicit user request."
    summary="The Wahoo MCP is designed as a controlled interface: an AI requests a specific workout or time range, and TRAPEAK returns only the authorized data for that user."
    statusLabel="PRIVATE BETA"
    status="The MCP endpoint, Clerk OAuth, Wahoo connection, and ten v0.6.0 tools are deployed. Authenticated Nutrition and Labs e2e validation remains in progress."
    steps={[
      { title: "Identify the user", description: "Every MCP request is tied to an authenticated TRAPEAK user rather than a shared global API key." },
      { title: "Request the minimum", description: "A compatible AI client calls a scoped tool for a date range, workout type, summary or individual workout." },
      { title: "Return normalized data", description: "TRAPEAK returns authorized fields without exposing Wahoo credentials; writes occur only after an explicit request." },
    ]}
    dataTitle="Tools built around questions."
    dataIntro="The v0.6.0 contract has ten scoped tools across fitness, nutrition, and laboratory records."
    dataPoints={["Read athlete profiles, activity lists and individual workouts", "Save and summarize nutrition after explicit user instruction", "Save laboratory reports and retrieve indicator history", "Return data only for the authenticated owner"]}
    prompts={["Get my cycling workouts from the last 30 days.", "Show the heart-rate and power summary for yesterday's ride.", "Compare weekly distance over the last eight weeks."]}
    sourceNote="Wahoo is available in the authenticated TRAPEAK private beta."
    faqs={[
      { question: "Is there a Wahoo MCP endpoint now?", answer: "Yes. https://trapeak.com/mcp is live for authenticated private-beta users; general public distribution has not started." },
      { question: "Is this Wahoo's official MCP server?", answer: "No. TRAPEAK is an independent product. Wahoo's approval of API access does not imply that Wahoo operates or endorses the TRAPEAK MCP server." },
      { question: "Can one user see another user's workouts?", answer: "No. Every database query is scoped to the user ID from the verified OAuth token." },
      { question: "Will the MVP write workouts back to Wahoo?", answer: "No. The MVP is read-only. Creating or modifying workouts is outside the current scope." },
    ]}
  />;
}

import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Garmin MCP Server — Planned Read-Only Access",
  description: "TRAPEAK is developing a user-specific MCP server for authorized Garmin activity data. Learn about the planned tools, security model and status.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/garmin-mcp" },
  openGraph: {
    title: "Garmin MCP Server — Planned Read-Only Access",
    description: "Planned MCP tools for secure, user-authorized Garmin activity data.",
    url: "https://trapeak.com/garmin-mcp",
  },
};

export default function GarminMcpPage() {
  return <AiSearchPage
    slug="garmin-mcp"
    eyebrow="Garmin MCP"
    title="A personal Garmin MCP connection."
    intro="TRAPEAK plans to add user-authorized Garmin activity data to its existing remote MCP server. The Garmin source is not available and depends on provider approval."
    summary="The planned Garmin MCP is a controlled interface: the AI requests a specific activity or time range, and TRAPEAK returns only the authorized data for that user."
    statusLabel="PLANNED"
    status="Garmin access is pending review. Tool names and available fields remain provisional until the provider integration is approved and validated."
    steps={[
      { title: "Identify the user", description: "Every MCP request is designed to be tied to an authenticated TRAPEAK user rather than a shared global API key." },
      { title: "Request the minimum", description: "A compatible AI client calls a scoped tool for a date range, sport, summary or individual activity." },
      { title: "Return normalized data", description: "TRAPEAK returns the authorized fields in a consistent, read-only format without exposing provider credentials." },
    ]}
    dataTitle="Tools built around questions."
    dataIntro="The exact tool contract will be finalized during the MVP. The current plan prioritizes a small, clear read-only surface."
    dataPoints={["List activities by date range and sport", "Retrieve one activity with summaries and laps", "Compare activity metrics across a selected period", "Return data only for the authenticated owner"]}
    prompts={["Get my running activities from the last 30 days.", "Show the laps and heart-rate summary for yesterday's run.", "Compare weekly distance over the last eight weeks."]}
    sourceNote="Garmin remains a planned source and is subject to provider approval."
    faqs={[
      { question: "Is Garmin available through TRAPEAK MCP now?", answer: "No. The TRAPEAK MCP is live in private beta with Wahoo, but Garmin depends on provider approval and has not been implemented." },
      { question: "Is this Garmin's official MCP server?", answer: "No. TRAPEAK is an independent product and is not currently an official Garmin partner. Garmin does not operate or endorse the planned TRAPEAK MCP." },
      { question: "Can one user see another user's activities?", answer: "The planned architecture requires strict per-user authorization and isolation. A model must not be able to enumerate or request another user's data." },
      { question: "Will the MVP write workouts back to Garmin?", answer: "No. The MVP is planned as read-only. Creating or modifying workouts is outside the current scope." },
    ]}
  />;
}

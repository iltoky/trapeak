import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Garmin MCP Server — Planned Read-Only Access",
  description: "TRAPEAK is developing a user-specific MCP server for authorized Garmin activity data. Learn about the planned tools, security model and status.",
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
    intro="TRAPEAK is developing a remote MCP server intended to expose user-authorized Garmin activity data to compatible AI clients. It is read-only by design for the MVP and is not yet available."
    summary="The planned Garmin MCP is a controlled interface: the AI requests a specific activity or time range, and TRAPEAK returns only the authorized data for that user."
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
    faqs={[
      { question: "Is there a public Garmin MCP endpoint now?", answer: "No. TRAPEAK MCP is in development. Production access depends on completion of the product and approval of the Garmin integration." },
      { question: "Is this Garmin's official MCP server?", answer: "No. TRAPEAK is an independent product and is not currently an official Garmin partner. Garmin does not operate or endorse the planned TRAPEAK MCP." },
      { question: "Can one user see another user's activities?", answer: "The planned architecture requires strict per-user authorization and isolation. A model must not be able to enumerate or request another user's data." },
      { question: "Will the MVP write workouts back to Garmin?", answer: "No. The MVP is planned as read-only. Creating or modifying workouts is outside the current scope." },
    ]}
  />;
}

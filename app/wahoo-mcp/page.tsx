import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wahoo MCP Server — Read-Only Access in Development",
  description: "TRAPEAK is building a user-specific MCP server for authorized Wahoo workout data. Learn about the planned tools, security model and status.",
  alternates: { canonical: "/wahoo-mcp" },
  openGraph: {
    title: "Wahoo MCP Server — Read-Only Access in Development",
    description: "MCP tools in development for secure, user-authorized Wahoo workout data.",
    url: "https://trapeak.com/wahoo-mcp",
  },
};

export default function WahooMcpPage() {
  return <AiSearchPage
    slug="wahoo-mcp"
    eyebrow="Wahoo MCP"
    title="A personal Wahoo MCP connection."
    intro="TRAPEAK is building a remote MCP server for exposing user-authorized Wahoo workout data to compatible AI clients. The MVP is read-only by design and is not publicly available yet."
    summary="The Wahoo MCP is designed as a controlled interface: an AI requests a specific workout or time range, and TRAPEAK returns only the authorized data for that user."
    statusLabel="IN DEVELOPMENT"
    status="Wahoo has approved the TRAPEAK Cloud API application. Tool names and available fields remain provisional until implementation and security testing are complete."
    steps={[
      { title: "Identify the user", description: "Every MCP request is designed to be tied to an authenticated TRAPEAK user rather than a shared global API key." },
      { title: "Request the minimum", description: "A compatible AI client calls a scoped tool for a date range, workout type, summary or individual workout." },
      { title: "Return normalized data", description: "TRAPEAK returns authorized fields in a consistent, read-only format without exposing Wahoo credentials." },
    ]}
    dataTitle="Tools built around questions."
    dataIntro="The exact tool contract will be finalized during the MVP. The current plan prioritizes a small, clear read-only surface."
    dataPoints={["List workouts by date range and type", "Retrieve one workout and its available summary", "Compare workout metrics across a selected period", "Return data only for the authenticated owner"]}
    prompts={["Get my cycling workouts from the last 30 days.", "Show the heart-rate and power summary for yesterday's ride.", "Compare weekly distance over the last eight weeks."]}
    sourceNote="Wahoo API access is approved, and the connection remains in development."
    faqs={[
      { question: "Is there a public Wahoo MCP endpoint now?", answer: "No. TRAPEAK MCP is in development. Public access will open only after the connection and its security controls are completed and validated." },
      { question: "Is this Wahoo's official MCP server?", answer: "No. TRAPEAK is an independent product. Wahoo's approval of API access does not imply that Wahoo operates or endorses the TRAPEAK MCP server." },
      { question: "Can one user see another user's workouts?", answer: "The architecture requires strict per-user authorization and isolation. A model must not be able to enumerate or request another user's data." },
      { question: "Will the MVP write workouts back to Wahoo?", answer: "No. The MVP is read-only. Creating or modifying workouts is outside the current scope." },
    ]}
  />;
}

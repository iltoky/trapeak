import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wahoo to ChatGPT — Fitness Data via MCP",
  description: "See how TRAPEAK is building a secure, user-specific MCP connection for bringing authorized Wahoo workout data to ChatGPT.",
  alternates: { canonical: "/wahoo-to-chatgpt" },
  openGraph: {
    title: "Wahoo to ChatGPT — Fitness Data via MCP",
    description: "A secure path in development from user-authorized Wahoo workout data to ChatGPT through TRAPEAK MCP.",
    url: "https://trapeak.com/wahoo-to-chatgpt",
  },
};

export default function WahooToChatGPTPage() {
  return <AiSearchPage
    slug="wahoo-to-chatgpt"
    eyebrow="Wahoo to ChatGPT"
    title="Bring Wahoo context to ChatGPT."
    intro="TRAPEAK is building a personal MCP connection that will let users authorize their Wahoo workout data and make selected data available to ChatGPT. Wahoo has approved the Cloud API application; the connection is not publicly available yet."
    summary="TRAPEAK provides the secure data connection; ChatGPT remains the place where you ask questions and receive answers."
    statusLabel="IN DEVELOPMENT"
    status="Wahoo API access is approved and implementation is underway. Public access will open after the connection and its security controls are completed and validated."
    steps={[
      { title: "Authorize Wahoo", description: "When released, connect through Wahoo's official OAuth consent flow and grant only the requested permissions." },
      { title: "Add TRAPEAK to ChatGPT", description: "Connect a user-specific, read-only TRAPEAK MCP endpoint in a supported ChatGPT experience." },
      { title: "Ask with real context", description: "ChatGPT can request the relevant authorized workout data and use it to formulate an answer." },
    ]}
    dataTitle="Workout details, not screenshots."
    dataIntro="The first version is focused on completed workouts available through approved Wahoo scopes. Exact fields will be finalized during integration testing."
    dataPoints={["Workout type, date and duration", "Distance, speed, heart rate, power and cadence summaries where available", "Detailed workout files only when available and authorized", "Data returned only for the authenticated owner"]}
    prompts={["Compare my last four rides and identify the biggest change.", "Was yesterday's heart rate unusual for that effort?", "Summarize my cycling volume over the last six weeks."]}
    sourceNote="Wahoo API access is approved, and the connection remains in development."
    faqs={[
      { question: "Can I connect Wahoo to ChatGPT through TRAPEAK today?", answer: "Not yet. Wahoo has approved the TRAPEAK Cloud API application, and implementation is underway. The connection has not been released publicly." },
      { question: "Is TRAPEAK affiliated with Wahoo or OpenAI?", answer: "No partnership or endorsement is implied. Product and company names are used only to describe intended compatibility." },
      { question: "Will ChatGPT receive my Wahoo password?", answer: "No. The planned flow uses Wahoo's OAuth authorization. TRAPEAK will not ask for or store your Wahoo password, and the AI client will not receive provider credentials." },
      { question: "Who creates the answer?", answer: "ChatGPT creates the answer. TRAPEAK provides structured, authorized data and does not itself generate coaching or medical recommendations." },
    ]}
  />;
}

import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Garmin to ChatGPT — Planned Secure Connection",
  description: "Learn how TRAPEAK plans to make user-authorized Garmin activity data available to ChatGPT through a secure, personal MCP connection.",
  alternates: { canonical: "/garmin-to-chatgpt" },
  openGraph: {
    title: "Garmin to ChatGPT — Planned Secure Connection",
    description: "A planned, user-authorized path from Garmin activity data to ChatGPT through TRAPEAK MCP.",
    url: "https://trapeak.com/garmin-to-chatgpt",
  },
};

export default function GarminToChatGPTPage() {
  return <AiSearchPage
    slug="garmin-to-chatgpt"
    eyebrow="Garmin to ChatGPT"
    title="Bring Garmin context to ChatGPT."
    intro="TRAPEAK plans to let users authorize Garmin activity data through its existing personal MCP connection. The Garmin integration is not available and depends on Garmin approval."
    summary="TRAPEAK plans to provide the secure data connection; ChatGPT remains the place where you ask questions and receive answers."
    statusLabel="PLANNED"
    status="Garmin API access has not yet been approved. TRAPEAK is not an official Garmin partner, and this connection is not currently available."
    steps={[
      { title: "Authorize Garmin", description: "When the integration is approved and released, connect through Garmin's official authorization flow and choose the permitted access." },
      { title: "Add TRAPEAK to ChatGPT", description: "Connect a user-specific, read-only TRAPEAK MCP endpoint in a supported ChatGPT experience." },
      { title: "Ask with real context", description: "ChatGPT can request only the data needed for your question and use it to formulate an answer." },
    ]}
    dataTitle="Activity details, not screenshots."
    dataIntro="The first version is planned around completed running and cycling activities. Exact fields depend on the Garmin APIs and permissions approved for TRAPEAK."
    dataPoints={["Activity type, date, duration and distance", "Pace, speed, heart-rate summaries and laps where available", "Detailed samples or route data only when approved and authorized", "Sleep and recovery data considered for a later stage"]}
    prompts={["Compare my last four runs and identify the biggest change.", "Was yesterday's heart rate unusual for that pace?", "Summarize my running volume over the last six weeks."]}
    sourceNote="Garmin remains a planned source and is subject to provider approval."
    faqs={[
      { question: "Can I connect Garmin to ChatGPT through TRAPEAK today?", answer: "No. TRAPEAK is live in private beta with Wahoo, while Garmin remains planned and subject to provider review and approval." },
      { question: "Is TRAPEAK affiliated with Garmin or OpenAI?", answer: "No. TRAPEAK is not currently an official Garmin partner and is not affiliated with OpenAI. Product and company names are used only to describe intended compatibility." },
      { question: "Will ChatGPT receive my Garmin password?", answer: "No. The planned flow uses provider authorization. TRAPEAK will not ask for or store your Garmin password, and the AI client will not receive provider credentials." },
      { question: "Who creates the answer?", answer: "ChatGPT creates the answer. TRAPEAK is designed to provide structured, authorized data and does not itself generate coaching or medical recommendations." },
    ]}
  />;
}

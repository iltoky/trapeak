import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wahoo to ChatGPT — Fitness Data via MCP",
  description: "Use TRAPEAK private beta to bring authorized Wahoo workout data to ChatGPT through a secure, user-specific MCP connection.",
  alternates: { canonical: "/wahoo-to-chatgpt" },
  openGraph: {
    title: "Wahoo to ChatGPT — Fitness Data via MCP",
    description: "A secure private-beta path from user-authorized Wahoo workout data to ChatGPT through TRAPEAK MCP.",
    url: "https://trapeak.com/wahoo-to-chatgpt",
  },
};

export default function WahooToChatGPTPage() {
  return <AiSearchPage
    slug="wahoo-to-chatgpt"
    eyebrow="Wahoo to ChatGPT"
    title="Bring Wahoo context to ChatGPT."
    intro="TRAPEAK private beta lets authenticated users authorize Wahoo workout data and make selected normalized records available to ChatGPT through a personal MCP connection."
    summary="TRAPEAK provides the secure data connection; ChatGPT remains the place where you ask questions and receive answers."
    statusLabel="PRIVATE BETA"
    status="The production MCP and Wahoo OAuth connection are live for authenticated beta users. General public distribution has not started."
    steps={[
      { title: "Authorize Wahoo", description: "Connect through Wahoo's official OAuth consent flow and grant only the requested permissions." },
      { title: "Add TRAPEAK to ChatGPT", description: "Connect your authenticated TRAPEAK MCP endpoint in a supported ChatGPT experience." },
      { title: "Ask with real context", description: "ChatGPT can request the relevant authorized workout data and use it to formulate an answer." },
    ]}
    dataTitle="Workout details, not screenshots."
    dataIntro="The private beta returns normalized completed workouts available through approved Wahoo scopes and only for the authenticated owner."
    dataPoints={["Workout type, date and duration", "Distance, speed, heart rate, power and cadence summaries where available", "Detailed workout files only when available and authorized", "Data returned only for the authenticated owner"]}
    prompts={["Compare my last four rides and identify the biggest change.", "Was yesterday's heart rate unusual for that effort?", "Summarize my cycling volume over the last six weeks."]}
    sourceNote="Wahoo is available in the authenticated TRAPEAK private beta."
    faqs={[
      { question: "Can I connect Wahoo to ChatGPT through TRAPEAK today?", answer: "Yes, if your account has access to the TRAPEAK private beta. General public distribution has not started." },
      { question: "Is TRAPEAK affiliated with Wahoo or OpenAI?", answer: "No partnership or endorsement is implied. Product and company names are used only to describe intended compatibility." },
      { question: "Will ChatGPT receive my Wahoo password?", answer: "No. The flow uses Wahoo OAuth. TRAPEAK does not ask for or store your Wahoo password, and the AI client does not receive provider credentials." },
      { question: "Who creates the answer?", answer: "ChatGPT creates the answer. TRAPEAK provides structured, authorized data and does not itself generate coaching or medical recommendations." },
    ]}
  />;
}

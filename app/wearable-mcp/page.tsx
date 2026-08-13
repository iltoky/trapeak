import type { Metadata } from "next";
import AiSearchPage from "../ai-search-page";

export const metadata: Metadata = {
  title: "Wearable MCP for Fitness Data — Product Roadmap",
  description: "TRAPEAK's roadmap for one secure MCP connection across wearable data sources. Wahoo is in development, while Garmin and other sources remain planned.",
  alternates: { canonical: "/wearable-mcp" },
  openGraph: {
    title: "Wearable MCP for Fitness Data — Product Roadmap",
    description: "One planned MCP layer for user-authorized wearable data across compatible AI clients.",
    url: "https://trapeak.com/wearable-mcp",
  },
};

export default function WearableMcpPage() {
  return <AiSearchPage
    slug="wearable-mcp"
    eyebrow="Wearable MCP"
    title="One wearable layer for compatible AI."
    intro="TRAPEAK's long-term direction is a single, user-controlled MCP connection for fitness and health data from multiple wearable sources. Wahoo is the first connection in development; no wearable connection is publicly available yet."
    summary="A wearable MCP can give an AI client one consistent way to request training context even when a user changes devices or combines several data sources."
    statusLabel="ROADMAP"
    status="Wahoo API access is approved and its connection is being built. Garmin is planned pending API approval, while Suunto remains under review. Other sources are roadmap candidates."
    steps={[
      { title: "Authorize each source", description: "Users connect only the wearable services they choose through each provider's approved authorization method." },
      { title: "Normalize the records", description: "TRAPEAK is designed to map different provider formats into a consistent activity and health model." },
      { title: "Use one MCP connection", description: "A compatible AI client requests the relevant normalized data without handling every provider API separately." },
    ]}
    dataTitle="A roadmap, not a compatibility claim."
    dataIntro="Provider coverage will be added only after technical validation, required approvals and clear user controls. Current source status:"
    dataPoints={["Wahoo — API access approved; connection in development", "Garmin — planned; API access pending provider approval", "Suunto — API application under review", "Polar, Oura, Apple Health and Health Connect — later-stage candidates"]}
    prompts={["Compare my training volume across devices.", "Relate my recent sleep to my running intensity.", "Build one timeline from my watch and fitness history."]}
    sourceNote="Wahoo is in development; all other source statuses are described on this page."
    faqs={[
      { question: "Which wearables does TRAPEAK support today?", answer: "None are publicly available yet. Wahoo API access is approved and the connection is in development. Garmin is planned pending API approval, and Suunto remains under review." },
      { question: "Why use one MCP for several wearables?", answer: "A normalized connection can reduce provider-specific work for AI clients and preserve a consistent user history across devices." },
      { question: "Are Garmin, Suunto, Polar or Apple Health confirmed?", answer: "Garmin is planned but awaits API approval. Suunto is under review. Polar and Apple Health are roadmap candidates, not confirmed or available integrations." },
      { question: "Does TRAPEAK own or represent these wearable brands?", answer: "No. TRAPEAK is independent. Brand names are used descriptively and do not imply affiliation, endorsement, or partnership." },
    ]}
  />;
}

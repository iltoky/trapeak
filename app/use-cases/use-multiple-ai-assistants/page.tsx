import type { Metadata } from "next";
import { UseCasePage } from "../use-case-page";

export const metadata: Metadata = { title: "Use multiple AI assistants with one fitness history", description: "Record with one compatible AI, analyze or visualize with another and keep your fitness and health history in TRAPEAK when models change.", alternates: { canonical: "/use-cases/use-multiple-ai-assistants" } };

export default function Page() {
  return <UseCasePage
    slug="use-multiple-ai-assistants"
    eyebrow="Multiple AI assistants"
    title="Change the intelligence. Keep the history."
    intro="TRAPEAK separates the durable data layer from the assistant interface. Use voice where it works best, deep analysis somewhere else and a different model later without rebuilding your profile."
    directAnswer="The same authenticated MCP data layer lets different compatible assistants work with the history you authorize instead of trapping it inside one conversation."
    currentStatus="TRAPEAK remote MCP is live in private beta. Actual client capabilities such as voice, charts and document reading depend on the chosen AI."
    dataUsed={["One owner-scoped workout, nutrition, laboratory, weight and Profile history.", "The same server-side permission and authentication boundary for every compatible client.", "Explicit write rules: an AI may save data only when the user asks.", "Audit context for delegated reads, including the OAuth client identifier when available."]}
    question="I recorded meals by voice in ChatGPT this week. Use the same TRAPEAK history to compare nutrition with my four latest runs and build a simple chart."
    answer={["I found the shared TRAPEAK nutrition and workout history for your authenticated account. I will keep missing days separate from zero intake and show which runs have complete heart-rate or load data.", "The chart and interpretation are created here; the source history remains in TRAPEAK for the next compatible assistant you choose."]}
    starterRequest="Use only my authenticated TRAPEAK data for this analysis. State which sources and date ranges are available, distinguish missing data from zero, and explain any assumptions. Do not save, update or delete anything unless I explicitly ask."
    limitations={["TRAPEAK does not transfer conversation history or private model memory between AI providers.", "Each AI client must support the required MCP connection and its own requested output, such as charts or voice.", "A connected AI cannot exceed the data permissions enforced by TRAPEAK.", "Changing AI does not make unsupported data sources appear."]}
    faqs={[{ question: "Does TRAPEAK copy chats between AI assistants?", answer: "No. It provides the same structured personal data, not private chat history or model memory." }, { question: "Can one AI write and another read?", answer: "Yes. Explicitly saved records become part of the owner's TRAPEAK history and can be read by another authorized compatible client." }, { question: "Does every AI have identical features?", answer: "No. Voice, document understanding, charts and planning quality depend on the selected client and model." }]}
  />;
}

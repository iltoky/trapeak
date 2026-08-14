import type { Metadata } from "next";
import { UseCasePage } from "../use-case-page";

export const metadata: Metadata = { title: "Log nutrition with an AI assistant", description: "Record meals by voice, text or an AI-interpreted image while keeping calories, macros and estimation assumptions in your TRAPEAK history.", alternates: { canonical: "/use-cases/log-nutrition-with-ai" } };

export default function Page() {
  return <UseCasePage
    slug="log-nutrition-with-ai"
    eyebrow="Log nutrition with AI"
    title="Describe the meal. Keep the structured history."
    intro="Use the input method that is easiest in your chosen AI. TRAPEAK stores the resulting meal description, calories, macros and the assumptions behind an estimate."
    directAnswer="Nutrition logging becomes a natural conversation while the durable record remains independent of the AI that interpreted it."
    currentStatus="Nutrition creation, daily summaries, history and deletion are live. AI-created estimates require explicit assumptions."
    dataUsed={["Consumption time and meal type.", "The full user-provided meal description.", "Calories, protein, carbohydrates and fat prepared by the connected AI.", "A visible estimated flag and the assumptions used when exact quantities were not supplied."]}
    question="Log breakfast: a three-egg omelette, half an avocado, two gluten-free crispbreads and black coffee."
    answer={["Breakfast saved: approximately 520 kcal, 26 g protein, 29 g carbohydrates and 34 g fat.", "I used standard egg sizes and about 100 g of avocado. The values are marked as estimated so those assumptions remain visible later."]}
    starterRequest="Use TRAPEAK to record the meal I describe. Preserve my full description, calculate calories and macros, and clearly state every quantity assumption. If my request is only to estimate or discuss the meal, do not save it until I explicitly ask."
    limitations={["An estimate is not a laboratory measurement and can differ from the actual recipe or portion.", "TRAPEAK does not silently infer meals from unrelated conversations.", "Food photos are interpreted by the chosen AI; TRAPEAK stores the structured result, not its own computer-vision analysis.", "Nutrition records support context and tracking but do not replace advice from a qualified dietitian."]}
    faqs={[{ question: "Can I speak instead of typing?", answer: "Yes, when your chosen AI supports voice input. The AI converts your description into the structured fields sent to TRAPEAK." }, { question: "Can another AI analyze the meals later?", answer: "Yes. Your authorized history stays in TRAPEAK and can be read by another compatible AI client." }, { question: "Can I delete a meal?", answer: "Yes. Deletion is owner-scoped, requires an explicit request or dashboard confirmation and is permanent." }]}
  />;
}

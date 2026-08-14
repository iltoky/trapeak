import type { Metadata } from "next";
import { UseCasePage } from "../use-case-page";

export const metadata: Metadata = { title: "AI workout recommendations from your own data", description: "Use previous workouts, goals, constraints, nutrition, weight and a fresh check-in to choose or adjust today's training with a compatible AI.", alternates: { canonical: "/use-cases/ai-workout-recommendations" } };

export default function Page() {
  return <UseCasePage
    slug="ai-workout-recommendations"
    eyebrow="AI workout recommendations"
    title="Choose today’s training with the full picture."
    intro="TRAPEAK gives your chosen AI a transparent history of training, goals, constraints, nutrition and weight—then asks for the fresh human context that a database cannot know."
    directAnswer="A good training decision is not a score or a single rule. It is an explainable choice made from your individual history, available measurements and how you feel now."
    currentStatus="Historical training context is live. Sleep, HRV and recovery measurements are reported as unavailable until a supported source is connected."
    dataUsed={["Completed workouts and their sequence, type, duration, heart rate and available provider load metrics.", "Goals, training experience, preferences, schedule, injuries, contraindications and medications explicitly saved in Profile.", "Recent nutrition, dated weight history and honest source-coverage limitations.", "A fresh check-in about energy, soreness or pain, illness symptoms, sleep quality, willingness to train and available time."]}
    question="What training would suit me today? I have 45 minutes and feel good."
    answer={["A relaxed 30–35 minute run at conversational pace, followed by 5–10 minutes of mobility, fits today well.", "Yesterday supplied a demanding interval stimulus, while your overall week remains moderate. This keeps your consistency without stacking another hard session. Your carbohydrates were lower than usual, so a small snack before the run may help."]}
    starterRequest="Use TRAPEAK to load my training context before recommending today's session. Consider my goals, medical constraints, previous workout sequence, recent load, nutrition and weight together. Ask briefly how I feel now and how much time I have. Explain the main factors behind the recommendation and do not invent sleep or recovery measurements that are unavailable."
    limitations={["TRAPEAK does not calculate a universal readiness score or prescribe automatically.", "A TSS threshold or two demanding sessions in sequence is only one signal, not a standalone decision.", "Missing sleep, HRV or recovery measurements are never replaced with AI estimates.", "Training guidance is not medical advice; pain, illness or medical concerns require an appropriate professional."]}
    faqs={[{ question: "Does TRAPEAK create the workout?", answer: "The connected AI or a real coach creates the recommendation or plan. TRAPEAK supplies the authorized structured context and its limitations." }, { question: "Does it know how I feel today?", answer: "Not automatically. When a dated subjective check-in is unavailable, the AI is instructed to ask you before choosing intensity." }, { question: "Can I use the same context with a coach?", answer: "Yes. You can grant temporary read-only Training access and optionally Nutrition access to a registered coach." }]}
  />;
}

import type { Metadata } from "next";
import { UseCasePage } from "../use-case-page";

export const metadata: Metadata = { title: "Share fitness or health data with a coach or doctor", description: "Grant a coach, doctor or dietitian temporary read-only access to selected TRAPEAK categories by email, with expiry, revoke and audit activity.", alternates: { canonical: "/use-cases/share-data-with-coach" } };

export default function Page() {
  return <UseCasePage
    slug="share-data-with-coach"
    eyebrow="Delegated access"
    title="Share the context—not your account."
    intro="Invite another registered TRAPEAK user by email, select only the categories they need and choose how long access should last."
    directAnswer="A coach can work with Training and Nutrition while Health stays locked. A doctor can receive Health only when you explicitly select it. Every grant is read-only, expiring and revocable."
    currentStatus="Email invitations, accept or reject, three selectable public categories, expiry, revoke, multiple athletes and owner-visible audit activity are live."
    dataUsed={["Training: workouts, training context, goals, experience, schedule and preferences.", "Nutrition: meals, daily summaries and dated weight history.", "Health: laboratory reports, conditions, injuries, contraindications and medications.", "Grant metadata: recipient email, selected categories, expiry, status and audited reads."]}
    question="I have reviewed your recent training and nutrition context. Can we move the quality session to Thursday and keep Tuesday as an easy run?"
    answer={["That gives you more space after the weekend load while preserving three running days. I can use the Training and Nutrition context you shared to adjust the week.", "Your Health category remains locked, so I cannot see laboratory results, conditions or medications unless you separately choose to grant it."]}
    starterRequest="Use TRAPEAK to list the people who shared data with me. Ask me which person I mean before reading a grant, use only the selected person's authorized categories, and never combine different athletes unless I explicitly request a comparison and every required permission is present."
    limitations={["An invitation works only for the specified primary email and becomes bound to that signed-in account.", "Delegated access is read-only; the recipient cannot modify or delete the owner's records.", "One grant never authorizes access to another athlete.", "Sharing data does not create a professional relationship or replace informed medical or coaching judgment."]}
    faqs={[{ question: "Can one coach work with several athletes?", answer: "Yes. The coach can accept separate grants from multiple athletes. Every grant has its own owner, categories and expiry." }, { question: "Can a coach see medications with Training access?", answer: "No. Medications and other sensitive medical context require the separate Health category." }, { question: "Can I stop access immediately?", answer: "Yes. The owner can revoke a pending or active grant at any time, and server-side reads stop immediately." }]}
  />;
}

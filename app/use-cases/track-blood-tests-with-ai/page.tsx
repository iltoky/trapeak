import type { Metadata } from "next";
import { UseCasePage } from "../use-case-page";

export const metadata: Metadata = { title: "Track blood-test and laboratory history with AI", description: "Keep exact reported laboratory values, units, reference ranges and flags in a structured history that you can review with AI or share with a doctor.", alternates: { canonical: "/use-cases/track-blood-tests-with-ai" } };

export default function Page() {
  return <UseCasePage
    slug="track-blood-tests-with-ai"
    eyebrow="Laboratory history"
    title="Turn separate reports into a reviewable history."
    intro="Ask a capable AI to read your laboratory document, review the extracted structure, then explicitly save the reported values in TRAPEAK for future retrieval."
    directAnswer="TRAPEAK preserves reported values, units, ranges and laboratory flags so you can retrieve a specific history without turning storage into diagnosis."
    currentStatus="Structured laboratory reports, exact result history, owner deletion and delegated Health access are live. TRAPEAK does not store the original PDF."
    dataUsed={["Collection date, test type, report title and laboratory name.", "Exact analyte names and original text values.", "Numeric values when present, with the reported units and reference ranges.", "The laboratory's own low, normal, high or other flag without independent diagnosis."]}
    question="Show my ALT and AST history from the stored laboratory reports so I can discuss it with my doctor."
    answer={["I found three reports containing ALT and AST. I kept each report's original units and reference range and did not compare points whose units are incompatible.", "I can format the dated values as a table for your appointment. Interpretation of causes or treatment should remain with your clinician."]}
    starterRequest="Read this laboratory report and prepare the exact reported values, units, reference ranges and flags for review. Show me the structure first. Save it to TRAPEAK only after my explicit instruction, preserve the original wording, and do not diagnose or invent missing values."
    limitations={["TRAPEAK stores structured values but does not perform its own OCR or retain the uploaded document.", "Reference ranges can differ by laboratory, method, age and other factors.", "The service does not diagnose conditions, recommend treatment or change medication.", "Health access is a separate sensitive permission and is never implied by Training access."]}
    faqs={[{ question: "Does TRAPEAK read the PDF itself?", answer: "No. The selected AI client reads the document and sends the reviewed structured result to TRAPEAK after an explicit save request." }, { question: "Can a doctor see the history?", answer: "Yes, if the doctor has a TRAPEAK account and you grant temporary read-only Health access to their email." }, { question: "Are abnormal flags a diagnosis?", answer: "No. They are stored as reported by the laboratory and require appropriate clinical interpretation." }]}
  />;
}

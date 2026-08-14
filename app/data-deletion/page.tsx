import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Data Deletion", description: "How to delete individual TRAPEAK records, disconnect sources, revoke shared access or request full account deletion.", alternates: { canonical: "/data-deletion" } };

export default function Deletion() {
  return <LegalPage eyebrow="LEGAL / 03" title="Data Deletion">
    <p>You control the records stored in TRAPEAK. Individual nutrition entries and laboratory reports can be permanently deleted in the authenticated dashboard or through a connected AI assistant after an explicit deletion request. Shared access can be revoked immediately from the dashboard. You can also request deletion of your full TRAPEAK account, custom profile, dated weight history, imported fitness profile, stored workouts, connected-provider records, access grants and support information associated with you.</p>
    <h2>Delete individual records</h2>
    <p>Use the Delete action in your dashboard, or explicitly ask your connected AI assistant to delete a specific TRAPEAK nutrition entry or laboratory report. Deleting a laboratory report also deletes all results stored inside it. These actions cannot be undone.</p>
    <h2>How to request deletion</h2>
    <ol>
      <li>First disconnect Wahoo in the TRAPEAK dashboard if you want to revoke future provider access.</li>
      <li>Email <a href="mailto:support@trapeak.com?subject=Data%20deletion%20request">support@trapeak.com</a> from the address associated with your TRAPEAK account.</li>
      <li>Use the subject line “Data deletion request”. Do not send passwords, access tokens, or sensitive health information.</li>
    </ol>
    <h2>What happens next</h2><p>We will acknowledge your request and may ask for limited information to verify your identity. Once verified, we will delete or anonymize eligible TRAPEAK data and confirm completion, normally within 30 days. Some records may be retained where required for security, fraud prevention, dispute resolution, or legal compliance.</p>
    <h2>Connected services</h2><p>Disconnecting a fitness source stops TRAPEAK from using its authorization but does not by itself delete workout data already stored in TRAPEAK. Deleting TRAPEAK data does not delete information held independently by Wahoo, ChatGPT, Codex, or another service you connected.</p>
    <h2>Need help?</h2><p>Contact <a href="mailto:support@trapeak.com">support@trapeak.com</a>.</p>
  </LegalPage>;
}

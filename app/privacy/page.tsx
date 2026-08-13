import { LegalPage } from "../legal-page";

export default function Privacy() {
  return <LegalPage eyebrow="LEGAL / 01" title="Privacy Policy">
    <p>This policy describes how TRAPEAK (“TRAPEAK”, “we”, “us”) handles personal data through trapeak.com and the limited beta TRAPEAK service. The legal operator, registered address, and applicable jurisdiction will be published before general public availability.</p>
    <h2>1. Information we collect</h2><p>We collect account details and identifiers, security and usage information, connected-client details, fitness profile and workout data that you explicitly authorize us to import, and nutrition records you choose to enter. We also receive information you choose to send to support.</p>
    <h2>2. How we use information</h2><p>We use information to authenticate users, operate and secure the service, synchronize authorized fitness data, respond to enquiries, and make requested data available to AI clients you connect. TRAPEAK does not generate AI analysis or recommendations itself.</p>
    <h2>3. Fitness sources and AI clients</h2><p>Connecting a fitness platform or AI client requires user action. We request only permissions needed for disclosed functionality and provide controls for revoking connections. Data requested by an AI client you connect may be processed under that client’s own terms and privacy policy. Wahoo is the currently supported fitness source; other sources remain subject to provider approval.</p>
    <h2>4. Sharing and processors</h2><p>We do not sell personal data. We disclose normalized fitness and nutrition data at your direction to an authenticated AI client you connect. We also use service providers for authentication, hosting, database infrastructure, analytics, email, and support, subject to their terms and appropriate safeguards.</p>
    <h2>5. Retention and security</h2><p>We retain personal data while an account is active and as needed for service operation, security, dispute resolution, or legal obligations. Provider access credentials are encrypted and raw provider payloads are not exposed through MCP. No online service can guarantee absolute security.</p>
    <h2>6. Your choices and rights</h2><p>Depending on your location, you may have rights to access, correct, delete, restrict, or export personal data and withdraw consent. You can disconnect Wahoo from the dashboard and remove TRAPEAK from your AI client. To request account or data deletion, email support@trapeak.com.</p>
    <h2>7. International processing and children</h2><p>Service providers and AI clients you choose may process data in other countries, subject to their terms and applicable safeguards. TRAPEAK is not intended for children under 16.</p>
    <h2>8. Changes and contact</h2><p>We may update this policy as the product evolves. Questions may be sent to <a href="mailto:support@trapeak.com">support@trapeak.com</a>.</p>
  </LegalPage>;
}

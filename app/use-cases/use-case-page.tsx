import Link from "next/link";

import "../guides.css";
import "../product.css";

import { BrandIcon, BrandLogo } from "../brand";
import { CopyRequestButton } from "../copy-request-button";
import { SiteHeader } from "../site-header";

export type UseCasePageProps = Readonly<{
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  directAnswer: string;
  currentStatus: string;
  dataUsed: readonly string[];
  question: string;
  answer: readonly string[];
  starterRequest: string;
  limitations: readonly string[];
  faqs: readonly Readonly<{ question: string; answer: string }>[];
}>;

const related = [
  ["/use-cases/ai-workout-recommendations", "AI workout recommendations"],
  ["/use-cases/log-nutrition-with-ai", "Log nutrition with AI"],
  ["/use-cases/track-blood-tests-with-ai", "Track blood-test history"],
  ["/use-cases/use-multiple-ai-assistants", "Use multiple AI assistants"],
  ["/use-cases/share-data-with-coach", "Share with a coach or doctor"],
] as const;

export function UseCasePage(props: UseCasePageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: props.title,
        url: `https://trapeak.com/use-cases/${props.slug}`,
        description: props.intro,
        isPartOf: { "@type": "WebSite", name: "TRAPEAK", url: "https://trapeak.com" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TRAPEAK", item: "https://trapeak.com" },
          { "@type": "ListItem", position: 2, name: "Use cases", item: "https://trapeak.com/#use-cases" },
          { "@type": "ListItem", position: 3, name: props.eyebrow, item: `https://trapeak.com/use-cases/${props.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: props.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return <main className="use-case-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <section className="use-case-hero shell">
      <p className="guide-breadcrumb"><Link href="/">TRAPEAK</Link><span>/</span><strong>{props.eyebrow}</strong></p>
      <div className="eyebrow"><span className="live-dot" /> Current use case</div>
      <h1>{props.title}</h1>
      <div><p>{props.intro}</p><aside><b>PRODUCT STATUS</b><span>AVAILABLE IN PRIVATE BETA</span><p>{props.currentStatus}</p></aside></div>
    </section>

    <section className="use-case-answer"><div className="shell"><p className="section-index">THE SHORT ANSWER</p><h2>{props.directAnswer}</h2></div></section>

    <section className="use-case-data shell">
      <div><p className="section-index">AUTHORIZED CONTEXT</p><h2>What TRAPEAK<br />makes available.</h2></div>
      <ol>{props.dataUsed.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol>
    </section>

    <section className="use-case-conversation">
      <div className="shell"><div><p className="section-index light">EXAMPLE CONVERSATION</p><h2>A useful answer,<br />grounded in context.</h2></div><article><div className="conversation-bubble user-bubble"><small>YOU</small><p>{props.question}</p></div><div className="conversation-bubble ai-bubble"><small>AI USING TRAPEAK</small>{props.answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></div>
    </section>

    <section className="starter-request shell">
      <div><p className="section-index">START WITH A QUESTION</p><h2>Copy, paste<br />and make it yours.</h2><p>This is a user request, not hidden system configuration. Your connected AI decides which authorized TRAPEAK tools to call.</p></div>
      <div className="request-card"><blockquote>{props.starterRequest}</blockquote><CopyRequestButton request={props.starterRequest} /></div>
    </section>

    <section className="use-case-limits"><div className="shell"><div><p className="section-index light">CLEAR BOUNDARIES</p><h2>What this does not assume.</h2></div><ul>{props.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></section>

    <section className="faq shell guide-faq"><p className="section-index">FAQ</p><h2>Direct answers.</h2>{props.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</section>

    <section className="use-case-related shell"><p className="section-index">RELATED USE CASES</p><div>{related.filter(([href]) => href !== `/use-cases/${props.slug}`).map(([href, label]) => <Link href={href} key={href}><span>{label}</span><b>↗</b></Link>)}</div></section>

    <section className="final-cta"><div className="shell"><BrandIcon className="cta-brand-icon" size={70} /><h2>Keep the context.</h2><p>Use it with the intelligence—or person—you choose.</p><Link className="button gradient" href="/sign-up">Create your account <span>↗</span></Link></div></section>
    <footer className="shell guide-footer"><div className="footer-brand"><Link href="/"><BrandLogo /></Link><p>Permissioned fitness and health data for AI.</p></div><div><b>EXPLORE</b><Link href="/ai-guides">AI guides</Link><Link href="/#how">How it works</Link></div><div><b>LEGAL</b><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/data-deletion">Data deletion</Link></div><div><b>CONTACT</b><a href="mailto:support@trapeak.com">support@trapeak.com</a></div><p className="copyright">© 2026 TRAPEAK. Private beta.</p></footer>
  </main>;
}

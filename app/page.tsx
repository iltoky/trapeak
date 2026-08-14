import type { Metadata } from "next";
import Link from "next/link";

import "./product.css";

import { BrandIcon, BrandLogo } from "./brand";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
  title: "Fitness and health data for any AI",
  description:
    "Keep workouts, nutrition, weight, health profile and laboratory history in one permissioned data layer. Use it with compatible AI assistants or share selected categories with a coach or doctor.",
  alternates: { canonical: "/" },
};

const categories = [
  {
    index: "01",
    title: "Training",
    description: "Workouts, historical load, goals, experience, schedule and preferences.",
    example: "Choose today's session or adjust a training week with your full context.",
  },
  {
    index: "02",
    title: "Nutrition",
    description: "Meals, daily calories and macros, estimation notes and dated weight history.",
    example: "Record by voice or text in one AI, then analyze patterns in another.",
  },
  {
    index: "03",
    title: "Health",
    description: "Laboratory history, conditions, injuries, contraindications and medications.",
    example: "Review exact reported values or share the selected context with a doctor.",
  },
] as const;

const useCases = [
  ["/use-cases/ai-workout-recommendations", "Training decision", "What should I do today?"],
  ["/use-cases/log-nutrition-with-ai", "Natural input", "Log meals with an AI"],
  ["/use-cases/track-blood-tests-with-ai", "Long-term context", "Follow laboratory history"],
  ["/use-cases/use-multiple-ai-assistants", "Portable history", "Use more than one AI"],
  ["/use-cases/share-data-with-coach", "Human expertise", "Share with a coach or doctor"],
] as const;

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "TRAPEAK",
        url: "https://trapeak.com",
        description: "A permissioned fitness and health data layer for compatible AI assistants.",
      },
      {
        "@type": "Organization",
        name: "TRAPEAK",
        url: "https://trapeak.com",
        logo: "https://trapeak.com/brand/trapeak-app-icon.png",
        email: "support@trapeak.com",
      },
    ],
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />

    <section className="product-hero shell">
      <div className="eyebrow"><span className="live-dot" /> Production private beta · Wahoo connected</div>
      <h1>Your data.<br /><span className="gradient-text">Any AI.</span><br />People you trust.</h1>
      <div className="product-hero-bottom">
        <p>Keep your fitness and health history in one permissioned layer. Record with one AI, analyze or plan with another, or share selected data with a real specialist.</p>
        <div className="product-hero-actions">
          <Link className="button gradient" href="/sign-up">Create your account <span>↗</span></Link>
          <Link className="text-link" href="#experience">See it in action <span>↓</span></Link>
        </div>
      </div>
      <BrandIcon className="product-hero-mark" size={300} />
    </section>

    <section className="product-statement">
      <div className="shell statement-grid">
        <p className="section-index">01 / THE IDEA</p>
        <h2>Record where it is convenient.<br />Analyze where it is best.</h2>
        <p>Your history belongs to you—not to one chat or model. TRAPEAK gives compatible AI clients and trusted people only the context you explicitly authorize.</p>
      </div>
    </section>

    <section className="data-flow shell" id="how">
      <div className="section-head">
        <div><p className="section-index">02 / ONE DATA LAYER</p><h2>Connect once.<br />Use the context anywhere.</h2></div>
        <p>TRAPEAK normalizes your records, keeps source boundaries visible and resolves every request to your authenticated account.</p>
      </div>
      <div className="data-flow-board" aria-label="Data flows from sources through TRAPEAK to authorized AI assistants and people">
        <div className="flow-column"><small>YOUR SOURCES</small><span>Wahoo workouts</span><span>Meals by voice or text</span><span>Weight and profile</span><span>Laboratory reports</span></div>
        <div className="flow-core"><BrandIcon size={58} /><b>TRAPEAK</b><small>HISTORY · PERMISSIONS · AUDIT</small></div>
        <div className="flow-column"><small>YOUR CHOICE</small><span>ChatGPT</span><span>Claude or another MCP AI</span><span>Coach</span><span>Doctor or dietitian</span></div>
      </div>
    </section>

    <section className="category-section">
      <div className="shell">
        <div className="section-head">
          <div><p className="section-index">03 / YOUR CONTEXT</p><h2>Three clear<br />data categories.</h2></div>
          <p>Each category has its own purpose and can be granted independently. Sensitive health context is never bundled into training access.</p>
        </div>
        <div className="category-grid">{categories.map((category) => <article key={category.title}><span>{category.index}</span><h3>{category.title}</h3><p>{category.description}</p><small>{category.example}</small></article>)}</div>
      </div>
    </section>

    <section className="ai-experience" id="experience">
      <div className="shell">
        <div className="experience-heading"><p className="section-index light">04 / REAL QUESTIONS</p><h2>Ask naturally.<br />Keep the reasoning visible.</h2></div>
        <div className="experience-grid">
          <article className="conversation-card light-card">
            <div className="conversation-label"><span>RECORD</span><b>01</b></div>
            <div className="conversation-bubble user-bubble"><small>YOU</small><p>Log breakfast: a three-egg omelette, half an avocado, two gluten-free crispbreads and black coffee.</p></div>
            <div className="conversation-tool"><span>{"{"}</span><code>create_nutrition_entry</code><span>{"}"}</span></div>
            <div className="conversation-bubble ai-bubble"><small>AI</small><p>Breakfast saved: approximately 520 kcal, 26 g protein, 29 g carbohydrates and 34 g fat. I used standard egg sizes and about 100 g of avocado, so the estimate includes those assumptions.</p></div>
          </article>

          <article className="conversation-card dark-card">
            <div className="conversation-label"><span>DECIDE</span><b>02</b></div>
            <div className="conversation-bubble user-bubble"><small>YOU</small><p>What training would suit me today? I have 45 minutes and feel good.</p></div>
            <div className="context-strip"><span>Yesterday · demanding intervals</span><span>7 days · moderate load</span><span>Today · good, no pain</span></div>
            <div className="conversation-bubble ai-bubble"><small>AI</small><p>A relaxed 30–35 minute run at conversational pace, followed by 5–10 minutes of mobility, fits today well. Yesterday supplied the hard stimulus; this keeps your consistency and helps you arrive fresher for the next quality session.</p><p>Your carbohydrates were lower than usual, so a small snack before the run may help. Start easily and shorten the session if your current check-in changes.</p></div>
          </article>
        </div>
        <p className="experience-note">The connected AI creates the response. TRAPEAK provides authorized facts, source coverage and limitations—not a diagnosis or an automatic readiness score.</p>
      </div>
    </section>

    <section className="multi-ai shell">
      <div><p className="section-index">05 / PORTABLE HISTORY</p><h2>Use the best help<br />for each job.</h2><p>One assistant can capture your day. Another can review a month, build a chart or help adjust next week. The same structured history remains in TRAPEAK when models change.</p></div>
      <div className="handoff-board">
        <article><small>CHATGPT · VOICE</small><p>“Save today&apos;s meals and my new weight: 90 kilograms.”</p><span>Recorded in TRAPEAK</span></article>
        <i aria-hidden="true">↘</i>
        <article><small>ANOTHER AI · PLANNING</small><p>“Compare my last four weeks and help plan next week around three available running days.”</p><span>Uses the same history</span></article>
      </div>
    </section>

    <section className="delegation-section">
      <div className="shell delegation-grid">
        <div><p className="section-index light">06 / HUMAN EXPERTISE</p><h2>Use AI when it helps.<br />Invite a real specialist when you prefer.</h2><p>Give a coach, doctor or dietitian temporary read-only access by email. Select categories, set an expiry and revoke access at any time.</p><Link className="button gradient" href="/use-cases/share-data-with-coach">See delegated access <span>↗</span></Link></div>
        <div className="permission-card">
          <div><small>SHARED WITH</small><b>coach@example.com</b></div>
          <ul><li><span>Training</span><b>ALLOWED</b></li><li><span>Nutrition</span><b>ALLOWED</b></li><li className="locked"><span>Health</span><b>LOCKED</b></li></ul>
          <footer><span>Read only · 30 days</span><b>Revoke anytime</b></footer>
        </div>
      </div>
    </section>

    <section className="use-case-section shell">
      <p className="section-index">07 / USE CASES</p>
      <div className="use-case-heading"><h2>Start with<br />a real question.</h2><p>Practical guides explain what works now, which data is used and where the product intentionally stops.</p></div>
      <div className="use-case-links">{useCases.map(([href, eyebrow, title], index) => <Link href={href} key={href}><span>0{index + 1}</span><div><small>{eyebrow}</small><h3>{title}</h3></div><b>↗</b></Link>)}</div>
    </section>

    <section className="source-status">
      <div className="shell source-status-grid"><div><p className="section-index light">08 / SOURCE STATUS</p><h2>What works now.</h2></div><div><article><b>Wahoo</b><span>Connected and automatically synchronized</span></article><article><b>Nutrition, profile, weight and labs</b><span>Saved through explicit AI requests</span></article><article><b>Garmin</b><span>Planned · pending provider approval</span></article><article><b>Sleep, HRV and recovery</b><span>Not ingested yet · never replaced with estimates</span></article></div></div>
    </section>

    <section className="faq shell" id="faq">
      <p className="section-index">09 / FAQ</p><h2>Direct answers.</h2>
      <details><summary>Is TRAPEAK an AI coach?<span>+</span></summary><p>No. TRAPEAK stores structured, user-authorized context. Your chosen AI or human specialist interprets that context and creates the recommendation or plan.</p></details>
      <details><summary>Can I use more than one AI?<span>+</span></summary><p>Yes. Compatible AI clients can use the same TRAPEAK history. You can record with one assistant and analyze or plan with another.</p></details>
      <details><summary>Can a coach work with several athletes?<span>+</span></summary><p>Yes. A coach can accept grants from multiple athletes. Every athlete remains a separate subject and controls their own categories and expiry.</p></details>
      <details><summary>Does training access include medical data?<span>+</span></summary><p>No. Health is a separate sensitive category. A coach receives laboratory results, conditions or medications only when the owner explicitly grants Health access.</p></details>
      <details><summary>Does TRAPEAK use sleep or recovery data today?<span>+</span></summary><p>Not yet. Those measurements require a supported dated source. Until then TRAPEAK reports them as unavailable and asks the AI to obtain a fresh user check-in instead of inventing values.</p></details>
    </section>

    <section className="final-cta"><div className="shell"><BrandIcon className="cta-brand-icon" size={70} /><h2>Keep the history.<br />Choose the intelligence.</h2><p>Start with your workouts, nutrition, weight, profile and laboratory context.</p><Link className="button gradient" href="/sign-up">Create your account <span>↗</span></Link></div></section>

    <footer className="shell"><div className="footer-brand"><BrandLogo /><p>Permissioned fitness and health data for AI.</p></div><div><b>PRODUCT</b><a href="#how">How it works</a><Link href="/use-cases/ai-workout-recommendations">Use cases</Link><Link href="/ai-guides">AI guides</Link></div><div><b>USE CASES</b><Link href="/use-cases/log-nutrition-with-ai">Nutrition</Link><Link href="/use-cases/track-blood-tests-with-ai">Laboratory history</Link><Link href="/use-cases/share-data-with-coach">Shared access</Link></div><div><b>LEGAL & SUPPORT</b><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/data-deletion">Data deletion</Link><a href="mailto:support@trapeak.com">support@trapeak.com</a></div><p className="copyright">© 2026 TRAPEAK. Private beta. Third-party names and trademarks are used descriptively and do not imply endorsement or partnership.</p></footer>
  </main>;
}

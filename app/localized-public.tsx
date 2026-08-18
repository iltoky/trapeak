import Link from "next/link";

import type { AppLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import {
  getPublicContent,
  localizedCopyLabels,
  providerGuideSlugs,
  type LegalContent,
  type ProviderGuideSlug,
  type UseCaseSlug,
  useCaseSlugs,
} from "@/lib/i18n/public-content";
import { getUiMessages } from "@/lib/i18n/ui";

import "./product.css";
import "./guides.css";

import { BrandIcon, BrandLogo } from "./brand";
import { CopyRequestButton } from "./copy-request-button";
import { FooterLanguage } from "./locale-footer";
import { SiteHeader } from "./site-header";

function LocalizedFooter({ locale, publicPath, compact = false }: Readonly<{ locale: AppLocale; publicPath: string; compact?: boolean }>) {
  const content = getPublicContent(locale).landing;
  const common = getUiMessages(locale).common;
  return <footer className={`shell ${compact ? "guide-footer" : ""}`}>
    <div className="footer-brand"><Link className="wordmark" href={localePath(locale)} aria-label={`TRAPEAK · ${common.home}`}><BrandLogo /></Link><p>{content.footerTagline}</p><FooterLanguage locale={locale} publicPath={publicPath} /></div>
    <div><b>{content.product}</b><Link href={`${localePath(locale)}#how`}>{common.how}</Link><Link href={localePath(locale, "/ai-guides")}>{content.aiGuides}</Link></div>
    <div><b>{common.useCases.toUpperCase()}</b><Link href={localePath(locale, "/use-cases/log-nutrition-with-ai")}>{content.nutrition}</Link><Link href={localePath(locale, "/use-cases/track-blood-tests-with-ai")}>{content.laboratory}</Link><Link href={localePath(locale, "/use-cases/share-data-with-coach")}>{content.sharedAccess}</Link></div>
    <div><b>{content.legalSupport}</b><Link href={localePath(locale, "/privacy")}>{common.privacy}</Link><Link href={localePath(locale, "/terms")}>{common.terms}</Link><Link href={localePath(locale, "/data-deletion")}>{common.dataDeletion}</Link><a href="mailto:support@trapeak.com">support@trapeak.com</a></div>
    <p className="copyright">{common.copyright} {content.trademark}</p>
  </footer>;
}

export function LocalizedLanding({ locale }: { locale: AppLocale }) {
  const content = getPublicContent(locale);
  const l = content.landing;
  const common = getUiMessages(locale).common;
  const cases = useCaseSlugs.map((slug) => ({ slug, ...content.useCases[slug] }));
  const jsonLd = { "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", name: "TRAPEAK", url: `https://trapeak.com${localePath(locale)}`, description: content.seo.defaultDescription }, { "@type": "Organization", name: "TRAPEAK", url: "https://trapeak.com", logo: "https://trapeak.com/brand/trapeak-app-icon.png", email: "support@trapeak.com" }] };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader locale={locale} />
    <section className="product-hero shell"><div className="eyebrow"><span className="live-dot" />{l.eyebrow}</div><h1>{l.hero[0]}<br /><span className="gradient-text">{l.hero[1]}</span><br />{l.hero[2]}</h1><div className="product-hero-bottom"><p>{l.heroBody}</p><div className="product-hero-actions"><Link className="button gradient" href="/sign-up">{l.create} <span>↗</span></Link><Link className="text-link" href="#experience">{l.action} <span>↓</span></Link></div></div><BrandIcon className="product-hero-mark" size={300} /></section>
    <section className="product-statement"><div className="shell statement-grid"><p className="section-index">{l.ideaIndex}</p><h2>{l.ideaTitle}</h2><p>{l.ideaBody}</p></div></section>
    <section className="data-flow shell" id="how"><div className="section-head"><div><p className="section-index">{l.layerIndex}</p><h2>{l.layerTitle}</h2></div><p>{l.layerBody}</p></div><div className="data-flow-board"><div className="flow-column"><small>{l.sources}</small>{l.sourceItems.map((item) => <span key={item}>{item}</span>)}</div><div className="flow-core"><BrandIcon size={58} /><b>TRAPEAK</b><small>{l.core}</small></div><div className="flow-column"><small>{l.choices}</small>{l.choiceItems.map((item) => <span key={item}>{item}</span>)}</div></div></section>
    <section className="category-section"><div className="shell"><div className="section-head"><div><p className="section-index">{l.categoryIndex}</p><h2>{l.categoryTitle}</h2></div><p>{l.categoryBody}</p></div><div className="category-grid">{l.categories.map((category, index) => <article key={category.title}><span>0{index + 1}</span><h3>{category.title}</h3><p>{category.description}</p><small>{category.example}</small></article>)}</div></div></section>
    <section className="ai-experience" id="experience"><div className="shell"><div className="experience-heading"><p className="section-index light">{l.questionsIndex}</p><h2>{l.questionsTitle}</h2></div><div className="experience-grid"><article className="conversation-card light-card"><div className="conversation-label"><span>{l.record}</span><b>01</b></div><div className="conversation-bubble user-bubble"><small>{l.you}</small><p>{l.mealQuestion}</p></div><div className="conversation-tool"><span>{"{"}</span><code>create_nutrition_entry</code><span>{"}"}</span></div><div className="conversation-bubble ai-bubble"><small>{l.ai}</small><p>{l.mealAnswer}</p></div></article><article className="conversation-card dark-card"><div className="conversation-label"><span>{l.decide}</span><b>02</b></div><div className="conversation-bubble user-bubble"><small>{l.you}</small><p>{l.trainingQuestion}</p></div><div className="context-strip">{l.context.map((item) => <span key={item}>{item}</span>)}</div><div className="conversation-bubble ai-bubble"><small>{l.ai}</small>{l.trainingAnswer.map((answer) => <p key={answer}>{answer}</p>)}</div></article></div><p className="experience-note">{l.experienceNote}</p></div></section>
    <section className="multi-ai shell"><div><p className="section-index">{l.historyIndex}</p><h2>{l.historyTitle}</h2><p>{l.historyBody}</p></div><div className="handoff-board"><article><small>{l.voiceLabel}</small><p>“{l.voicePrompt}”</p><span>{l.recorded}</span></article><i aria-hidden="true">↘</i><article><small>{l.planningLabel}</small><p>“{l.planningPrompt}”</p><span>{l.sameHistory}</span></article></div></section>
    <section className="delegation-section"><div className="shell delegation-grid"><div><p className="section-index light">{l.expertIndex}</p><h2>{l.expertTitle}</h2><p>{l.expertBody}</p><Link className="button gradient" href={localePath(locale, "/use-cases/share-data-with-coach")}>{l.seeAccess} <span>↗</span></Link></div><div className="permission-card"><div><small>{l.sharedWith}</small><b>coach@example.com</b></div><ul><li><span>{l.categories[0].title}</span><b>{l.allowed}</b></li><li><span>{l.categories[1].title}</span><b>{l.allowed}</b></li><li className="locked"><span>{l.categories[2].title}</span><b>{l.locked}</b></li></ul><footer><span>{l.readOnly}</span><b>{l.revoke}</b></footer></div></div></section>
    <section className="use-case-section shell"><p className="section-index">{l.useCasesIndex}</p><div className="use-case-heading"><h2>{l.useCasesTitle}</h2><p>{l.useCasesBody}</p></div><div className="use-case-links">{cases.map((item, index) => <Link href={localePath(locale, `/use-cases/${item.slug}`)} key={item.slug}><span>0{index + 1}</span><div><small>{item.eyebrow}</small><h3>{item.title}</h3></div><b>↗</b></Link>)}</div></section>
    <section className="source-status"><div className="shell source-status-grid"><div><p className="section-index light">{l.statusIndex}</p><h2>{l.statusTitle}</h2></div><div>{l.sourceStatus.map((item) => <article key={item.name}><b>{item.name}</b><span>{item.status}</span></article>)}</div></div></section>
    <section className="faq shell" id="faq"><p className="section-index">{l.faqIndex}</p><h2>{l.faqTitle}</h2>{l.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</section>
    <section className="final-cta"><div className="shell"><BrandIcon className="cta-brand-icon" size={70} /><h2>{l.ctaTitle}</h2><p>{l.ctaBody}</p><Link className="button gradient" href="/sign-up">{l.create} <span>↗</span></Link></div></section>
    <LocalizedFooter locale={locale} publicPath="/" />
  </main>;
}

export function LocalizedGuideIndex({ locale }: { locale: AppLocale }) {
  const c = getPublicContent(locale);
  const labels = c.guideIndex;
  const guides = [...useCaseSlugs.map((slug) => ({ href: `/use-cases/${slug}`, title: c.useCases[slug].title, description: c.useCases[slug].intro })), ...providerGuideSlugs.map((slug) => ({ href: `/${slug}`, title: c.providerGuides[slug].title, description: c.providerGuides[slug].intro }))];
  return <main className="guides-index"><SiteHeader locale={locale} /><section className="guides-index-hero shell"><p className="guide-breadcrumb"><Link href={localePath(locale)}>TRAPEAK</Link><span>/</span><strong>{labels.breadcrumb}</strong></p><h1>{labels.title}</h1><p>{labels.intro}</p></section><section className="shell guides-group"><p className="section-index">{labels.useCases}</p><div className="guides-index-list">{guides.slice(0, 5).map((guide, index) => <Link href={localePath(locale, guide.href)} key={guide.href}><span>0{index + 1}</span><div><h2>{guide.title}</h2><p>{guide.description}</p></div><b>↗</b></Link>)}</div></section><section className="shell guides-group"><p className="section-index">{labels.connection}</p><div className="guides-index-list">{guides.slice(5).map((guide, index) => <Link href={localePath(locale, guide.href)} key={guide.href}><span>{String(index + 6).padStart(2, "0")}</span><div><h2>{guide.title}</h2><p>{guide.description}</p></div><b>↗</b></Link>)}</div></section><section className="guides-planned"><div className="shell"><p className="section-index light">{labels.planned}</p><h2>{labels.plannedTitle}</h2><p>{labels.plannedBody}</p></div></section><LocalizedFooter locale={locale} publicPath="/ai-guides" compact /></main>;
}

export function LocalizedUseCase({ locale, slug }: { locale: AppLocale; slug: UseCaseSlug }) {
  const publicCopy = getPublicContent(locale);
  const c = publicCopy.useCases[slug];
  const l = publicCopy.guideLabels;
  const common = getUiMessages(locale).common;
  const jsonLd = { "@context": "https://schema.org", "@graph": [{ "@type": "WebPage", name: c.title, url: `https://trapeak.com${localePath(locale, `/use-cases/${slug}`)}`, description: c.intro }, { "@type": "FAQPage", mainEntity: c.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] };
  return <main className="use-case-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><SiteHeader locale={locale} /><section className="use-case-hero shell"><p className="guide-breadcrumb"><Link href={localePath(locale)}>TRAPEAK</Link><span>/</span><strong>{c.eyebrow}</strong></p><div className="eyebrow"><span className="live-dot" />{l.current}</div><h1>{c.title}</h1><div><p>{c.intro}</p><aside><b>{l.productStatus}</b><span>{l.available}</span><p>{c.status}</p></aside></div></section><section className="use-case-answer"><div className="shell"><p className="section-index">{l.shortAnswer}</p><h2>{c.shortAnswer}</h2></div></section><section className="use-case-data shell"><div><p className="section-index">{l.authorized}</p><h2>{l.availableTitle}</h2></div><ol>{c.dataUsed.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol></section><section className="use-case-conversation"><div className="shell"><div><p className="section-index light">{l.conversation}</p><h2>{l.conversationTitle}</h2></div><article><div className="conversation-bubble user-bubble"><small>{publicCopy.landing.you}</small><p>{c.question}</p></div><div className="conversation-bubble ai-bubble"><small>{l.aiUsing}</small>{c.answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></div></section><section className="starter-request shell"><div><p className="section-index">{l.start}</p><h2>{l.copyTitle}</h2><p>{l.copyBody}</p></div><div className="request-card"><blockquote>{c.starter}</blockquote><CopyRequestButton request={c.starter} labels={localizedCopyLabels[locale]} /></div></section><section className="use-case-limits"><div className="shell"><div><p className="section-index light">{l.limitations}</p><h2>{l.limitationsTitle}</h2></div><ul>{c.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></section><section className="faq shell guide-faq"><p className="section-index">{common.faq}</p><h2>{publicCopy.landing.faqTitle}</h2>{c.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</section><section className="guide-related"><div className="shell"><p className="section-index">{l.related}</p><div className="related-grid">{useCaseSlugs.filter((item) => item !== slug).map((item) => <Link href={localePath(locale, `/use-cases/${item}`)} key={item}><span>{publicCopy.useCases[item].title}</span><b>↗</b></Link>)}</div></div></section><LocalizedFooter locale={locale} publicPath={`/use-cases/${slug}`} compact /></main>;
}

export function LocalizedProviderGuide({ locale, slug }: { locale: AppLocale; slug: ProviderGuideSlug }) {
  const publicCopy = getPublicContent(locale);
  const c = publicCopy.providerGuides[slug];
  const l = publicCopy.guideLabels;
  const common = getUiMessages(locale).common;
  return <main className="guide-page"><SiteHeader locale={locale} /><section className="guide-hero shell"><p className="guide-breadcrumb"><Link href={localePath(locale)}>TRAPEAK</Link><span>/</span><Link href={localePath(locale, "/ai-guides")}>{publicCopy.guideIndex.breadcrumb}</Link><span>/</span><strong>{c.eyebrow}</strong></p><div className="eyebrow"><span className="live-dot" />{c.eyebrow}</div><h1>{c.title}</h1><div className="guide-hero-bottom"><p>{c.intro}</p><div className="guide-status"><b>{l.productStatus}</b><span>{c.statusLabel}</span><p>{c.status}</p></div></div></section><section className="guide-answer"><div className="shell guide-answer-grid"><p className="section-index">{l.shortAnswer}</p><h2>{c.summary}</h2></div></section><section className="guide-section shell"><div className="guide-heading"><p className="section-index">{c.noIndex ? l.providerPlannedHow : l.providerHow}</p><h2>{l.providerTitle}</h2></div><ol className="guide-steps">{c.dataPoints.slice(0, 3).map((item, index) => <li key={item}><span>0{index + 1}</span><div><h3>{item}</h3></div></li>)}</ol></section><section className="guide-data"><div className="shell guide-data-grid"><div><p className="section-index light">{c.noIndex ? l.plannedData : l.dataAccess}</p><h2>{c.dataTitle}</h2><p>{c.dataIntro}</p></div><ul>{c.dataPoints.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ul></div></section><section className="guide-prompts shell"><div><p className="section-index">{l.examples}</p><h2>{l.askPlain}</h2></div><div className="prompt-list">{c.prompts.map((prompt) => <blockquote key={prompt}>“{prompt}”</blockquote>)}<small>{l.examplesNote}</small></div></section><section className="faq shell guide-faq"><p className="section-index">{common.faq}</p><h2>{publicCopy.landing.faqTitle}</h2>{c.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</section><section className="final-cta"><div className="shell"><BrandIcon className="cta-brand-icon" size={70} /><h2>{l.bring}</h2><p>{l.request}</p><a className="button gradient" href="mailto:support@trapeak.com?subject=TRAPEAK">{l.requestAccess} <span>↗</span></a></div></section><LocalizedFooter locale={locale} publicPath={`/${slug}`} compact /></main>;
}

export function LocalizedLegalPage({ locale, path, content }: { locale: AppLocale; path: string; content: LegalContent }) {
  const publicCopy = getPublicContent(locale);
  const common = getUiMessages(locale).common;
  return <main className="legal"><SiteHeader locale={locale} /><article><p className="section-index">{content.eyebrow}</p><h1>{content.title}</h1><p className="updated">{publicCopy.legal.updated}</p><p>{content.intro}</p>{content.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items ? <ol>{section.items.map((item) => <li key={item}>{item}</li>)}</ol> : null}</section>)}</article><footer className="shell"><div className="footer-brand"><BrandLogo /><p>{publicCopy.landing.footerTagline}</p><FooterLanguage locale={locale} publicPath={path} /></div><div><b>{common.contact.toUpperCase()}</b><a href="mailto:support@trapeak.com">support@trapeak.com</a></div><p className="copyright">{common.copyright}</p></footer></main>;
}

import Link from "next/link";
import { isAuthConfigured } from "@/lib/auth/config";
import { localePath, type AppLocale } from "@/lib/i18n/config";
import { getUiMessages } from "@/lib/i18n/ui";
import { BrandLogo } from "./brand";

function HeaderActions({ authConfigured, locale }: { authConfigured: boolean; locale: AppLocale }) {
  const messages = getUiMessages(locale).common;
  return authConfigured ? (
    <div className="nav-auth">
      <Link className="nav-sign-in" href="/sign-in">{messages.signIn}</Link>
      <Link className="button black nav-cta" href="/sign-up">{messages.createAccount}</Link>
    </div>
  ) : (
    <a className="button black nav-cta" href="mailto:support@trapeak.com?subject=TRAPEAK">{messages.earlyAccess}</a>
  );
}

export function SiteHeader({ locale = "en" }: Readonly<{ locale?: AppLocale }>) {
  const authConfigured = isAuthConfigured();
  const messages = getUiMessages(locale).common;
  const home = localePath(locale);

  return (
    <header className="nav shell">
      <Link className="wordmark" href={home} aria-label={`TRAPEAK · ${messages.home}`}><BrandLogo /></Link>
      <nav className="desktop-nav" aria-label={messages.menu}>
        <Link href={`${home}#how`}>{messages.how}</Link>
        <Link href={`${home}#experience`}>{messages.examples}</Link>
        <Link href={localePath(locale, "/ai-guides")}>{messages.useCases}</Link>
        <Link href={`${home}#faq`}>{messages.faq}</Link>
      </nav>
      <div className="desktop-actions"><HeaderActions authConfigured={authConfigured} locale={locale} /></div>
      <details className="mobile-menu">
        <summary>
          <span>{messages.menu}</span>
          <span className="mobile-menu-icon" aria-hidden="true"><i /><i /></span>
        </summary>
        <div className="mobile-menu-panel">
          <nav aria-label={messages.menu}>
            <Link href={`${home}#how`}><span>01</span>{messages.how}</Link>
            <Link href={`${home}#experience`}><span>02</span>{messages.examples}</Link>
            <Link href={localePath(locale, "/ai-guides")}><span>03</span>{messages.useCases}</Link>
            <Link href={`${home}#faq`}><span>04</span>{messages.faq}</Link>
          </nav>
          <div className="mobile-menu-actions"><HeaderActions authConfigured={authConfigured} locale={locale} /></div>
        </div>
      </details>
    </header>
  );
}

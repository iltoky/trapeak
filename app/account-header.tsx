import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { type AppLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";
import { BrandLogo } from "./brand";

function AccountActions({ locale }: { locale: AppLocale }) {
  const messages = getUiMessages(locale).common;
  return (
    <div className="nav-auth">
      <Link className="nav-sign-in" href="/dashboard">{messages.dashboard}</Link>
      <UserButton />
    </div>
  );
}

export async function AccountHeader() {
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale).common;
  return (
    <header className="nav shell">
      <Link className="wordmark" href="/" aria-label={`TRAPEAK · ${messages.home}`}><BrandLogo /></Link>
      <nav className="desktop-nav" aria-label={messages.menu}>
        <Link href="/#how">{messages.how}</Link>
        <Link href="/#experience">{messages.examples}</Link>
        <Link href="/ai-guides">{messages.useCases}</Link>
        <Link href="/#faq">{messages.faq}</Link>
      </nav>
      <div className="desktop-actions"><AccountActions locale={locale} /></div>
      <details className="mobile-menu">
        <summary>
          <span>{messages.menu}</span>
          <span className="mobile-menu-icon" aria-hidden="true"><i /><i /></span>
        </summary>
        <div className="mobile-menu-panel">
          <nav aria-label={messages.menu}>
            <Link href="/#how"><span>01</span>{messages.how}</Link>
            <Link href="/#experience"><span>02</span>{messages.examples}</Link>
            <Link href="/ai-guides"><span>03</span>{messages.useCases}</Link>
            <Link href="/#faq"><span>04</span>{messages.faq}</Link>
          </nav>
          <div className="mobile-menu-actions"><AccountActions locale={locale} /></div>
        </div>
      </details>
    </header>
  );
}

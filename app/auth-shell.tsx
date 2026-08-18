import Link from "next/link";
import type { ReactNode } from "react";
import type { AppLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getUiMessages } from "@/lib/i18n/ui";

import { LocaleFooter } from "./locale-footer";
import { SiteHeader } from "./site-header";
import "./auth.css";

type AuthShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  locale: AppLocale;
}>;

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  locale,
}: AuthShellProps) {
  const common = getUiMessages(locale).common;
  return (
    <main className="auth-page">
      <SiteHeader locale={locale} />
      <section className="auth-layout shell">
        <div className="auth-copy">
          <p className="section-index">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <Link href={localePath(locale)} className="text-link">
            {common.backHome} <span>↗</span>
          </Link>
        </div>
        <div className="auth-panel">{children}</div>
      </section>
      <LocaleFooter locale={locale} />
    </main>
  );
}

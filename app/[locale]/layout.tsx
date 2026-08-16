import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { localeFromSlug, localeHtmlLang, localeSlugs, supportedLocales } from "@/lib/i18n/config";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale: localeSlugs[locale] }));
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const locale = localeFromSlug((await params).locale);
  if (!locale) notFound();
  const htmlLang = localeHtmlLang[locale];
  return <>
    <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(htmlLang)};` }} />
    {children}
  </>;
}

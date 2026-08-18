import type { AppLocale } from "@/lib/i18n/config";
import { getUiMessages } from "@/lib/i18n/ui";

import { LanguageSelector } from "./language-selector";

export function FooterLanguage({
  locale,
  publicPath,
}: Readonly<{ locale: AppLocale; publicPath?: string }>) {
  const messages = getUiMessages(locale).common;

  return (
    <div className="footer-language">
      <span>{messages.language}</span>
      <LanguageSelector
        locale={locale}
        label={messages.language}
        publicPath={publicPath}
      />
    </div>
  );
}

export function LocaleFooter({ locale }: Readonly<{ locale: AppLocale }>) {
  const messages = getUiMessages(locale).common;

  return (
    <footer className="locale-footer shell">
      <FooterLanguage locale={locale} />
      <p>{messages.copyright}</p>
    </footer>
  );
}

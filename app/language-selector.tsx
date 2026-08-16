"use client";

import { useState } from "react";

import {
  localeCookieName,
  localeNames,
  localePath,
  supportedLocales,
  type AppLocale,
} from "@/lib/i18n/config";

export function LanguageSelector({
  locale,
  label,
  publicPath,
}: Readonly<{ locale: AppLocale; label: string; publicPath?: string }>) {
  const [pending, setPending] = useState(false);

  async function change(nextLocale: AppLocale) {
    setPending(true);
    document.cookie = `${localeCookieName}=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    try {
      await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
    } catch {
      // Cookie persistence still works for signed-out and temporarily offline users.
    }
    window.location.assign(publicPath === undefined ? window.location.href : localePath(nextLocale, publicPath));
  }

  return (
    <label className="language-selector">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        disabled={pending}
        value={locale}
        onChange={(event) => change(event.target.value as AppLocale)}
      >
        {supportedLocales.map((item) => (
          <option key={item} value={item}>{localeNames[item]}</option>
        ))}
      </select>
    </label>
  );
}

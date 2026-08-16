"use client";

import { useState } from "react";

import { localeCookieName, localeNames, supportedLocales, type AppLocale, type MeasurementSystem } from "@/lib/i18n/config";
import type { UiMessages } from "@/lib/i18n/ui";

export function PreferencesForm({
  initial,
  messages,
}: Readonly<{
  initial: { locale: AppLocale; timeZone: string; measurementSystem: MeasurementSystem };
  messages: UiMessages["profile"];
}>) {
  const [locale, setLocale] = useState(initial.locale);
  const [timeZone, setTimeZone] = useState(initial.timeZone);
  const [measurementSystem, setMeasurementSystem] = useState(initial.measurementSystem);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("saving");
    const response = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale, timeZone, measurementSystem }),
    });
    if (!response.ok) {
      setState("error");
      return;
    }
    document.cookie = `${localeCookieName}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    setState("saved");
    if (locale !== initial.locale) window.location.reload();
  }

  return <form className="preferences-form" onSubmit={submit}>
    <label><span>{messages.language}</span><select value={locale} onChange={(event) => setLocale(event.target.value as AppLocale)}>{supportedLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label>
    <label><span>{messages.timeZone}</span><input required value={timeZone} onChange={(event) => setTimeZone(event.target.value)} placeholder="Europe/Warsaw" /><small>{messages.timeZoneHint}</small></label>
    <fieldset><legend>{messages.measurement}</legend><p>{messages.measurementHint}</p><label><input type="radio" name="measurement" value="metric" checked={measurementSystem === "metric"} onChange={() => setMeasurementSystem("metric")} /><span>{messages.metric}</span></label><label><input type="radio" name="measurement" value="imperial" checked={measurementSystem === "imperial"} onChange={() => setMeasurementSystem("imperial")} /><span>{messages.imperial}</span></label></fieldset>
    <button className="button black" disabled={state === "saving"} type="submit">{state === "saving" ? messages.saving : messages.save}</button>
    {state === "saved" ? <p className="preferences-success" role="status">{messages.saved}</p> : null}
    {state === "error" ? <p className="access-error" role="alert">{messages.error}</p> : null}
  </form>;
}

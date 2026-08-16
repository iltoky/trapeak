import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { defaultLocale, isAppLocale, type MeasurementSystem } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";
import { getUserProfile } from "@/lib/profile/data";

import { PreferencesForm } from "./preferences-form";

export const metadata = { title: "Profile & preferences" };

export default async function ProfilePreferencesPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const [user, requestLocale] = await Promise.all([requireAuthUser(), getRequestLocale()]);
  const profile = await getUserProfile(user.id);
  const stored = profile.record?.profile;
  const locale = isAppLocale(stored?.locale) ? stored.locale : requestLocale || defaultLocale;
  const timeZone = stored?.timeZone ?? "UTC";
  const measurementSystem: MeasurementSystem = stored?.measurementSystem ?? "metric";
  const messages = getUiMessages(locale).profile;

  return <div className="dashboard-content profile-preferences">
    <header className="dashboard-hero compact"><div><p className="section-index">{messages.eyebrow}</p><h1>{messages.title}</h1></div><p>{messages.intro}</p></header>
    <section className="data-panel"><div className="panel-heading"><div><p className="section-index">{messages.interface}</p><h2>{messages.language}</h2></div></div><p>{messages.interfaceHint}</p><PreferencesForm initial={{ locale, timeZone, measurementSystem }} messages={messages} /></section>
    <section className="context-callout"><div><small>{messages.independence}</small><p>{messages.independenceText}</p></div></section>
  </div>;
}

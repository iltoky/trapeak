"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/lib/i18n/config";
import { getUiMessages } from "@/lib/i18n/ui";

export function DashboardNav({ locale }: { locale: AppLocale }) {
  const pathname = usePathname();
  const messages = getUiMessages(locale).nav;
  const items = [
    ["/dashboard", messages.overview],
    ["/dashboard/training", messages.training],
    ["/dashboard/nutrition", messages.nutrition],
    ["/dashboard/health", messages.health],
    ["/access", messages.sharedAccess],
    ["/dashboard/connections", messages.connections],
    ["/dashboard/profile", messages.profile],
  ] as const;

  return <nav className="dashboard-nav" aria-label={messages.accountData}>
    {items.map(([href, label]) => {
      const current = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
      return <Link href={href} key={href} aria-current={current ? "page" : undefined}>{label}</Link>;
    })}
  </nav>;
}

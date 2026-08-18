import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { AccountHeader } from "../account-header";
import { ClerkBoundary } from "../clerk-boundary";
import { LocaleFooter } from "../locale-footer";
import "../product.css";
import { DashboardNav } from "./dashboard-nav";

export const metadata: Metadata = {
  title: "Your data",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const locale = await getRequestLocale();

  return (
    <ClerkBoundary>
      <AccountHeader />
      <main className="dashboard-page">
        <div className="dashboard-shell shell">
          <DashboardNav locale={locale} />
          {children}
        </div>
      </main>
      <LocaleFooter locale={locale} />
    </ClerkBoundary>
  );
}

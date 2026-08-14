import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { SiteHeader } from "../site-header";
import { DashboardNav } from "./dashboard-nav";

export const metadata: Metadata = {
  title: "Your data",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");

  return <>
    <SiteHeader />
    <main className="dashboard-page">
      <div className="dashboard-shell shell">
        <DashboardNav />
        {children}
      </div>
    </main>
  </>;
}

import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { SiteHeader } from "../site-header";

export const metadata = { title: "Account" };

export default async function DashboardPage() {
  if (!isAuthConfigured()) {
    redirect("/sign-in?setup=required");
  }

  const user = await requireAuthUser();

  return (
    <main className="account-page">
      <SiteHeader />
      <section className="account shell">
        <div>
          <p className="section-index">YOUR ACCOUNT</p>
          <h1>Connections.</h1>
          <p>
            Signed in as {user.email ?? "a verified TRAPEAK user"}.
          </p>
        </div>
        <UserButton />
        <div className="account-empty">
          <span>01</span>
          <div>
            <h2>No wearable connected yet</h2>
            <p>
              Wahoo API access is approved and the connection flow is being
              prepared. The Suunto access request is still under review.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

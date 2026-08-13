import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { SiteHeader } from "../site-header";

export const metadata = { title: "Account" };

const wahooMessages: Readonly<Record<string, string>> = {
  connected: "Wahoo connected successfully.",
  disconnected: "Wahoo disconnected.",
  denied: "Wahoo authorization was cancelled.",
  invalid_state: "The connection request expired. Please try again.",
  already_linked: "This Wahoo account is already linked to another TRAPEAK account.",
  error: "Wahoo could not be connected. Please try again.",
  disconnect_error: "Wahoo could not be disconnected. Please try again.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ wahoo?: string }>;
}) {
  if (!isAuthConfigured()) {
    redirect("/sign-in?setup=required");
  }

  const user = await requireAuthUser();
  const { wahoo: result } = await searchParams;
  let storageReady = true;
  let connection = null;
  try {
    connection = await getProviderConnectionSummary(user.id, "wahoo");
  } catch {
    storageReady = false;
  }

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
        {result && wahooMessages[result] ? (
          <p className="account-notice" role="status">
            {wahooMessages[result]}
          </p>
        ) : null}
        <div className="account-empty">
          <span>01</span>
          <div>
            <h2>
              {connection?.status === "connected"
                ? "Wahoo connected"
                : "Connect Wahoo"}
            </h2>
            {connection?.status === "connected" ? (
              <>
                <p>
                  Connected as {connection.displayName ?? `Wahoo user ${connection.providerUserId}`}.
                </p>
                <form action="/api/integrations/wahoo/disconnect" method="post">
                  <button className="button black" type="submit">
                    Disconnect Wahoo
                  </button>
                </form>
              </>
            ) : (
              <>
                <p>
                  Import authorized workout data from Wahoo for MCP-compatible
                  AI assistants.
                </p>
                {storageReady ? (
                  <a className="button black" href="/api/integrations/wahoo/connect">
                    Connect Wahoo
                  </a>
                ) : (
                  <p className="account-setup">Integration storage is not configured yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

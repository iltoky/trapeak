"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UiMessages } from "@/lib/i18n/ui";
export function AcceptButton({ token, messages }: { token: string; messages: UiMessages["access"] }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(action: "accept" | "reject") {
    setPendingAction(action);
    setError(null);
    const response = await fetch(`/api/access/invitations/${token}/${action}`, {
      method: "POST",
    });
    if (response.ok) {
      router.push("/access");
      router.refresh();
      return;
    }
    const result = await response.json();
    setError(messages.responseError);
    setPendingAction(null);
  }

  return <>
    <div className="access-invitation-actions">
      <button
        className="button gradient"
        disabled={pendingAction !== null}
        onClick={() => respond("accept")}
      >
        {pendingAction === "accept" ? messages.accepting : messages.accept}
      </button>
      <button
        className="button black"
        disabled={pendingAction !== null}
        onClick={() => respond("reject")}
      >
        {pendingAction === "reject" ? messages.rejecting : messages.reject}
      </button>
    </div>
    {error && <p className="access-error">{error}</p>}
  </>;
}

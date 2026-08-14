"use client";

import { useState } from "react";

export function CopyRequestButton({ request }: { request: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(request);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2_000);
    } catch {
      setStatus("error");
    }
  }

  return <button className="copy-request" type="button" onClick={copy} aria-live="polite">
    {status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Copy request"}
  </button>;
}

"use client";

import { useState } from "react";

export function CopyRequestButton({ request, labels = { idle: "Copy request", copied: "Copied", error: "Copy failed" } }: { request: string; labels?: Readonly<Record<"idle" | "copied" | "error", string>> }) {
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
    {labels[status]}
  </button>;
}

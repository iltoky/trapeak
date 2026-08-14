import Link from "next/link";
import type { ReactNode } from "react";

import { SiteHeader } from "./site-header";
import "./auth.css";

type AuthShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>;

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-page">
      <SiteHeader />
      <section className="auth-layout shell">
        <div className="auth-copy">
          <p className="section-index">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <Link href="/" className="text-link">
            Back to TRAPEAK <span>↗</span>
          </Link>
        </div>
        <div className="auth-panel">{children}</div>
      </section>
    </main>
  );
}

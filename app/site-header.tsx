import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/auth/config";
import { BrandLogo } from "./brand";

function HeaderActions({ authConfigured }: { authConfigured: boolean }) {
  return authConfigured ? (
    <div className="nav-auth">
      <Show when="signed-out">
        <Link className="nav-sign-in" href="/sign-in">Sign in</Link>
        <Link className="button black nav-cta" href="/sign-up">Create account</Link>
      </Show>
      <Show when="signed-in">
        <Link className="nav-sign-in" href="/dashboard">Dashboard</Link>
        <UserButton />
      </Show>
    </div>
  ) : (
    <a className="button black nav-cta" href="mailto:support@trapeak.com?subject=TRAPEAK%20early%20access">Join early access</a>
  );
}

export function SiteHeader() {
  const authConfigured = isAuthConfigured();

  return (
    <header className="nav shell">
      <Link className="wordmark" href="/" aria-label="TRAPEAK home"><BrandLogo /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/#experience">Examples</Link>
        <Link href="/ai-guides">Use cases</Link>
        <Link href="/#faq">FAQ</Link>
      </nav>
      <div className="desktop-actions"><HeaderActions authConfigured={authConfigured} /></div>
      <details className="mobile-menu">
        <summary>
          <span>Menu</span>
          <span className="mobile-menu-icon" aria-hidden="true"><i /><i /></span>
        </summary>
        <div className="mobile-menu-panel">
          <nav aria-label="Mobile navigation">
            <Link href="/#how"><span>01</span>How it works</Link>
            <Link href="/#experience"><span>02</span>Examples</Link>
            <Link href="/ai-guides"><span>03</span>Use cases</Link>
            <Link href="/#faq"><span>04</span>FAQ</Link>
          </nav>
          <div className="mobile-menu-actions"><HeaderActions authConfigured={authConfigured} /></div>
        </div>
      </details>
    </header>
  );
}

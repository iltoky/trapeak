import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { BrandLogo } from "./brand";

function AccountActions() {
  return (
    <div className="nav-auth">
      <Link className="nav-sign-in" href="/dashboard">Dashboard</Link>
      <UserButton />
    </div>
  );
}

export function AccountHeader() {
  return (
    <header className="nav shell">
      <Link className="wordmark" href="/" aria-label="TRAPEAK home"><BrandLogo /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/#experience">Examples</Link>
        <Link href="/ai-guides">Use cases</Link>
        <Link href="/#faq">FAQ</Link>
      </nav>
      <div className="desktop-actions"><AccountActions /></div>
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
          <div className="mobile-menu-actions"><AccountActions /></div>
        </div>
      </details>
    </header>
  );
}

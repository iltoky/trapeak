import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/auth/config";
import { BrandLogo } from "./brand";

export function SiteHeader() {
  const authConfigured = isAuthConfigured();

  return (
    <header className="nav shell">
      <Link className="wordmark" href="/" aria-label="TRAPEAK home"><BrandLogo /></Link>
      <nav aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/ai-guides">AI guides</Link>
        <Link href="/#faq">FAQ</Link>
      </nav>
      {authConfigured ? (
        <div className="nav-auth">
          <Show when="signed-out">
            <Link className="nav-sign-in" href="/sign-in">Sign in</Link>
            <Link className="button black nav-cta" href="/sign-up">Create account</Link>
          </Show>
          <Show when="signed-in">
            <Link className="nav-sign-in" href="/dashboard">Account</Link>
            <UserButton />
          </Show>
        </div>
      ) : (
        <a className="button black nav-cta" href="mailto:support@trapeak.com?subject=TRAPEAK%20early%20access">Join early access</a>
      )}
    </header>
  );
}

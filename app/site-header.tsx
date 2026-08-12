import Link from "next/link";

const Braces = () => (
  <span className="braces small" aria-hidden="true">
    <span>{"{"}</span><i /><span>{"}"}</span>
  </span>
);

export function SiteHeader() {
  return (
    <header className="nav shell">
      <Link className="wordmark" href="/" aria-label="TRAPEAK home"><Braces /> TRAPEAK</Link>
      <nav aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/ai-guides">AI guides</Link>
        <Link href="/#faq">FAQ</Link>
      </nav>
      <a className="button black nav-cta" href="mailto:support@trapeak.com?subject=TRAPEAK%20early%20access">Join early access</a>
    </header>
  );
}

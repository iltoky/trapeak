import { SiteHeader } from "./site-header";
import { BrandLogo } from "./brand";

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <main className="legal"><SiteHeader /><article><p className="section-index">{eyebrow}</p><h1>{title}</h1><p className="updated">Last updated: 13 August 2026</p>{children}</article><footer className="shell"><div className="footer-brand"><BrandLogo /><p>Fitness data infrastructure for AI.</p></div><div><b>CONTACT</b><a href="mailto:support@trapeak.com">support@trapeak.com</a></div><p className="copyright">© 2026 TRAPEAK. All rights reserved.</p></footer></main> }

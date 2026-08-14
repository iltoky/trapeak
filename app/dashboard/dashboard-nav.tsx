"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/dashboard", "Overview"],
  ["/dashboard/training", "Training"],
  ["/dashboard/nutrition", "Nutrition"],
  ["/dashboard/health", "Health"],
  ["/access", "Shared access"],
  ["/dashboard/connections", "Connections"],
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return <nav className="dashboard-nav" aria-label="Account data">
    {items.map(([href, label]) => {
      const current = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
      return <Link href={href} key={href} aria-current={current ? "page" : undefined}>{label}</Link>;
    })}
  </nav>;
}

import type { ReactNode } from "react";

import { getRequestLocale } from "@/lib/i18n/server";

import { ClerkBoundary } from "../clerk-boundary";
import { LocaleFooter } from "../locale-footer";
import "../product.css";

export default async function AccessLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getRequestLocale();
  return <ClerkBoundary>{children}<LocaleFooter locale={locale} /></ClerkBoundary>;
}

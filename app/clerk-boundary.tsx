import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { isAuthConfigured } from "@/lib/auth/config";
import { clerkLocalizations } from "@/lib/i18n/clerk";
import { getRequestLocale } from "@/lib/i18n/server";

export async function ClerkBoundary({ children }: Readonly<{ children: ReactNode }>) {
  if (!isAuthConfigured()) return children;
  const locale = await getRequestLocale();

  return (
    <ClerkProvider
      appearance={{
        options: {
          logoImageUrl: "/brand/trapeak-logo.svg",
          logoLinkUrl: "https://trapeak.com",
          privacyPageUrl: "https://trapeak.com/privacy",
          termsPageUrl: "https://trapeak.com/terms",
        },
      }}
      localization={clerkLocalizations[locale]}
    >
      {children}
    </ClerkProvider>
  );
}

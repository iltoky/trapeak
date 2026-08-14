import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { isAuthConfigured } from "@/lib/auth/config";

export function ClerkBoundary({ children }: Readonly<{ children: ReactNode }>) {
  if (!isAuthConfigured()) return children;

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
    >
      {children}
    </ClerkProvider>
  );
}

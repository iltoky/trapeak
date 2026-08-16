import { SignIn } from "@clerk/nextjs";

import { isAuthConfigured } from "@/lib/auth/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";
import { AuthShell } from "../../auth-shell";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function SignInPage() {
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale).auth;
  return (
    <AuthShell
      eyebrow={messages.eyebrow}
      title={messages.signInTitle}
      description={messages.signInDescription}
      locale={locale}
    >
      {isAuthConfigured() ? (
        <SignIn
          forceRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            variables: {
              colorPrimary: "#090909",
              borderRadius: "0px",
            },
          }}
        />
      ) : (
        <p className="auth-setup">
          {messages.signInSetup}
        </p>
      )}
    </AuthShell>
  );
}

import { SignUp } from "@clerk/nextjs";

import { isAuthConfigured } from "@/lib/auth/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";
import { AuthShell } from "../../auth-shell";

export const metadata = { title: "Create account", robots: { index: false, follow: false } };

export default async function SignUpPage() {
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale).auth;
  return (
    <AuthShell
      eyebrow={messages.eyebrow}
      title={messages.signUpTitle}
      description={messages.signUpDescription}
      locale={locale}
    >
      {isAuthConfigured() ? (
        <SignUp
          forceRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: "#090909",
              borderRadius: "0px",
            },
          }}
        />
      ) : (
        <p className="auth-setup">
          {messages.signUpSetup}
        </p>
      )}
    </AuthShell>
  );
}

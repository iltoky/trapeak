import { SignIn } from "@clerk/nextjs";

import { isAuthConfigured } from "@/lib/auth/config";
import { AuthShell } from "../../auth-shell";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="TRAPEAK ACCOUNT"
      title="Welcome back."
      description="Sign in to manage your personal fitness-data connections."
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
          Account access is being configured. Please check back soon.
        </p>
      )}
    </AuthShell>
  );
}

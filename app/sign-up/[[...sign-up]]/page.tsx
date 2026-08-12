import { SignUp } from "@clerk/nextjs";

import { isAuthConfigured } from "@/lib/auth/config";
import { AuthShell } from "../../auth-shell";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="TRAPEAK ACCOUNT"
      title="Create your account."
      description="Your account keeps every wearable connection isolated and under your control."
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
          Account registration is being configured. Please check back soon.
        </p>
      )}
    </AuthShell>
  );
}

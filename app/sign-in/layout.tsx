import type { ReactNode } from "react";

import { ClerkBoundary } from "../clerk-boundary";

export default function SignInLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <ClerkBoundary>{children}</ClerkBoundary>;
}

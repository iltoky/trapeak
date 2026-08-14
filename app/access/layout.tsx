import type { ReactNode } from "react";

import { ClerkBoundary } from "../clerk-boundary";
import "../product.css";

export default function AccessLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <ClerkBoundary>{children}</ClerkBoundary>;
}

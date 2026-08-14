import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isPublicIntegrationPath } from "@/lib/integrations/public-routes";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/access(.*)",
  "/api/access(.*)",
  "/api/me(.*)",
  "/api/nutrition(.*)",
  "/api/integrations(.*)",
]);

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

const configuredProxy = authConfigured
  ? clerkMiddleware(async (auth, request) => {
      if (
        isProtectedRoute(request) &&
        !isPublicIntegrationPath(request.nextUrl.pathname)
      ) {
        const { userId } = await auth();

        if (!userId && request.nextUrl.pathname.startsWith("/api/")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!userId) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
        }
      }
    })
  : null;

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!configuredProxy) {
    if (
      request.nextUrl.pathname.startsWith("/dashboard")
      || request.nextUrl.pathname.startsWith("/access")
    ) {
      return NextResponse.redirect(
        new URL("/sign-in?setup=required", request.url),
      );
    }

    if (
      request.nextUrl.pathname.startsWith("/api/me") ||
      request.nextUrl.pathname.startsWith("/api/access") ||
      request.nextUrl.pathname.startsWith("/api/nutrition") ||
      (request.nextUrl.pathname.startsWith("/api/integrations") &&
        !isPublicIntegrationPath(request.nextUrl.pathname))
    ) {
      return Response.json(
        { error: "Authentication is not configured" },
        { status: 503 },
      );
    }

    return NextResponse.next();
  }

  return configuredProxy(request, event);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/access/:path*",
    "/api/access/:path*",
    "/api/me/:path*",
    "/api/nutrition/:path*",
    "/api/integrations/:path*",
    "/mcp",
    "/.well-known/oauth-authorization-server",
    "/.well-known/oauth-protected-resource/mcp",
    "/__clerk/:path*",
  ],
};

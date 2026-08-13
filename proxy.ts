import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isPublicIntegrationPath } from "@/lib/integrations/public-routes";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/me(.*)",
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
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(
        new URL("/sign-in?setup=required", request.url),
      );
    }

    if (
      request.nextUrl.pathname.startsWith("/api/me") ||
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};

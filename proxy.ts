import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isPublicIntegrationPath } from "@/lib/integrations/public-routes";
import {
  isAppLocale,
  isPublicPagePath,
  localeCookieName,
  localeFromSlug,
  localePath,
  resolveAcceptLanguage,
} from "@/lib/i18n/config";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/access(.*)",
  "/api/access(.*)",
  "/api/me(.*)",
  "/api/preferences(.*)",
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
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  const firstSegment = pathname.split("/")[1] ?? "";
  const pathLocale = localeFromSlug(firstSegment);
  if (pathLocale) {
    const response = NextResponse.next();
    response.cookies.set(localeCookieName, pathLocale, {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "lax",
      secure: true,
    });
    response.headers.set("Content-Language", pathLocale);
    return response;
  }

  if (isPublicPagePath(pathname)) {
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    const locale = isAppLocale(cookieLocale)
      ? cookieLocale
      : resolveAcceptLanguage(request.headers.get("accept-language"));
    const destination = request.nextUrl.clone();
    destination.pathname = localePath(locale, pathname);
    const response = NextResponse.redirect(destination, 307);
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "lax",
      secure: true,
    });
    return response;
  }

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
      request.nextUrl.pathname.startsWith("/api/preferences") ||
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
    "/((?!_next/static|_next/image|brand|favicon.svg|robots.txt|sitemap.xml|llms.txt|api).*)",
    "/dashboard/:path*",
    "/access/:path*",
    "/api/access/:path*",
    "/api/me/:path*",
    "/api/preferences/:path*",
    "/api/nutrition/:path*",
    "/api/integrations/:path*",
    "/mcp",
    "/.well-known/oauth-authorization-server",
    "/.well-known/oauth-protected-resource/mcp",
    "/__clerk/:path*",
  ],
};

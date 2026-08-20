import { NextResponse, type NextRequest } from "next/server";

import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  isPerformanceLoggingEnabled,
  startPerformanceTimer,
} from "@/lib/performance";

export function proxy(request: NextRequest) {
  const performanceLoggingEnabled = isPerformanceLoggingEnabled();
  const timer = performanceLoggingEnabled
    ? startPerformanceTimer("proxy", {
        route: request.nextUrl.pathname,
      })
    : undefined;
  let response: NextResponse;

  // Proxy performs only an optimistic cookie check. Every protected layout and
  // API mutation still performs the authoritative database-backed check.
  if (!request.cookies.has(AUTH_SESSION_COOKIE_NAME)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    response = NextResponse.redirect(loginUrl);
  } else {
    response = NextResponse.next();
  }

  if (timer) {
    const durationMs = timer.end({
      outcome:
        response.status >= 300 && response.status < 400 ? "redirect" : "next",
    });
    response.headers.append(
      "Server-Timing",
      `proxy;dur=${durationMs.toFixed(1)}`,
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/dashboard/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/stock-in/:path*",
    "/stock-out/:path*",
    "/categories/:path*",
    "/suppliers/:path*",
    "/customers/:path*",
    "/sales/:path*",
    "/purchases/:path*",
    "/stock-transfers/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/change-password/:path*",
  ],
};

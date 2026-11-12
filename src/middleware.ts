import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const SESSION_COOKIE = "wasel_session";
const REQUEST_ID_HEADER = "x-request-id";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get(REQUEST_ID_HEADER)?.trim() || randomUUID();
  const response = NextResponse.next();
  response.headers.set(REQUEST_ID_HEADER, requestId);
  const headers = response.headers;
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self';");

  const isProtectedAppRoute = request.nextUrl.pathname === "/app" || request.nextUrl.pathname.startsWith("/app/");
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (isProtectedAppRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set(REQUEST_ID_HEADER, requestId);
    return redirect;
  }
  if (request.nextUrl.pathname === "/login" && hasSessionCookie) {
    const redirect = NextResponse.redirect(new URL("/app", request.url));
    redirect.headers.set(REQUEST_ID_HEADER, requestId);
    return redirect;
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

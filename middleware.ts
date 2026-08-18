import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/signup",
  "/api/auth/login",
  "/api/auth/register",
  "/api/verify/info",   // candidate checks their link (public)
  "/api/verify/update", // candidate simulates completion (public)
  "/api/webhooks/didit", // Didit webhook (public)
  "/verify",            // candidate verification page (public)
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Allow public paths, API routes, and root
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname === "/" ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
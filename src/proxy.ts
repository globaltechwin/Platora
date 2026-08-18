import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/welcome",
  "/sites",
  "/plots",
  "/bookings",
  "/customers",
  "/agents",
  "/reports",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("platora_auth");

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && authCookie) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/welcome",
    "/dashboard/:path*",
    "/sites/:path*",
    "/plots/:path*",
    "/bookings/:path*",
    "/customers/:path*",
    "/agents/:path*",
    "/reports/:path*",
  ],
};

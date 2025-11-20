import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const url = request.nextUrl.clone();

  // Public routes (no auth required)
  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to /login
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const payload = parseJwt(token);
  if (!payload) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = payload?.role as string | undefined;

  // Admin dashboard protection
  if (url.pathname.startsWith("/admin-dashboard") && role !== "admin") {
    url.pathname = "/user-dashboard";
    return NextResponse.redirect(url);
  }

  // User dashboard protection (allow user only)
  if (url.pathname.startsWith("/user-dashboard") && role !== "user") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Decode JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/admin-dashboard/:path*",
  ],
};

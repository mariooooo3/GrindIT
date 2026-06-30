import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (
    request.method !== "POST" &&
    request.method !== "PUT" &&
    request.method !== "DELETE" &&
    request.method !== "PATCH"
  ) {
    return NextResponse.next();
  }

  // NextAuth routes have their own CSRF protection
  if (request.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  if (!origin) return NextResponse.next();

  const host = request.headers.get("host");
  if (!host) return NextResponse.next();

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

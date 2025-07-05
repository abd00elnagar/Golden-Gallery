// --- SESSION TYPE ---
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  expires: string;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Restrict /admin routes to admin users only
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  if (request.nextUrl.pathname.startsWith("/auth/signin")) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    } else if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

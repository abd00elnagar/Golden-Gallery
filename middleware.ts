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

// Simple in-memory store for rate limiting
// Note: In production, use Redis or similar for distributed rate limiting
const rateLimit = new Map();

// Rate limit function
function checkRateLimit(ip: string): boolean {
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, timestamp: Date.now() });
    return true;
  }

  const rateLimitData = rateLimit.get(ip);
  const timeDiff = Date.now() - rateLimitData.timestamp;

  // Reset counter after 1 minute
  if (timeDiff > 60000) {
    rateLimit.set(ip, { count: 1, timestamp: Date.now() });
    return true;
  }

  // Allow max 60 requests per minute
  if (rateLimitData.count > 60) {
    return false;
  }

  rateLimitData.count++;
  return true;
}

// Restrict /admin routes to admin users only
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Basic rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: response.headers,
    });
  }

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

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/signin"],
};

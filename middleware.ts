import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  const headers = response.headers

  // HTTPS enforcement
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY")

  // XSS Protection
  headers.set("X-XSS-Protection", "1; mode=block")

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff")

  // Referrer Policy
  headers.set("Referrer-Policy", "no-referrer")

  // Permissions Policy (formerly Feature Policy)
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com; frame-src 'self' https://www.google.com;",
  )

  // Basic rate limiting (IP-based)
  const ip = request.ip || "unknown"
  const rateLimit = request.cookies.get("rate_limit_" + ip)?.value

  if (rateLimit) {
    const { count, timestamp } = JSON.parse(rateLimit)
    const now = Date.now()

    // Reset after 1 minute
    if (now - timestamp < 60000) {
      if (count > 30) {
        // 30 requests per minute
        return new NextResponse("Too Many Requests", { status: 429 })
      }

      response.cookies.set("rate_limit_" + ip, JSON.stringify({ count: count + 1, timestamp }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    } else {
      response.cookies.set("rate_limit_" + ip, JSON.stringify({ count: 1, timestamp: now }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    }
  } else {
    response.cookies.set("rate_limit_" + ip, JSON.stringify({ count: 1, timestamp: Date.now() }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
  }

  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

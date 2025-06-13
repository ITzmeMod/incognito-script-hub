import { type NextRequest, NextResponse } from "next/server"
import { sign, verify } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply stricter rate limiting for refresh endpoint
  const limiter = await rateLimit(request, 3, "60 s")
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  // Get refresh token from cookies
  const refreshToken = request.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
  }

  try {
    // Verify the refresh token
    const payload = await verify(refreshToken)

    if (!payload || payload.type !== "refresh") {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Generate new access token
    const accessToken = await sign({
      sub: payload.sub,
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    })

    // Generate new refresh token (token rotation for security)
    const newRefreshToken = await sign({
      sub: payload.sub,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    })

    const response = NextResponse.json({
      success: true,
      accessToken,
    })

    // Set new refresh token cookie
    response.cookies.set({
      name: "refresh_token",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)

    // Clear the invalid refresh token
    const response = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })

    response.cookies.delete("refresh_token")

    return response
  }
}

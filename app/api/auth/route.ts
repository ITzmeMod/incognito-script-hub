import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sign } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"

// Schema for login validation
const loginSchema = z.object({
  password: z.string().min(8),
  token: z.string(),
})

// Owner password hash - in production, store this in environment variables
const OWNER_PASSWORD_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" // "password" - change this!

export async function POST(request: NextRequest) {
  // Apply rate limiting - 5 requests per minute
  const limiter = await rateLimit(request, 5, "60 s")
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const { password, token } = validation.data

    // Verify CSRF token
    // In a real app, verify against a server-side stored token
    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Invalid security token" }, { status: 403 })
    }

    // Hash the password and compare
    // In production, use a proper password hashing library
    const hashedPassword = await hashPassword(password)

    if (hashedPassword !== OWNER_PASSWORD_HASH) {
      // Log failed attempt
      console.log(`Failed login attempt from IP: ${request.ip}`)

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const accessToken = await sign({
      sub: "owner",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    })

    // Generate refresh token with longer expiry
    const refreshToken = await sign({
      sub: "owner",
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    })

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      accessToken,
    })

    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

// Simple password hashing function (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

import { type NextRequest, NextResponse } from "next/server"
import { verify } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"

// Schema for audit log entry
const auditLogSchema = z.object({
  action: z.string(),
  details: z.string().optional(),
  timestamp: z.number().optional(),
})

// In-memory audit log storage
// In production, use a database
const auditLogs: Array<{
  action: string
  details?: string
  timestamp: number
  ip?: string
}> = []

// Add an audit log entry (owner only)
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const limiter = await rateLimit(request, 20, "60 s")
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  // Verify authentication
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verify JWT token
    const payload = await verify(token)

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Process the audit log entry
    const body = await request.json()

    // Validate data
    const validation = auditLogSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid audit log data" }, { status: 400 })
    }

    const { action, details, timestamp = Date.now() } = validation.data

    // Add to audit log
    const logEntry = {
      action,
      details,
      timestamp,
      ip: request.ip,
    }

    auditLogs.unshift(logEntry) // Add to beginning of array

    // Keep only the last 1000 entries
    if (auditLogs.length > 1000) {
      auditLogs.pop()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Audit log error:", error)
    return NextResponse.json({ error: "Failed to log audit entry" }, { status: 500 })
  }
}

// Get audit logs (owner only)
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const limiter = await rateLimit(request, 10, "60 s")
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  // Verify authentication
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verify JWT token
    const payload = await verify(token)

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get query parameters for pagination
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Return paginated logs
    const paginatedLogs = auditLogs.slice(offset, offset + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      total: auditLogs.length,
    })
  } catch (error) {
    console.error("Audit log retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve audit logs" }, { status: 500 })
  }
}

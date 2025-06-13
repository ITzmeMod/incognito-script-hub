import { type NextRequest, NextResponse } from "next/server"
import { verify } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"
import { scripts } from "../scripts/route" // Import scripts from the scripts route

// Schema for backup data
const backupSchema = z.object({
  scripts: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      description: z.string(),
      link: z.string().url(),
      downloads: z.number(),
      category: z.string(),
      isNew: z.boolean().optional(),
      featured: z.boolean().optional(),
    }),
  ),
  settings: z.record(z.string(), z.any()).optional(),
  version: z.string(),
})

// Get a backup of all data (owner only)
export async function GET(request: NextRequest) {
  // Apply strict rate limiting for backup operations
  const limiter = await rateLimit(request, 3, "60 s")
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

    // Create backup data
    const backupData = {
      scripts,
      settings: {
        // Add any site settings here
      },
      version: "1.0.0",
      timestamp: Date.now(),
    }

    return NextResponse.json(backupData)
  } catch (error) {
    console.error("Backup error:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}

// Restore from backup (owner only)
export async function POST(request: NextRequest) {
  // Apply strict rate limiting for restore operations
  const limiter = await rateLimit(request, 1, "300 s") // 1 request per 5 minutes
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

    // Process the backup data
    const body = await request.json()

    // Validate backup data
    const validation = backupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid backup data", details: validation.error.errors }, { status: 400 })
    }

    const { scripts: backupScripts } = validation.data

    // Restore scripts
    scripts.length = 0 // Clear existing scripts
    scripts.push(...backupScripts)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Restore error:", error)
    return NextResponse.json({ error: "Failed to restore from backup" }, { status: 500 })
  }
}

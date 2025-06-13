import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { verify } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"
import { sanitizeHtml } from "@/lib/validation"

// Schema for script validation
const scriptSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  link: z.string().url(),
  downloads: z.number().int().nonnegative(),
  category: z.string().min(1),
  isNew: z.boolean().optional(),
  featured: z.boolean().optional(),
})

// Mock database - in production, use a real database
// Export the scripts array so it can be imported in other files
export const scripts = [
  {
    id: 1,
    title: "Ultimate Game Pass Unlocker",
    description:
      "This script allows you to access free game passes and use advanced tools across multiple Roblox games.",
    link: "https://work.ink/your-monetized-link-1",
    downloads: 18453,
    category: "Premium",
    isNew: true,
    featured: true,
  },
  {
    id: 2,
    title: "Infinite Jump Script",
    description: "This script allows your character to jump infinitely in any Roblox game.",
    link: "https://work.ink/your-monetized-link-2",
    downloads: 12453,
    category: "Movement",
  },
]

// Get all scripts
export async function GET(request: NextRequest) {
  // Apply rate limiting - 20 requests per minute
  const limiter = await rateLimit(request, 20, "60 s")
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  return NextResponse.json({ scripts })
}

// Create or update a script (owner only)
export async function POST(request: NextRequest) {
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

    // Process the script data
    const body = await request.json()

    // Validate script data
    const validation = scriptSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid script data", details: validation.error.errors }, { status: 400 })
    }

    const script = validation.data

    // Sanitize text fields to prevent XSS
    script.title = sanitizeHtml(script.title)
    script.description = sanitizeHtml(script.description)
    script.category = sanitizeHtml(script.category)

    // Update or create script
    if (script.id) {
      // Update existing script
      const index = scripts.findIndex((s) => s.id === script.id)
      if (index === -1) {
        return NextResponse.json({ error: "Script not found" }, { status: 404 })
      }

      scripts[index] = script
    } else {
      // Create new script
      const newId = Math.max(0, ...scripts.map((s) => s.id)) + 1
      scripts.push({ ...script, id: newId })
    }

    return NextResponse.json({ success: true, script })
  } catch (error) {
    console.error("Script API error:", error)
    return NextResponse.json({ error: "Failed to process script" }, { status: 500 })
  }
}

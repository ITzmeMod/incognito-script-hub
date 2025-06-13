import { type NextRequest, NextResponse } from "next/server"
import { verify } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"
import { scripts } from "../route" // Import scripts from the route.ts file

// Delete a script by ID (owner only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Apply rate limiting
  const limiter = await rateLimit(request, 5, "60 s")
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

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid script ID" }, { status: 400 })
    }

    // Find and delete the script
    const initialLength = scripts.length
    const filteredScripts = scripts.filter((script) => script.id !== id)

    if (filteredScripts.length === initialLength) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    // Update the scripts array
    scripts.length = 0
    scripts.push(...filteredScripts)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Script delete error:", error)
    return NextResponse.json({ error: "Failed to delete script" }, { status: 500 })
  }
}

// Get a specific script by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Apply rate limiting
  const limiter = await rateLimit(request, 20, "60 s")
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  const id = Number.parseInt(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid script ID" }, { status: 400 })
  }

  const script = scripts.find((s) => s.id === id)

  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 })
  }

  return NextResponse.json({ script })
}

import type { NextRequest } from "next/server"

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory store for rate limiting
// In production, use Redis or another distributed store
const ratelimitStore = new Map<string, { count: number; timestamp: number }>()

// Clean up the store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of ratelimitStore.entries()) {
    if (now - value.timestamp > 60000) {
      // 1 minute
      ratelimitStore.delete(key)
    }
  }
}, 60000) // Run every minute

export async function rateLimit(request: NextRequest, limit: number, duration: string): Promise<RateLimitResult> {
  // Get a unique identifier for the requester (IP address or token)
  const ip = request.ip || "unknown"
  const key = `${ip}:${request.nextUrl.pathname}`

  // Parse duration (e.g., "60 s", "10 m")
  const [value, unit] = duration.split(" ")
  const durationMs = Number.parseInt(value) * (unit === "m" ? 60000 : 1000)

  const now = Date.now()
  const resetTime = now + durationMs

  // Get current rate limit data
  const current = ratelimitStore.get(key) || { count: 0, timestamp: now }

  // Reset if the time window has passed
  if (now - current.timestamp > durationMs) {
    current.count = 0
    current.timestamp = now
  }

  // Increment count
  current.count++
  ratelimitStore.set(key, current)

  // Check if over limit
  const remaining = Math.max(0, limit - current.count)
  const success = current.count <= limit

  return {
    success,
    limit,
    remaining,
    reset: resetTime,
  }
}

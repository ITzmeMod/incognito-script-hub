import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Create response that clears the refresh token cookie
  const response = NextResponse.json({ success: true })

  // Clear the refresh token cookie
  response.cookies.delete("refresh_token")

  return response
}

// A simple JWT implementation for client-side use
// In production, use a proper JWT library and secure key management

// Secret key - in production, use environment variables
const SECRET_KEY = "your-secret-key-change-this-in-production"

interface JWTPayload {
  sub: string
  [key: string]: any
}

// Sign a JWT token
export async function sign(payload: JWTPayload): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))

  const dataToSign = `${encodedHeader}.${encodedPayload}`

  // In a real implementation, use crypto.subtle.sign with a proper key
  // This is a simplified version for demonstration
  const encoder = new TextEncoder()
  const data = encoder.encode(dataToSign + SECRET_KEY)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Verify a JWT token
export async function verify(token: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".")

    if (!encodedHeader || !encodedPayload || !signature) {
      return null
    }

    // Verify signature
    const dataToSign = `${encodedHeader}.${encodedPayload}`
    const encoder = new TextEncoder()
    const data = encoder.encode(dataToSign + SECRET_KEY)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload)) as JWTPayload

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    return payload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

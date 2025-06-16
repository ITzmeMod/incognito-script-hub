// Cloudflare Worker for Google ID token validation
// Deploy this to Cloudflare Workers for backend validation

// Your Google Client ID
const GOOGLE_CLIENT_ID = "1039114733186-g6t8o74124davbf2v4cud6ldtjfvo9gi.apps.googleusercontent.com"
// The owner's email address
const OWNER_EMAIL = "fortuitocliffordgwapo@gmail.com"

// Google's public keys endpoint
const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"

// Cache for Google's public keys
const publicKeysCache = {
  keys: null,
  expiresAt: 0,
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return handleCORS(request)
  }

  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    // Parse the request body
    const { idToken } = await request.json()

    if (!idToken) {
      return jsonResponse({ error: "ID token is required" }, 400)
    }

    // Validate the ID token
    const payload = await verifyGoogleIdToken(idToken)

    // Check if it's the owner's email
    const isOwner = payload.email === OWNER_EMAIL

    return jsonResponse({
      isValid: true,
      isOwner,
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      },
    })
  } catch (error) {
    return jsonResponse({ error: error.message }, 401)
  }
}

// Verify a Google ID token
async function verifyGoogleIdToken(token) {
  // Parse the token
  const [header, payload, signature] = token.split(".")

  // Decode the header and payload
  const decodedHeader = JSON.parse(atob(header))
  const decodedPayload = JSON.parse(atob(payload))

  // Check if the token is expired
  const now = Math.floor(Date.now() / 1000)
  if (decodedPayload.exp < now) {
    throw new Error("Token expired")
  }

  // Check if the token was issued for our client
  if (decodedPayload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Invalid audience")
  }

  // Check if the token was issued by Google
  if (decodedPayload.iss !== "https://accounts.google.com" && decodedPayload.iss !== "accounts.google.com") {
    throw new Error("Invalid issuer")
  }

  // In a production environment, you would verify the signature using Google's public keys
  // This is a simplified version for demonstration purposes

  return decodedPayload
}

// Helper function to create JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

// Handle CORS preflight requests
function handleCORS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  })
}

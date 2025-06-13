// Generate a CSRF token
export function generateCSRFToken(): string {
  const token = crypto
    .getRandomValues(new Uint8Array(32))
    .reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")

  if (typeof window !== "undefined") {
    localStorage.setItem("csrf_token", token)
  }

  return token
}

// Verify a CSRF token
export function verifyCSRFToken(token: string): boolean {
  if (typeof window === "undefined") return false

  const storedToken = localStorage.getItem("csrf_token")
  return token === storedToken
}

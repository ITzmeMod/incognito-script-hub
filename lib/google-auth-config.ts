// Google OAuth Configuration
// IMPORTANT: Replace with your actual Google Client ID from Google Cloud Console

export const GOOGLE_CLIENT_ID = "1039114733186-g6t8o74124davbf2v4cud6ldtjfvo9gi.apps.googleusercontent.com"
export const OWNER_EMAIL = "fortuitocliffordgwapo@gmail.com" // Owner's Google email address

// Fallback configuration
export const GOOGLE_AUTH_CONFIG = {
  client_id: GOOGLE_CLIENT_ID,
  callback: "handleCredentialResponse",
  auto_select: false,
  cancel_on_tap_outside: true,
  context: "signin",
  ux_mode: "popup",
  use_fedcm_for_prompt: false,
}

// Check if client ID is properly configured
export const isGoogleAuthConfigured = () => {
  if (typeof window === "undefined") return false

  return (
    GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_ID !== "1039114733186-g6t8o74124davbf2v4cud6ldtjfvo9gi.apps.googleusercontent.com" &&
    GOOGLE_CLIENT_ID.length > 20 &&
    GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com")
  )
}

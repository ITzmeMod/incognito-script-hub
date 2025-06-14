// Google OAuth Configuration
// IMPORTANT: Replace with your actual Google Client ID from Google Cloud Console

// For demo purposes, we'll use a placeholder that allows the app to work without Google Auth
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
  return (
    GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_ID !== "1039114733186-g6t8o74124davbf2v4cud6ldtjfvo9gi.apps.googleusercontent.com" &&
    GOOGLE_CLIENT_ID !== "1039114733186-g6t8o74124davbf2v4cud6ldtjfvo9gi.apps.googleusercontent.com" &&
    GOOGLE_CLIENT_ID.length > 20 &&
    GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com")
  )
}

// Instructions for setting up Google OAuth
export const GOOGLE_SETUP_INSTRUCTIONS = {
  title: "How to Set Up Google Authentication",
  steps: [
    "Go to Google Cloud Console (console.cloud.google.com)",
    "Create a new project or select an existing one",
    "Enable the Google+ API or Google Identity API",
    "Go to 'Credentials' and create an OAuth 2.0 Client ID",
    "Add your domain to 'Authorized JavaScript origins'",
    "Copy the Client ID and replace 'YOUR_GOOGLE_CLIENT_ID_HERE' in the config",
    "Deploy your changes",
  ],
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGoogleAuth } from "@/lib/use-google-auth"
import { LucideLogOut, LucideLoader2, LucideRefreshCw, LucideAlertCircle, LucideExternalLink } from "lucide-react"
import { isGoogleAuthConfigured } from "@/lib/google-auth-config"

export default function GoogleSignIn() {
  const { isOwner, isLoading, user, error, renderSignInButton, triggerSignIn, signOut, sdkLoaded } = useGoogleAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [buttonRendered, setButtonRendered] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // Check if Google Auth is properly configured
  const authConfigured = isGoogleAuthConfigured()

  // Attempt to render the button when SDK is ready
  useEffect(() => {
    if (!authConfigured) return

    if (!isOwner && !isLoading && sdkLoaded && buttonRef.current && !buttonRendered) {
      console.log("🎨 Attempting to render Google Sign-In button")

      const success = renderSignInButton("google-signin-button")

      if (success) {
        setButtonRendered(true)
        setShowFallback(false)
      } else {
        // Show fallback after a delay
        setTimeout(() => {
          setShowFallback(true)
        }, 3000)
      }
    }
  }, [isOwner, isLoading, sdkLoaded, renderSignInButton, buttonRendered, authConfigured])

  // Manual retry function
  const retryRender = () => {
    console.log("🔄 Manual retry of button render")
    setButtonRendered(false)
    setShowFallback(false)

    if (buttonRef.current) {
      buttonRef.current.innerHTML = ""
    }

    // Force a re-render attempt
    setTimeout(() => {
      if (buttonRef.current && sdkLoaded) {
        renderSignInButton("google-signin-button")
      }
    }, 500)
  }

  // Show configuration error if Google Auth is not set up
  if (!authConfigured) {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <LucideAlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-400 font-medium">Google Authentication Setup Required</p>
            <p className="text-gray-400 text-sm mt-1">
              Google Sign-In is not configured. The owner needs to set up Google OAuth.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full border-blue-500 text-blue-400"
            onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
          >
            <LucideExternalLink className="h-4 w-4 mr-2" />
            Google Cloud Console
          </Button>

          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">Setup Instructions</summary>
            <div className="mt-2 space-y-1 pl-2">
              <p>1. Go to Google Cloud Console</p>
              <p>2. Create a new project or select existing</p>
              <p>3. Enable Google+ API</p>
              <p>4. Create OAuth 2.0 Client ID</p>
              <p>5. Add your domain to authorized origins</p>
              <p>6. Update the Client ID in the code</p>
            </div>
          </details>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LucideLoader2 className="h-5 w-5 animate-spin text-green-400" />
        <span className="ml-2 text-green-400">Loading authentication...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <LucideAlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Authentication Error</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full border-orange-500 text-orange-400"
            onClick={() => window.location.reload()}
          >
            <LucideRefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>

          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">Troubleshooting Tips</summary>
            <div className="mt-2 space-y-1 pl-2">
              <p>• Check if Google OAuth is properly configured</p>
              <p>• Verify the Client ID is correct</p>
              <p>• Ensure your domain is authorized in Google Cloud</p>
              <p>• Disable ad blockers and privacy extensions</p>
              <p>• Try incognito/private browsing mode</p>
              <p>• Clear browser cache and cookies</p>
            </div>
          </details>
        </div>
      </div>
    )
  }

  if (isOwner && user) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2">
          <img
            src={user.picture || "/placeholder.svg"}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-green-500"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-green-400 font-medium">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-red-400 hover:text-red-300 w-full justify-start"
        >
          <LucideLogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-400 text-sm text-center">Sign in with Google to access owner features</p>

      {/* Main Google Sign-In Button Container */}
      <div id="google-signin-button" ref={buttonRef} className="w-full min-w-[200px]">
        {/* This div will be populated by Google SDK */}
      </div>

      {/* Loading state */}
      {!sdkLoaded && (
        <div className="flex items-center justify-center p-4">
          <LucideLoader2 className="h-4 w-4 animate-spin text-blue-400" />
          <span className="ml-2 text-blue-400 text-sm">Loading Google Sign-In...</span>
        </div>
      )}

      {/* Fallback options */}
      {sdkLoaded && (showFallback || !buttonRendered) && (
        <div className="space-y-2">
          <Button variant="outline" className="w-full border-blue-500 text-blue-400" onClick={triggerSignIn}>
            🔐 Sign in with Google (Alternative)
          </Button>

          <Button variant="outline" className="w-full border-orange-500 text-orange-400" onClick={retryRender}>
            <LucideRefreshCw className="h-4 w-4 mr-2" />
            Retry Sign-In Button
          </Button>
        </div>
      )}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Config: {authConfigured ? "✅ Valid" : "❌ Missing"}</p>
          <p>SDK: {sdkLoaded ? "✅ Loaded" : "❌ Loading..."}</p>
          <p>Button: {buttonRendered ? "✅ Rendered" : "❌ Not rendered"}</p>
        </div>
      )}
    </div>
  )
}

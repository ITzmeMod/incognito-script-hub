"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGoogleAuth } from "@/lib/use-google-auth"
import {
  LucideLogOut,
  LucideLoader2,
  LucideRefreshCw,
  LucideAlertCircle,
  LucideExternalLink,
  LucideInfo,
} from "lucide-react"
import { isGoogleAuthConfigured, GOOGLE_SETUP_INSTRUCTIONS } from "@/lib/google-auth-config"

export default function GoogleSignIn() {
  const { isOwner, isLoading, user, error, renderSignInButton, triggerSignIn, signOut, sdkLoaded } = useGoogleAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [buttonRendered, setButtonRendered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if Google Auth is properly configured
  const authConfigured = isGoogleAuthConfigured()

  // Attempt to render the button when SDK is ready
  useEffect(() => {
    if (!mounted || !authConfigured || isOwner || isLoading || !sdkLoaded || buttonRendered) return

    const timer = setTimeout(() => {
      if (buttonRef.current) {
        const success = renderSignInButton("google-signin-button")
        if (success) {
          setButtonRendered(true)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [mounted, authConfigured, isOwner, isLoading, sdkLoaded, renderSignInButton, buttonRendered])

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  // Show configuration instructions if Google Auth is not set up
  if (!authConfigured) {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <LucideInfo className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-400 font-medium">Google Authentication Available</p>
            <p className="text-gray-400 text-sm mt-1">Set up Google OAuth to enable owner authentication.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full border-blue-500 text-blue-400"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? "Hide" : "Show"} Setup Instructions
          </Button>

          {showInstructions && (
            <div className="space-y-3 p-3 border border-blue-900 rounded-lg bg-blue-950/20">
              <h4 className="text-blue-300 font-medium">{GOOGLE_SETUP_INSTRUCTIONS.title}</h4>
              <ol className="text-xs text-gray-400 space-y-1">
                {GOOGLE_SETUP_INSTRUCTIONS.steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-400 font-mono">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <Button
                variant="outline"
                className="w-full border-blue-500 text-blue-400 mt-3"
                onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
              >
                <LucideExternalLink className="h-4 w-4 mr-2" />
                Open Google Cloud Console
              </Button>
            </div>
          )}

          <div className="p-3 border border-amber-900 rounded-lg bg-amber-950/20">
            <p className="text-amber-300 text-sm">
              <strong>Note:</strong> The website works perfectly without Google authentication. Owner features are
              optional and only needed if you want secure admin access.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LucideLoader2 className="h-5 w-5 animate-spin text-green-400" />
        <span className="ml-2 text-green-400">Loading...</span>
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
        <Button
          variant="outline"
          className="w-full border-orange-500 text-orange-400"
          onClick={() => window.location.reload()}
        >
          <LucideRefreshCw className="h-4 w-4 mr-2" />
          Refresh Page
        </Button>
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

      {/* Google Sign-In Button Container */}
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

      {/* Fallback button */}
      {sdkLoaded && !buttonRendered && (
        <Button variant="outline" className="w-full border-blue-500 text-blue-400" onClick={triggerSignIn}>
          🔐 Sign in with Google
        </Button>
      )}
    </div>
  )
}

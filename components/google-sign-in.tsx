"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGoogleAuth } from "@/lib/use-google-auth"
import { LucideLogOut, LucideLoader2, LucideRefreshCw, LucideAlertCircle } from "lucide-react"
import { isGoogleAuthConfigured } from "@/lib/google-auth-config"

export default function GoogleSignIn() {
  const { isOwner, isLoading, user, error, renderSignInButton, triggerSignIn, signOut, sdkLoaded } = useGoogleAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [buttonRendered, setButtonRendered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [renderAttempts, setRenderAttempts] = useState(0)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if Google Auth is properly configured
  const authConfigured = isGoogleAuthConfigured()

  // Attempt to render the button when SDK is ready
  useEffect(() => {
    if (!mounted || !authConfigured || isOwner || isLoading || !sdkLoaded || buttonRendered || renderAttempts >= 3)
      return

    const timer = setTimeout(() => {
      if (buttonRef.current) {
        console.log(`🎨 Attempting to render button (attempt ${renderAttempts + 1})`)
        const success = renderSignInButton("google-signin-button")
        if (success) {
          setButtonRendered(true)
          console.log("✅ Button rendered successfully")
        } else {
          setRenderAttempts((prev) => prev + 1)
          console.log(`❌ Button render failed (attempt ${renderAttempts + 1})`)
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [mounted, authConfigured, isOwner, isLoading, sdkLoaded, renderSignInButton, buttonRendered, renderAttempts])

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  if (!authConfigured) {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <LucideAlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-400 font-medium">Google Authentication Not Configured</p>
            <p className="text-gray-400 text-sm mt-1">Please check the Google Client ID configuration.</p>
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
            <p className="text-green-300 text-xs">✅ Owner Access</p>
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
    <div className="p-2">
      {/* Google Sign-In Button Container */}
      <div id="google-signin-button" ref={buttonRef} className="w-full min-w-[200px] flex justify-center">
        {/* This div will be populated by Google SDK */}
      </div>

      {/* Loading state */}
      {!sdkLoaded && (
        <div className="flex items-center justify-center p-4">
          <LucideLoader2 className="h-4 w-4 animate-spin text-blue-400" />
          <span className="ml-2 text-blue-400 text-sm">Loading Google Sign-In...</span>
        </div>
      )}

      {/* Fallback button - only show if button failed to render after multiple attempts */}
      {sdkLoaded && !buttonRendered && renderAttempts >= 3 && (
        <div className="space-y-2">
          <Button variant="outline" className="w-full border-blue-500 text-blue-400" onClick={triggerSignIn}>
            🔐 Sign in with Google
          </Button>
          <Button
            variant="outline"
            className="w-full border-green-500 text-green-400"
            onClick={() => {
              setButtonRendered(false)
              setRenderAttempts(0)
            }}
          >
            <LucideRefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}

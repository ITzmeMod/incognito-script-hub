"use client"

import { useState, useEffect, useCallback } from "react"
import { GOOGLE_CLIENT_ID, OWNER_EMAIL } from "./google-auth-config"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement | string, config: any) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
    handleCredentialResponse?: (response: any) => void
    onGoogleLibraryLoad?: () => void
  }
}

interface GoogleUser {
  email: string
  name: string
  picture: string
  sub: string
}

interface AuthState {
  isOwner: boolean
  isLoading: boolean
  user: GoogleUser | null
  error: string | null
}

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isOwner: false,
    isLoading: true,
    user: null,
    error: null,
  })

  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [loadAttempts, setLoadAttempts] = useState(0)

  // Handle the credential response from Google
  const handleCredentialResponse = useCallback((response: any) => {
    console.log("Google credential response received")

    if (typeof window === "undefined") return

    try {
      const idToken = response.credential
      const user = parseJwt(idToken)

      localStorage.setItem("google_id_token", idToken)

      const isOwner = user.email === OWNER_EMAIL

      setAuthState({
        isOwner,
        isLoading: false,
        user: {
          email: user.email,
          name: user.name,
          picture: user.picture,
          sub: user.sub,
        },
        error: null,
      })

      if (isOwner) {
        console.log("✅ Owner authenticated:", user.email)
      } else {
        console.log("ℹ️ User authenticated (not owner):", user.email)
      }
    } catch (error) {
      console.error("❌ Authentication error:", error)
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Authentication failed",
      })
    }
  }, [])

  // Alternative method to load Google SDK
  const loadGoogleSDKAlternative = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      // Method 1: Try direct script injection with different approach
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true

      // Remove existing scripts first
      const existingScripts = document.querySelectorAll('script[src*="accounts.google.com"]')
      existingScripts.forEach((s) => s.remove())

      let resolved = false

      const onSuccess = () => {
        if (resolved) return
        resolved = true
        console.log("✅ Google SDK loaded (alternative method)")
        setSdkLoaded(true)
        resolve(true)
      }

      const onError = () => {
        if (resolved) return
        resolved = true
        console.log("❌ Alternative SDK load failed")
        resolve(false)
      }

      // Multiple event listeners for better compatibility
      script.onload = onSuccess
      script.addEventListener("load", onSuccess)
      script.onerror = onError
      script.addEventListener("error", onError)

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          console.log("⏰ SDK load timeout")
          onError()
        }
      }, 10000)

      // Check if SDK is already available
      if (window.google?.accounts) {
        onSuccess()
        return
      }

      document.head.appendChild(script)
    })
  }, [])

  // Method to check if SDK is working
  const checkSDKAvailability = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      let attempts = 0
      const maxAttempts = 20

      const checkInterval = setInterval(() => {
        attempts++

        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          console.log("✅ Google SDK is available")
          resolve(true)
          return
        }

        if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          console.log("❌ Google SDK not available after waiting")
          resolve(false)
        }
      }, 500)
    })
  }, [])

  // Load the Google Sign-In SDK with multiple fallback methods
  useEffect(() => {
    if (typeof window === "undefined") {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    // Check if client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      console.error("❌ Google Client ID not configured")
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Google authentication not configured. Please check your Google Client ID.",
      })
      return
    }

    // Make the callback globally available
    window.handleCredentialResponse = handleCredentialResponse

    const loadSDK = async () => {
      console.log(`📦 Loading Google SDK (attempt ${loadAttempts + 1})...`)

      // Check if already loaded
      if (window.google?.accounts) {
        console.log("✅ Google SDK already available")
        setSdkLoaded(true)
        initializeGoogleAuth()
        return
      }

      // Try alternative loading method
      const loaded = await loadGoogleSDKAlternative()

      if (loaded) {
        // Wait a bit more and check availability
        const available = await checkSDKAvailability()
        if (available) {
          initializeGoogleAuth()
        } else {
          handleSDKLoadFailure()
        }
      } else {
        handleSDKLoadFailure()
      }
    }

    const handleSDKLoadFailure = () => {
      if (loadAttempts < 2) {
        console.log("🔄 Retrying SDK load...")
        setLoadAttempts((prev) => prev + 1)
        setTimeout(loadSDK, 2000)
      } else {
        console.error("❌ Failed to load Google SDK after multiple attempts")
        setAuthState({
          isOwner: false,
          isLoading: false,
          user: null,
          error:
            "Failed to load Google Sign-In. This might be due to network restrictions, ad blockers, or browser settings. Please try refreshing the page or using a different browser.",
        })
      }
    }

    loadSDK()

    return () => {
      // Cleanup
      if (window.handleCredentialResponse) {
        delete window.handleCredentialResponse
      }
    }
  }, [handleCredentialResponse, loadAttempts, loadGoogleSDKAlternative, checkSDKAvailability])

  // Initialize Google Auth
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID || typeof window === "undefined") {
      console.warn("⚠️ Cannot initialize - SDK not ready")
      return
    }

    try {
      console.log("🔧 Initializing Google Auth...")

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        ux_mode: "popup",
        use_fedcm_for_prompt: false,
      })

      console.log("✅ Google Auth initialized")

      // Check for stored token
      checkStoredToken()
    } catch (error) {
      console.error("❌ Failed to initialize Google Auth:", error)
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Failed to initialize Google authentication",
      })
    }
  }, [handleCredentialResponse])

  // Check stored token
  const checkStoredToken = useCallback(() => {
    const storedToken = localStorage.getItem("google_id_token")
    if (storedToken) {
      try {
        const user = parseJwt(storedToken)

        // Check if token is expired
        const currentTime = Date.now() / 1000
        if (user.exp && user.exp < currentTime) {
          console.log("🔄 Stored token expired")
          localStorage.removeItem("google_id_token")
          setAuthState({
            isOwner: false,
            isLoading: false,
            user: null,
            error: null,
          })
          return
        }

        const isOwner = user.email === OWNER_EMAIL
        console.log("✅ Restored user from token:", user.email)

        setAuthState({
          isOwner,
          isLoading: false,
          user: {
            email: user.email,
            name: user.name,
            picture: user.picture,
            sub: user.sub,
          },
          error: null,
        })
      } catch (error) {
        console.error("❌ Failed to parse stored token:", error)
        localStorage.removeItem("google_id_token")
        setAuthState({
          isOwner: false,
          isLoading: false,
          user: null,
          error: null,
        })
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Render the Google Sign-In button
  const renderSignInButton = useCallback(
    (elementId: string) => {
      if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID || typeof window === "undefined" || !sdkLoaded) {
        console.warn("⚠️ Cannot render button - SDK not ready")
        return false
      }

      const element = document.getElementById(elementId)
      if (!element) {
        console.error(`❌ Element '${elementId}' not found`)
        return false
      }

      try {
        console.log("🎨 Rendering Google Sign-In button...")
        element.innerHTML = ""

        window.google.accounts.id.renderButton(element, {
          theme: "filled_black",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 250,
          locale: "en",
        })

        console.log("✅ Button rendered successfully")
        return true
      } catch (error) {
        console.error("❌ Failed to render button:", error)
        return false
      }
    },
    [sdkLoaded],
  )

  // Manual sign-in trigger
  const triggerSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) {
      console.error("❌ Google SDK not available for manual sign-in")
      return
    }

    try {
      console.log("🔐 Triggering manual sign-in...")
      window.google.accounts.id.prompt()
    } catch (error) {
      console.error("❌ Failed to trigger sign-in:", error)
    }
  }, [])

  // Sign out function
  const signOut = useCallback(() => {
    if (typeof window === "undefined") return

    console.log("🚪 Signing out...")
    localStorage.removeItem("google_id_token")

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect()
      } catch (error) {
        console.warn("⚠️ Failed to disable auto-select:", error)
      }
    }

    setAuthState({
      isOwner: false,
      isLoading: false,
      user: null,
      error: null,
    })
  }, [])

  // Parse JWT token
  function parseJwt(token: string) {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("❌ Failed to parse JWT:", error)
      throw error
    }
  }

  return {
    ...authState,
    renderSignInButton,
    triggerSignIn,
    signOut,
    sdkLoaded,
  }
}

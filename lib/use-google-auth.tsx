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
  const [initAttempted, setInitAttempted] = useState(false)

  // Handle the credential response from Google
  const handleCredentialResponse = useCallback((response: any) => {
    console.log("🔐 Google credential response received")

    if (typeof window === "undefined") return

    try {
      const idToken = response.credential
      const user = parseJwt(idToken)

      console.log("👤 User data:", { email: user.email, name: user.name })

      localStorage.setItem("google_id_token", idToken)

      const isOwner = user.email === OWNER_EMAIL

      console.log(`🔍 Owner check: ${user.email} === ${OWNER_EMAIL} = ${isOwner}`)

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
        console.log("✅ Owner authenticated successfully!")
      } else {
        console.log("ℹ️ User authenticated but not owner")
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

  // Load Google SDK
  useEffect(() => {
    if (typeof window === "undefined") {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    console.log("📦 Starting Google SDK load process...")

    // Make callback globally available
    window.handleCredentialResponse = handleCredentialResponse

    // Check if client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.length < 20) {
      console.error("❌ Google Client ID not properly configured")
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Google authentication not configured",
      })
      return
    }

    console.log("🔧 Using Client ID:", GOOGLE_CLIENT_ID)
    console.log("👑 Owner email:", OWNER_EMAIL)

    // Check for stored token first
    checkStoredToken()

    // Load Google SDK
    const loadGoogleSDK = () => {
      // Check if already loaded
      if (window.google?.accounts) {
        console.log("✅ Google SDK already loaded")
        setSdkLoaded(true)
        initializeGoogleAuth()
        return
      }

      console.log("📥 Loading Google SDK...")

      // Remove any existing scripts
      const existingScripts = document.querySelectorAll('script[src*="accounts.google.com"]')
      existingScripts.forEach((script) => script.remove())

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log("📦 Google SDK script loaded")
        // Wait a bit for the SDK to be fully ready
        setTimeout(() => {
          if (window.google?.accounts) {
            console.log("✅ Google SDK ready")
            setSdkLoaded(true)
            initializeGoogleAuth()
          } else {
            console.error("❌ Google SDK loaded but accounts not available")
            setAuthState({
              isOwner: false,
              isLoading: false,
              user: null,
              error: "Google SDK failed to initialize",
            })
          }
        }, 500)
      }

      script.onerror = (error) => {
        console.error("❌ Failed to load Google SDK:", error)
        setAuthState({
          isOwner: false,
          isLoading: false,
          user: null,
          error: "Failed to load Google Sign-In",
        })
      }

      document.head.appendChild(script)
    }

    loadGoogleSDK()

    return () => {
      if (window.handleCredentialResponse) {
        delete window.handleCredentialResponse
      }
    }
  }, [handleCredentialResponse])

  // Check stored token
  const checkStoredToken = useCallback(() => {
    if (typeof window === "undefined") return

    const storedToken = localStorage.getItem("google_id_token")
    if (storedToken) {
      try {
        const user = parseJwt(storedToken)

        // Check if token is expired
        const currentTime = Date.now() / 1000
        if (user.exp && user.exp < currentTime) {
          console.log("🔄 Stored token expired")
          localStorage.removeItem("google_id_token")
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return
        }

        const isOwner = user.email === OWNER_EMAIL
        console.log("🔄 Restored user from token:", user.email, "Owner:", isOwner)

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
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Initialize Google Auth
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID || initAttempted) return

    setInitAttempted(true)

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

      console.log("✅ Google Auth initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize Google Auth:", error)
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Failed to initialize Google authentication",
      })
    }
  }, [handleCredentialResponse, initAttempted])

  // Render the Google Sign-In button
  const renderSignInButton = useCallback(
    (elementId: string) => {
      if (!window.google?.accounts?.id || !sdkLoaded) {
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

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

  // Handle the credential response from Google
  const handleCredentialResponse = useCallback((response: any) => {
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
    } catch (error) {
      console.error("Authentication error:", error)
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

    // Check if client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "1039114733186-g6t8o74124davbf2v4cud6ldtjfvo9gi.apps.googleusercontent.com") {
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Google authentication not configured",
      })
      return
    }

    // Check for stored token first
    checkStoredToken()

    // Load Google SDK
    const loadGoogleSDK = () => {
      // Check if already loaded
      if (window.google?.accounts) {
        setSdkLoaded(true)
        initializeGoogleAuth()
        return
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true

      script.onload = () => {
        // Wait a bit for the SDK to be fully ready
        setTimeout(() => {
          if (window.google?.accounts) {
            setSdkLoaded(true)
            initializeGoogleAuth()
          }
        }, 100)
      }

      script.onerror = () => {
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
  }, [])

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
          localStorage.removeItem("google_id_token")
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return
        }

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
      } catch (error) {
        localStorage.removeItem("google_id_token")
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Initialize Google Auth
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
    } catch (error) {
      console.error("Failed to initialize Google Auth:", error)
    }
  }, [handleCredentialResponse])

  // Render the Google Sign-In button
  const renderSignInButton = useCallback(
    (elementId: string) => {
      if (!window.google?.accounts?.id || !sdkLoaded) return false

      const element = document.getElementById(elementId)
      if (!element) return false

      try {
        element.innerHTML = ""
        window.google.accounts.id.renderButton(element, {
          theme: "filled_black",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
          width: 250,
        })
        return true
      } catch (error) {
        console.error("Failed to render button:", error)
        return false
      }
    },
    [sdkLoaded],
  )

  // Manual sign-in trigger
  const triggerSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) return

    try {
      window.google.accounts.id.prompt()
    } catch (error) {
      console.error("Failed to trigger sign-in:", error)
    }
  }, [])

  // Sign out function
  const signOut = useCallback(() => {
    if (typeof window === "undefined") return

    localStorage.removeItem("google_id_token")

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect()
      } catch (error) {
        // Ignore errors during sign out
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
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  }

  return {
    ...authState,
    renderSignInButton,
    triggerSignIn,
    signOut,
    sdkLoaded,
  }
}

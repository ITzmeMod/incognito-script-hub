"use client"

import { useState, useEffect, useCallback } from "react"
import { GOOGLE_CLIENT_ID, OWNER_EMAIL } from "./google-auth-config"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleUser {
  email: string
  name: string
  picture: string
  sub: string // Google's user ID
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

  // Load the Google Sign-In SDK
  useEffect(() => {
    // Skip if already loaded or no client ID
    if (window.google?.accounts || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = initializeGoogleAuth
    script.onerror = () => {
      setAuthState({
        isOwner: false,
        isLoading: false,
        user: null,
        error: "Failed to load Google authentication",
      })
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Initialize Google Auth
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    // Check if we have a stored token
    const storedToken = localStorage.getItem("google_id_token")
    if (storedToken) {
      try {
        const user = parseJwt(storedToken)

        // Check if token is expired
        const currentTime = Date.now() / 1000
        if (user.exp && user.exp < currentTime) {
          // Token expired
          localStorage.removeItem("google_id_token")
          setAuthState({
            isOwner: false,
            isLoading: false,
            user: null,
            error: null,
          })
          return
        }

        // Verify it's the owner's email
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
        console.error("Failed to parse stored token:", error)
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

  // Handle the credential response from Google
  const handleCredentialResponse = useCallback((response: any) => {
    try {
      const idToken = response.credential
      const user = parseJwt(idToken)

      // Store the token
      localStorage.setItem("google_id_token", idToken)

      // Check if it's the owner's email
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

      // Log security event
      if (isOwner) {
        console.log("Owner successfully authenticated")
      } else {
        console.warn(`Non-owner login attempt: ${user.email}`)
      }
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

  // Render the Google Sign-In button
  const renderSignInButton = useCallback((elementId: string) => {
    if (!window.google || !GOOGLE_CLIENT_ID) return

    const element = document.getElementById(elementId)
    if (element) {
      window.google.accounts.id.renderButton(element, {
        theme: "filled_black",
        size: "large",
        type: "standard",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 250,
      })
    }
  }, [])

  // Sign out function
  const signOut = useCallback(() => {
    localStorage.removeItem("google_id_token")
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
    signOut,
  }
}

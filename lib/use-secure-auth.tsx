"use client"

import { useState, useEffect, useCallback } from "react"
import { apiRequest, ApiError } from "./api-client"
import { jwtDecode } from "jwt-decode"
import { generateCSRFToken } from "./csrf"

interface AuthState {
  isOwner: boolean
  isLoading: boolean
  error: string | null
}

interface LoginResponse {
  success: boolean
  accessToken: string
}

export function useSecureAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isOwner: false,
    isLoading: true,
    error: null,
  })

  // Check if token is valid on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        setAuthState({
          isOwner: false,
          isLoading: false,
          error: null,
        })
        return
      }

      try {
        // Decode and verify token
        const decoded = jwtDecode(token)

        if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
          // Token expired, try to refresh
          const refreshed = await refreshToken()

          setAuthState({
            isOwner: refreshed,
            isLoading: false,
            error: null,
          })
        } else {
          setAuthState({
            isOwner: true,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthState({
          isOwner: false,
          isLoading: false,
          error: "Authentication failed",
        })
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (password: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Generate CSRF token
      const csrfToken = generateCSRFToken()

      const response = await apiRequest<LoginResponse>("auth", {
        method: "POST",
        body: {
          password,
          token: csrfToken,
        },
      })

      if (response.success && response.accessToken) {
        localStorage.setItem("access_token", response.accessToken)

        setAuthState({
          isOwner: true,
          isLoading: false,
          error: null,
        })

        return true
      }

      setAuthState({
        isOwner: false,
        isLoading: false,
        error: "Authentication failed",
      })

      return false
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Authentication failed"

      setAuthState({
        isOwner: false,
        isLoading: false,
        error: errorMessage,
      })

      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("access_token")

    // Clear refresh token cookie by making a request to a logout endpoint
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(console.error)

    setAuthState({
      isOwner: false,
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    ...authState,
    login,
    logout,
  }
}

// Helper function to refresh token
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Include cookies for refresh token
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()

    if (data.accessToken) {
      localStorage.setItem("access_token", data.accessToken)
      return true
    }

    return false
  } catch (error) {
    console.error("Token refresh failed:", error)
    return false
  }
}

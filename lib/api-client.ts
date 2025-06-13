// Secure API client for making authenticated requests

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

export async function apiRequest<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, requiresAuth = false } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  // Add authentication if required
  if (requiresAuth) {
    const token = localStorage.getItem("access_token")
    if (!token) {
      // Try to refresh the token
      try {
        await refreshToken()
        const newToken = localStorage.getItem("access_token")
        if (newToken) {
          requestHeaders["Authorization"] = `Bearer ${newToken}`
        } else {
          throw new ApiError("Authentication required", 401)
        }
      } catch (error) {
        throw new ApiError("Authentication required", 401)
      }
    } else {
      requestHeaders["Authorization"] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(`/api/${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // Include cookies for refresh token
    })

    // Handle rate limiting
    if (response.status === 429) {
      throw new ApiError("Too many requests. Please try again later.", 429)
    }

    // Handle unauthorized (try token refresh)
    if (response.status === 401 && requiresAuth) {
      try {
        const refreshed = await refreshToken()
        if (refreshed) {
          // Retry the request with new token
          return apiRequest(endpoint, options)
        }
      } catch (refreshError) {
        throw new ApiError("Authentication failed", 401)
      }
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.error || "API request failed", response.status)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`API request failed: ${error instanceof Error ? error.message : String(error)}`, 500)
  }
}

// Refresh the access token using the refresh token
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

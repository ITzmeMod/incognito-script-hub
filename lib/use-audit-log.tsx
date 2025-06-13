"use client"

import { useState, useCallback } from "react"
import { apiRequest, ApiError } from "./api-client"

interface AuditLog {
  action: string
  details?: string
  timestamp: number
  ip?: string
}

interface AuditLogState {
  logs: AuditLog[]
  total: number
  isLoading: boolean
  error: string | null
}

export function useAuditLog(isOwner: boolean) {
  const [state, setState] = useState<AuditLogState>({
    logs: [],
    total: 0,
    isLoading: false,
    error: null,
  })

  const fetchLogs = useCallback(
    async (limit = 50, offset = 0) => {
      if (!isOwner) return

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await apiRequest<{ logs: AuditLog[]; total: number }>(
          `audit?limit=${limit}&offset=${offset}`,
          { requiresAuth: true },
        )

        setState({
          logs: response.logs,
          total: response.total,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch audit logs"

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      }
    },
    [isOwner],
  )

  const logAction = useCallback(
    async (action: string, details?: string) => {
      if (!isOwner) return

      try {
        await apiRequest("audit", {
          method: "POST",
          body: {
            action,
            details,
            timestamp: Date.now(),
          },
          requiresAuth: true,
        })
      } catch (error) {
        console.error("Failed to log action:", error)
      }
    },
    [isOwner],
  )

  return {
    ...state,
    fetchLogs,
    logAction,
  }
}

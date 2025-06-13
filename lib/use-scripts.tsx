"use client"

import { useState, useEffect, useCallback } from "react"
import { apiRequest, ApiError } from "./api-client"

interface Script {
  id: number
  title: string
  description: string
  link: string
  downloads: number
  category: string
  isNew?: boolean
  featured?: boolean
}

interface ScriptsState {
  scripts: Script[]
  isLoading: boolean
  error: string | null
}

export function useScripts(isOwner: boolean) {
  const [state, setState] = useState<ScriptsState>({
    scripts: [],
    isLoading: true,
    error: null,
  })

  // Fetch scripts on mount
  useEffect(() => {
    fetchScripts()
  }, [])

  const fetchScripts = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiRequest<{ scripts: Script[] }>("scripts")

      setState({
        scripts: response.scripts,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch scripts"

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }, [])

  const createOrUpdateScript = useCallback(
    async (script: Partial<Script>): Promise<boolean> => {
      if (!isOwner) return false

      try {
        await apiRequest("scripts", {
          method: script.id ? "PUT" : "POST",
          body: script,
          requiresAuth: true,
        })

        // Refresh scripts after update
        fetchScripts()
        return true
      } catch (error) {
        const errorMessage = error instanceof ApiError ? error.message : "Failed to save script"

        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }))

        return false
      }
    },
    [isOwner, fetchScripts],
  )

  const deleteScript = useCallback(
    async (id: number): Promise<boolean> => {
      if (!isOwner) return false

      try {
        await apiRequest(`scripts/${id}`, {
          method: "DELETE",
          requiresAuth: true,
        })

        // Refresh scripts after delete
        fetchScripts()
        return true
      } catch (error) {
        const errorMessage = error instanceof ApiError ? error.message : "Failed to delete script"

        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }))

        return false
      }
    },
    [isOwner, fetchScripts],
  )

  return {
    ...state,
    fetchScripts,
    createOrUpdateScript,
    deleteScript,
  }
}

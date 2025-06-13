"use client"

import { useState, useCallback } from "react"
import { apiRequest, ApiError } from "./api-client"

interface BackupState {
  isLoading: boolean
  error: string | null
  success: boolean
}

export function useBackup(isOwner: boolean) {
  const [state, setState] = useState<BackupState>({
    isLoading: false,
    error: null,
    success: false,
  })

  const createBackup = useCallback(async () => {
    if (!isOwner) return null

    setState({ isLoading: true, error: null, success: false })

    try {
      const backupData = await apiRequest("backup", { requiresAuth: true })

      // Create a downloadable file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create download link
      const a = document.createElement("a")
      a.href = url
      a.download = `incognito-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setState({ isLoading: false, error: null, success: true })
      return backupData
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to create backup"

      setState({ isLoading: false, error: errorMessage, success: false })
      return null
    }
  }, [isOwner])

  const restoreFromBackup = useCallback(
    async (file: File) => {
      if (!isOwner) return false

      setState({ isLoading: true, error: null, success: false })

      try {
        // Read the file
        const text = await file.text()
        const backupData = JSON.parse(text)

        // Send to API
        await apiRequest("backup", {
          method: "POST",
          body: backupData,
          requiresAuth: true,
        })

        setState({ isLoading: false, error: null, success: true })
        return true
      } catch (error) {
        const errorMessage = error instanceof ApiError ? error.message : "Failed to restore from backup"

        setState({ isLoading: false, error: errorMessage, success: false })
        return false
      }
    },
    [isOwner],
  )

  return {
    ...state,
    createBackup,
    restoreFromBackup,
  }
}

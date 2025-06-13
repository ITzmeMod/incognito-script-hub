"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useGoogleAuth } from "./use-google-auth"

interface AuthContextType {
  isOwner: boolean
  isLoading: boolean
  user: {
    email: string
    name: string
    picture: string
    sub: string
  } | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  isOwner: false,
  isLoading: true,
  user: null,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useGoogleAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

"use client"

import { useState, useEffect } from "react"
import { LucideShieldAlert, LucideUser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import GoogleSignIn from "./google-sign-in"
import { useAuth } from "@/lib/auth-context"
import { isGoogleAuthConfigured } from "@/lib/google-auth-config"

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const { isOwner, user, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render auth-related content until mounted
  if (!mounted) {
    return (
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LucideShieldAlert className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            INCOGNITO
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:block">
            <ul className="flex gap-6">
              <li className="hover:text-green-400 transition-colors cursor-pointer">Home</li>
              <li className="hover:text-green-400 transition-colors cursor-pointer">Scripts</li>
              <li className="hover:text-green-400 transition-colors cursor-pointer">About</li>
            </ul>
          </nav>
          <Button variant="outline" size="icon" className="border-green-500" disabled>
            <LucideUser className="h-5 w-5 text-green-400" />
          </Button>
        </div>
      </header>
    )
  }

  // Check if Google Auth is configured
  const authConfigured = isGoogleAuthConfigured()

  return (
    <header className="p-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <LucideShieldAlert className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          INCOGNITO
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <nav className="hidden md:block">
          <ul className="flex gap-6">
            <li className="hover:text-green-400 transition-colors cursor-pointer">Home</li>
            <li className="hover:text-green-400 transition-colors cursor-pointer">Scripts</li>
            <li className="hover:text-green-400 transition-colors cursor-pointer">About</li>
          </ul>
        </nav>

        {/* Show auth UI if Google Auth is configured */}
        {authConfigured ? (
          <>
            {isLoading ? (
              <Button variant="outline" size="icon" className="border-green-500" disabled>
                <LucideUser className="h-5 w-5 text-green-400" />
              </Button>
            ) : isOwner && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name || "Owner"}
                    className="w-8 h-8 rounded-full border border-green-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden md:block">
                    <span className="text-sm text-green-400 block">Owner</span>
                    <span className="text-xs text-gray-400">{user.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-green-500">
                    <LucideUser className="h-5 w-5 text-green-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border border-green-500 min-w-[300px]">
                  <div className="p-2">
                    <GoogleSignIn />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : (
          // Show a simple user icon when auth is not configured
          <Button variant="outline" size="icon" className="border-green-500" disabled>
            <LucideUser className="h-5 w-5 text-green-400" />
          </Button>
        )}
      </div>
    </header>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useGoogleAuth } from "@/lib/use-google-auth"
import { LucideLogOut } from "lucide-react"

export default function GoogleSignIn() {
  const { isOwner, isLoading, user, renderSignInButton, signOut } = useGoogleAuth()
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOwner && !isLoading && buttonRef.current) {
      renderSignInButton("google-signin-button")
    }
  }, [isOwner, isLoading, renderSignInButton])

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-green-400 w-full justify-start">
        Loading...
      </Button>
    )
  }

  if (isOwner && user) {
    return (
      <Button variant="ghost" size="sm" onClick={signOut} className="text-green-400 w-full justify-start">
        <LucideLogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    )
  }

  return <div id="google-signin-button" ref={buttonRef} className="w-full min-w-[200px]"></div>
}

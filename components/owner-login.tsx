"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LucideShieldCheck, LucideLogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { generateCSRFToken, verifyCSRFToken } from "@/lib/csrf"

export default function OwnerLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [csrfToken, setCsrfToken] = useState("")
  const { isOwner, login, logout, loginAttempts } = useAuth()

  // Generate CSRF token when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCsrfToken(generateCSRFToken())
    }
  }, [isOpen])

  const handleLogin = async () => {
    setError("")

    // Verify CSRF token
    if (!verifyCSRFToken(csrfToken)) {
      setError("Security verification failed. Please try again.")
      return
    }

    // Sanitize input
    const sanitizedPassword = password.trim()

    const { success, message } = await login(sanitizedPassword)
    if (success) {
      setIsOpen(false)
      setPassword("")
    } else {
      setError(message || "Invalid password")
    }
  }

  const handleLogout = () => {
    logout()
  }

  const remainingAttempts = 5 - loginAttempts

  if (isOwner) {
    return (
      <Button variant="outline" size="sm" onClick={handleLogout} className="border-green-500 text-green-400">
        <LucideLogOut className="h-4 w-4 mr-2" />
        Owner Logout
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-green-500 text-green-400">
          <LucideShieldCheck className="h-4 w-4 mr-2" />
          Owner Access
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-green-500">
        <DialogHeader>
          <DialogTitle className="text-green-400">Owner Authentication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-gray-400">Enter your owner password to access editing features.</p>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black border-green-500 text-white"
            autoComplete="new-password" // Disable autocomplete
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {loginAttempts > 0 && (
            <p className="text-amber-500 text-sm">
              {remainingAttempts > 0
                ? `${remainingAttempts} login attempts remaining`
                : "Too many attempts. Please try again later."}
            </p>
          )}
          <input type="hidden" name="csrf_token" value={csrfToken} />
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600"
            disabled={remainingAttempts <= 0}
          >
            Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

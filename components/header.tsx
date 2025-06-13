"use client"

import { LucideShieldAlert, LucideUser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import GoogleSignIn from "./google-sign-in"
import { useAuth } from "@/lib/auth-context"

export default function Header() {
  const { isOwner, user } = useAuth()

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

        {isOwner ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={user?.picture || "/placeholder.svg"}
                alt={user?.name || "Owner"}
                className="w-8 h-8 rounded-full border border-green-500"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm text-green-400 hidden md:inline">Owner</span>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-green-500">
                <LucideUser className="h-5 w-5 text-green-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black border border-green-500">
              <DropdownMenuItem className="focus:bg-green-900 focus:text-white">
                <GoogleSignIn />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

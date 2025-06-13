"use client"

import { useState, useEffect } from "react"
import {
  LucideGithub,
  CloudLightningIcon as LucideDiscord,
  LucideYoutube,
  LucideEdit,
  LucideSave,
  LucideX,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const { isOwner } = useAuth()
  const [editingYoutube, setEditingYoutube] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("https://youtube.com/your-channel")
  const [tempYoutubeUrl, setTempYoutubeUrl] = useState(youtubeUrl)
  const [isClient, setIsClient] = useState(false)

  // Load saved YouTube URL on component mount
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("youtube_url")
      if (savedUrl) {
        setYoutubeUrl(savedUrl)
        setTempYoutubeUrl(savedUrl)
      }
    }
  }, [])

  const handleSaveYoutube = () => {
    setYoutubeUrl(tempYoutubeUrl)
    setEditingYoutube(false)
    // Save to localStorage only on client side
    if (typeof window !== "undefined") {
      localStorage.setItem("youtube_url", tempYoutubeUrl)
    }
  }

  const handleCancelEdit = () => {
    setTempYoutubeUrl(youtubeUrl)
    setEditingYoutube(false)
  }

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null
  }

  return (
    <footer className="mt-16 border-t border-green-900 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-4">INCOGNITO</h3>
            <p className="text-gray-400">
              Your ultimate destination for Roblox scripting resources. All scripts are provided for educational
              purposes only.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-4">Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-green-400 transition-colors cursor-pointer">Home</li>
              <li className="hover:text-green-400 transition-colors cursor-pointer">Scripts</li>
              <li className="hover:text-green-400 transition-colors cursor-pointer">Submit Script</li>
              <li className="hover:text-green-400 transition-colors cursor-pointer">Terms of Service</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-green-400 mb-4">Connect</h3>
              {isOwner && !editingYoutube && (
                <Button variant="ghost" size="sm" onClick={() => setEditingYoutube(true)}>
                  <LucideEdit className="h-4 w-4 text-green-400" />
                </Button>
              )}
            </div>

            {editingYoutube && isOwner ? (
              <div className="flex items-center gap-2 mb-4">
                <Input
                  value={tempYoutubeUrl}
                  onChange={(e) => setTempYoutubeUrl(e.target.value)}
                  className="bg-black border-green-500 text-white"
                  placeholder="YouTube URL"
                />
                <Button variant="ghost" size="icon" onClick={handleSaveYoutube}>
                  <LucideSave className="h-4 w-4 text-green-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                  <LucideX className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <LucideDiscord className="h-6 w-6 text-gray-400 hover:text-green-400 transition-colors cursor-pointer" />
                <LucideGithub className="h-6 w-6 text-gray-400 hover:text-green-400 transition-colors cursor-pointer" />
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <LucideYoutube className="h-6 w-6 text-gray-400 hover:text-green-400 transition-colors cursor-pointer" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-green-900">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">© {new Date().getFullYear()} INCOGNITO. All rights reserved.</p>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Disclaimer: All scripts are provided for educational purposes only. Use at your own risk.
          </p>
        </div>
      </div>
    </footer>
  )
}

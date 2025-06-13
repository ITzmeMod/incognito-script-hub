"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { validateScript, sanitizeHtml } from "@/lib/validation"
import { generateCSRFToken, verifyCSRFToken } from "@/lib/csrf"
import Honeypot from "./honeypot"

interface ScriptEditorProps {
  script: {
    id: number
    title: string
    description: string
    link: string
    category: string
    downloads: number
    isNew?: boolean
    featured?: boolean
  }
  isOpen: boolean
  onClose: () => void
  onSave: (script: any) => void
}

export default function ScriptEditor({ script, isOpen, onClose, onSave }: ScriptEditorProps) {
  const [editedScript, setEditedScript] = useState({ ...script })
  const [error, setError] = useState("")
  const [csrfToken, setCsrfToken] = useState("")

  // Generate CSRF token when dialog opens
  useState(() => {
    if (isOpen) {
      setCsrfToken(generateCSRFToken())
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedScript((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setEditedScript((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSave = () => {
    setError("")

    // Verify CSRF token
    if (!verifyCSRFToken(csrfToken)) {
      setError("Security verification failed. Please try again.")
      return
    }

    // Check honeypot field
    const honeypotField = document.getElementById("website") as HTMLInputElement
    if (honeypotField && honeypotField.value) {
      // Bot detected, silently fail
      onClose()
      return
    }

    // Sanitize inputs
    const sanitizedScript = {
      ...editedScript,
      title: sanitizeHtml(editedScript.title),
      description: sanitizeHtml(editedScript.description),
      category: sanitizeHtml(editedScript.category),
    }

    // Validate data
    const validation = validateScript(sanitizedScript)
    if (!validation.success) {
      setError(validation.error || "Invalid data")
      return
    }

    onSave(sanitizedScript)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-green-500 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-green-400">Edit Script</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Honeypot />
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={editedScript.title}
                onChange={handleChange}
                className="bg-black border-green-500 text-white"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editedScript.description}
                onChange={handleChange}
                className="bg-black border-green-500 text-white min-h-[150px]"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (work.ink)</Label>
              <Input
                id="link"
                name="link"
                value={editedScript.link}
                onChange={handleChange}
                className="bg-black border-green-500 text-white"
                pattern="https?://.+"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={editedScript.category}
                onChange={handleChange}
                className="bg-black border-green-500 text-white"
                maxLength={50}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isNew"
                name="isNew"
                checked={!!editedScript.isNew}
                onChange={handleCheckboxChange}
                className="h-4 w-4"
              />
              <Label htmlFor="isNew">Mark as New</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={!!editedScript.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4"
              />
              <Label htmlFor="featured">Featured Script</Label>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input type="hidden" name="csrf_token" value={csrfToken} />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="border-red-500 text-red-400">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-green-600 to-blue-600">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

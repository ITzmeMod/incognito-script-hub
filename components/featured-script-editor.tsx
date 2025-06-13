"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LucideStar, LucideEdit, LucideSave, LucideX, LucideDownload } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { loadScripts, updateScript, type Script } from "@/lib/script-service"

export default function FeaturedScriptEditor() {
  const { isOwner } = useAuth()
  const [featuredScript, setFeaturedScript] = useState<Script | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedScript, setEditedScript] = useState<Script | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load the featured script
  useEffect(() => {
    const scripts = loadScripts()
    const featured = scripts.find((script) => script.featured)
    setFeaturedScript(featured || null)
  }, [])

  // Start editing
  const handleEdit = () => {
    if (featuredScript) {
      setEditedScript({ ...featuredScript })
      setIsDialogOpen(true)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof Script, value: string | number | boolean) => {
    if (editedScript) {
      setEditedScript({
        ...editedScript,
        [field]: value,
      })
    }
  }

  // Save changes
  const handleSave = () => {
    if (editedScript) {
      // Ensure it remains featured
      editedScript.featured = true

      // Update the script
      updateScript(editedScript)

      // Update local state
      setFeaturedScript(editedScript)
      setIsDialogOpen(false)
    }
  }

  if (!featuredScript) return null

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Latest New Script
          </span>
        </h2>
        {isOwner && (
          <Button variant="outline" size="sm" className="border-green-500" onClick={handleEdit}>
            <LucideEdit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Card className="bg-black border-2 border-green-500 overflow-hidden relative">
        <div className="absolute top-0 right-0">
          <Badge className="bg-gradient-to-r from-green-600 to-blue-600 m-4">NEW</Badge>
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LucideStar className="h-6 w-6 text-yellow-400" />
            <CardTitle className="text-2xl text-green-400">{featuredScript.title}</CardTitle>
          </div>
          <div className="text-gray-400">
            Category: {featuredScript.category} • {featuredScript.downloads.toLocaleString()} downloads
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-lg">{featuredScript.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
            onClick={() => window.open(featuredScript.link, "_blank")}
          >
            <LucideDownload className="mr-2 h-5 w-5" />
            Get Premium Script
          </Button>
          <p className="text-green-400 font-medium">Updated: {new Date().toLocaleDateString()}</p>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black border border-green-500 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-green-400">Edit Featured Script</DialogTitle>
          </DialogHeader>
          {editedScript && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedScript.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-black border-green-500 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedScript.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="bg-black border-green-500 text-white min-h-[150px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Link (work.ink)</Label>
                    <Input
                      id="link"
                      value={editedScript.link}
                      onChange={(e) => handleInputChange("link", e.target.value)}
                      className="bg-black border-green-500 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editedScript.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="bg-black border-green-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downloads">Downloads</Label>
                  <Input
                    id="downloads"
                    type="number"
                    value={editedScript.downloads}
                    onChange={(e) => handleInputChange("downloads", Number.parseInt(e.target.value) || 0)}
                    className="bg-black border-green-500 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={!!editedScript.isNew}
                    onChange={(e) => handleInputChange("isNew", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isNew">Mark as New</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-red-500 text-red-400"
                >
                  <LucideX className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-green-600 to-blue-600">
                  <LucideSave className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

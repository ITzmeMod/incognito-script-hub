"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LucidePlus, LucideSave, LucideX } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { addScript, type Script } from "@/lib/script-service"

export default function AddScriptButton() {
  const { isOwner } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [newScript, setNewScript] = useState<Omit<Script, "id">>({
    title: "",
    description: "",
    link: "https://work.ink/",
    downloads: 0,
    category: "General",
    isNew: true,
    featured: false,
  })

  if (!isOwner) return null

  const handleInputChange = (field: keyof Omit<Script, "id">, value: string | number | boolean) => {
    setNewScript({
      ...newScript,
      [field]: value,
    })
  }

  const handleAddScript = () => {
    if (!newScript.title.trim() || !newScript.description.trim()) {
      alert("Please fill in at least the title and description")
      return
    }

    try {
      addScript(newScript)
      setNewScript({
        title: "",
        description: "",
        link: "https://work.ink/",
        downloads: 0,
        category: "General",
        isNew: true,
        featured: false,
      })
      setIsOpen(false)

      // Reload the page to show the new script
      window.location.reload()
    } catch (error) {
      console.error("Failed to add script:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg z-50">
          <LucidePlus className="h-8 w-8" />
          <span className="sr-only">Add New Script</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-green-500 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-green-400">Add New Script</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newScript.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-black border-green-500 text-white"
                placeholder="Enter script title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newScript.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-black border-green-500 text-white min-h-[150px]"
                placeholder="Enter script description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-link">Link (work.ink)</Label>
                <Input
                  id="new-link"
                  value={newScript.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  className="bg-black border-green-500 text-white"
                  placeholder="https://work.ink/your-link"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-category">Category</Label>
                <Input
                  id="new-category"
                  value={newScript.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="bg-black border-green-500 text-white"
                  placeholder="e.g., Premium, Movement, Visual"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-downloads">Initial Downloads</Label>
              <Input
                id="new-downloads"
                type="number"
                value={newScript.downloads}
                onChange={(e) => handleInputChange("downloads", Number.parseInt(e.target.value) || 0)}
                className="bg-black border-green-500 text-white"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-isNew"
                  checked={newScript.isNew}
                  onChange={(e) => handleInputChange("isNew", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="new-isNew">Mark as New</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-featured"
                  checked={newScript.featured}
                  onChange={(e) => handleInputChange("featured", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="new-featured">Featured Script</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-red-500 text-red-400">
              <LucideX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddScript} className="bg-gradient-to-r from-green-600 to-blue-600">
              <LucideSave className="h-4 w-4 mr-2" />
              Add Script
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

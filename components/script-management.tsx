"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  LucideEdit,
  LucideSave,
  LucideX,
  LucideTrash2,
  LucidePlus,
  LucideExternalLink,
  LucideStar,
  LucideCode,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { loadScripts, updateScript, addScript, deleteScript, type Script } from "@/lib/script-service"

export default function ScriptManagement() {
  const { isOwner } = useAuth()
  const [scripts, setScripts] = useState<Script[]>([])
  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // New script template
  const newScriptTemplate: Omit<Script, "id"> = {
    title: "",
    description: "",
    link: "https://work.ink/",
    downloads: 0,
    category: "General",
    isNew: false,
    featured: false,
  }

  const [newScript, setNewScript] = useState(newScriptTemplate)

  // Load scripts on component mount
  useEffect(() => {
    if (isOwner) {
      loadScriptsData()
    }
  }, [isOwner])

  const loadScriptsData = () => {
    setIsLoading(true)
    try {
      const loadedScripts = loadScripts()
      setScripts(loadedScripts)
    } catch (error) {
      console.error("Failed to load scripts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditScript = (script: Script) => {
    setEditingScript({ ...script })
  }

  const handleSaveScript = () => {
    if (!editingScript) return

    try {
      const updatedScripts = updateScript(editingScript)
      setScripts(updatedScripts)
      setEditingScript(null)
    } catch (error) {
      console.error("Failed to update script:", error)
    }
  }

  const handleDeleteScript = (id: number) => {
    if (confirm("Are you sure you want to delete this script?")) {
      try {
        const updatedScripts = deleteScript(id)
        setScripts(updatedScripts)
      } catch (error) {
        console.error("Failed to delete script:", error)
      }
    }
  }

  const handleAddNewScript = () => {
    if (!newScript.title.trim() || !newScript.description.trim()) {
      alert("Please fill in at least the title and description")
      return
    }

    try {
      const updatedScripts = addScript(newScript)
      setScripts(updatedScripts)
      setNewScript(newScriptTemplate)
      setIsAddingNew(false)
    } catch (error) {
      console.error("Failed to add script:", error)
    }
  }

  const handleInputChange = (field: keyof Script, value: string | number | boolean) => {
    if (editingScript) {
      setEditingScript({
        ...editingScript,
        [field]: value,
      })
    }
  }

  const handleNewScriptChange = (field: keyof Omit<Script, "id">, value: string | number | boolean) => {
    setNewScript({
      ...newScript,
      [field]: value,
    })
  }

  if (!isOwner) return null

  if (isLoading) {
    return (
      <Card className="bg-black border-green-900">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading scripts...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black border-green-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-green-400">Script Management</CardTitle>
            <CardDescription>Edit and manage your Roblox scripts</CardDescription>
          </div>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                <LucidePlus className="h-4 w-4 mr-2" />
                Add New Script
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
                      onChange={(e) => handleNewScriptChange("title", e.target.value)}
                      className="bg-black border-green-500 text-white"
                      placeholder="Enter script title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Textarea
                      id="new-description"
                      value={newScript.description}
                      onChange={(e) => handleNewScriptChange("description", e.target.value)}
                      className="bg-black border-green-500 text-white min-h-[100px]"
                      placeholder="Enter script description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-link">Link (work.ink)</Label>
                      <Input
                        id="new-link"
                        value={newScript.link}
                        onChange={(e) => handleNewScriptChange("link", e.target.value)}
                        className="bg-black border-green-500 text-white"
                        placeholder="https://work.ink/your-link"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-category">Category</Label>
                      <Input
                        id="new-category"
                        value={newScript.category}
                        onChange={(e) => handleNewScriptChange("category", e.target.value)}
                        className="bg-black border-green-500 text-white"
                        placeholder="e.g., Premium, Movement, Visual"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="new-isNew"
                        checked={newScript.isNew}
                        onChange={(e) => handleNewScriptChange("isNew", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="new-isNew">Mark as New</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="new-featured"
                        checked={newScript.featured}
                        onChange={(e) => handleNewScriptChange("featured", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="new-featured">Featured Script</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingNew(false)}
                    className="border-red-500 text-red-400"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddNewScript} className="bg-gradient-to-r from-green-600 to-blue-600">
                    Add Script
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scripts.map((script) => (
            <Card key={script.id} className="bg-black border border-green-900">
              <CardContent className="p-4">
                {editingScript?.id === script.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${script.id}`}>Title</Label>
                        <Input
                          id={`title-${script.id}`}
                          value={editingScript.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          className="bg-black border-green-500 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${script.id}`}>Description</Label>
                        <Textarea
                          id={`description-${script.id}`}
                          value={editingScript.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="bg-black border-green-500 text-white min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`link-${script.id}`}>Link (work.ink)</Label>
                          <Input
                            id={`link-${script.id}`}
                            value={editingScript.link}
                            onChange={(e) => handleInputChange("link", e.target.value)}
                            className="bg-black border-green-500 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`category-${script.id}`}>Category</Label>
                          <Input
                            id={`category-${script.id}`}
                            value={editingScript.category}
                            onChange={(e) => handleInputChange("category", e.target.value)}
                            className="bg-black border-green-500 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`downloads-${script.id}`}>Downloads</Label>
                          <Input
                            id={`downloads-${script.id}`}
                            type="number"
                            value={editingScript.downloads}
                            onChange={(e) => handleInputChange("downloads", Number.parseInt(e.target.value) || 0)}
                            className="bg-black border-green-500 text-white"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`isNew-${script.id}`}
                            checked={editingScript.isNew || false}
                            onChange={(e) => handleInputChange("isNew", e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`isNew-${script.id}`}>Mark as New</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`featured-${script.id}`}
                            checked={editingScript.featured || false}
                            onChange={(e) => handleInputChange("featured", e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`featured-${script.id}`}>Featured</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingScript(null)}
                        className="border-red-500 text-red-400"
                      >
                        <LucideX className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveScript} className="bg-gradient-to-r from-green-600 to-blue-600">
                        <LucideSave className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <LucideCode className="h-5 w-5 text-green-500" />
                          <h3 className="text-lg font-semibold text-green-400">{script.title}</h3>
                          <div className="flex gap-2">
                            {script.isNew && <Badge className="bg-gradient-to-r from-green-600 to-blue-600">NEW</Badge>}
                            {script.featured && (
                              <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600">
                                <LucideStar className="h-3 w-3 mr-1" />
                                FEATURED
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 mb-2">{script.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Category: {script.category}</span>
                          <span>Downloads: {script.downloads.toLocaleString()}</span>
                          <a
                            href={script.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-400 hover:text-green-300"
                          >
                            <LucideExternalLink className="h-3 w-3" />
                            View Link
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditScript(script)}
                          className="border-green-500 text-green-400"
                        >
                          <LucideEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteScript(script.id)}
                          className="border-red-500 text-red-400"
                        >
                          <LucideTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {scripts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <LucideCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scripts found. Add your first script to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

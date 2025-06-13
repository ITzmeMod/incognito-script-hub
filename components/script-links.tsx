"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideCode, LucideDownload, LucideEdit, LucideTrash2, LucidePlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { loadScripts, updateScript, deleteScript, type Script } from "@/lib/script-service"
import FeaturedScriptEditor from "./featured-script-editor"
import AddScriptButton from "./add-script-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ScriptLinks() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { isOwner } = useAuth()

  // Load scripts on component mount
  useEffect(() => {
    setIsClient(true)
    loadScriptsData()
  }, [])

  const loadScriptsData = () => {
    if (typeof window !== "undefined") {
      const loadedScripts = loadScripts()
      setScripts(loadedScripts)
    }
  }

  const filteredScripts = activeCategory
    ? scripts.filter((script) => script.category === activeCategory && !script.featured)
    : scripts.filter((script) => !script.featured)

  const categories = Array.from(new Set(scripts.map((script) => script.category)))
  const featuredScript = scripts.find((script) => script.featured)

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

  const handleInputChange = (field: keyof Script, value: string | number | boolean) => {
    if (editingScript) {
      setEditingScript({
        ...editingScript,
        [field]: value,
      })
    }
  }

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="text-center text-gray-400">Loading...</div>
      </section>
    )
  }

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}>
        {/* Featured Latest Script */}
        {featuredScript ? (
          <FeaturedScriptEditor />
        ) : (
          isOwner && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Latest New Script
                  </span>
                </h2>
              </div>
              <Card className="bg-black border-2 border-green-500 overflow-hidden relative p-8">
                <div className="text-center">
                  <p className="text-gray-400 mb-4">
                    No featured script set. Add a new script and mark it as featured.
                  </p>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                    <LucidePlus className="mr-2 h-4 w-4" />
                    Add Featured Script
                  </Button>
                </div>
              </Card>
            </div>
          )
        )}

        <h2 className="text-4xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            All Roblox Scripts
          </span>
        </h2>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            onClick={() => setActiveCategory(null)}
            className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-500"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? "bg-gradient-to-r from-green-900 to-blue-900 border border-green-500"
                  : "border border-green-500"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <Card
              key={script.id}
              className="bg-black border border-green-500 hover:border-green-300 transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] relative"
            >
              {script.isNew && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-green-600 to-blue-600 m-2">NEW</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LucideCode className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-green-400">{script.title}</CardTitle>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditScript(script)}>
                        <LucideEdit className="h-4 w-4 text-green-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteScript(script.id)}
                      >
                        <LucideTrash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription className="text-gray-400">
                  Category: {script.category} • {script.downloads.toLocaleString()} downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{script.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
                  onClick={() => window.open(script.link, "_blank")}
                >
                  <LucideDownload className="mr-2 h-4 w-4" />
                  Get Script
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Edit Script Dialog */}
        <Dialog open={!!editingScript} onOpenChange={(open) => !open && setEditingScript(null)}>
          <DialogContent className="bg-black border border-green-500 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-green-400">Edit Script</DialogTitle>
            </DialogHeader>
            {editingScript && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingScript.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="bg-black border-green-500 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingScript.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="bg-black border-green-500 text-white min-h-[150px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-link">Link (work.ink)</Label>
                      <Input
                        id="edit-link"
                        value={editingScript.link}
                        onChange={(e) => handleInputChange("link", e.target.value)}
                        className="bg-black border-green-500 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Input
                        id="edit-category"
                        value={editingScript.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="bg-black border-green-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-downloads">Downloads</Label>
                    <Input
                      id="edit-downloads"
                      type="number"
                      value={editingScript.downloads}
                      onChange={(e) => handleInputChange("downloads", Number.parseInt(e.target.value) || 0)}
                      className="bg-black border-green-500 text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-isNew"
                        checked={!!editingScript.isNew}
                        onChange={(e) => handleInputChange("isNew", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="edit-isNew">Mark as New</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-featured"
                        checked={!!editingScript.featured}
                        onChange={(e) => handleInputChange("featured", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="edit-featured">Featured Script</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingScript(null)}
                    className="border-red-500 text-red-400"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveScript} className="bg-gradient-to-r from-green-600 to-blue-600">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Script Button (Floating) */}
        <AddScriptButton />
      </motion.div>
    </section>
  )
}

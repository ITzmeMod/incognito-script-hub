// This is a simple client-side script management service
// In a production app, you'd use a database like Supabase, Firebase, etc.

export interface Script {
  id: number
  title: string
  description: string
  link: string
  downloads: number
  category: string
  isNew?: boolean
  featured?: boolean
}

const STORAGE_KEY = "incognito_scripts"

// Initial scripts data
const initialScripts: Script[] = [
  {
    id: 1,
    title: "Ultimate Game Pass Unlocker",
    description:
      "This script allows you to access free game passes and use advanced tools across multiple Roblox games. Features include premium item access, VIP area unlocking, and exclusive tool usage without purchasing. Compatible with most popular Roblox games and regularly updated to bypass security patches.",
    link: "https://work.ink/your-monetized-link-1",
    downloads: 18453,
    category: "Premium",
    isNew: true,
    featured: true,
  },
  {
    id: 2,
    title: "Infinite Jump Script",
    description:
      "This script allows your character to jump infinitely in any Roblox game. Perfect for parkour games or exploring hard-to-reach areas.",
    link: "https://work.ink/your-monetized-link-2",
    downloads: 12453,
    category: "Movement",
  },
  {
    id: 3,
    title: "ESP Player Tracker",
    description:
      "See all players through walls with this advanced ESP script. Customizable colors and distance indicators included.",
    link: "https://work.ink/your-monetized-link-3",
    downloads: 8721,
    category: "Visual",
  },
  {
    id: 4,
    title: "Auto Farm Script",
    description:
      "Automatically farm resources and currency in popular Roblox games. Configurable settings for different games.",
    link: "https://work.ink/your-monetized-link-4",
    downloads: 15632,
    category: "Automation",
  },
]

// Load scripts from localStorage or use initial data
export const loadScripts = (): Script[] => {
  // Check if we're on the client side
  if (typeof window === "undefined") return initialScripts

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialScripts))
      return initialScripts
    }
    return JSON.parse(saved)
  } catch (e) {
    console.error("Failed to parse saved scripts", e)
    return initialScripts
  }
}

// Save scripts to localStorage
export const saveScripts = (scripts: Script[]): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
  } catch (e) {
    console.error("Failed to save scripts", e)
  }
}

// Update a single script
export const updateScript = (updatedScript: Script): Script[] => {
  const scripts = loadScripts()
  const index = scripts.findIndex((s) => s.id === updatedScript.id)

  if (index !== -1) {
    scripts[index] = updatedScript
    saveScripts(scripts)
  }

  return scripts
}

// Add a new script
export const addScript = (script: Omit<Script, "id">): Script[] => {
  const scripts = loadScripts()
  const newId = Math.max(0, ...scripts.map((s) => s.id)) + 1
  const newScript = { ...script, id: newId }

  scripts.push(newScript)
  saveScripts(scripts)

  return scripts
}

// Delete a script
export const deleteScript = (id: number): Script[] => {
  const scripts = loadScripts()
  const filtered = scripts.filter((s) => s.id !== id)

  saveScripts(filtered)

  return filtered
}

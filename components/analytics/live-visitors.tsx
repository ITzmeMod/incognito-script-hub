"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LucideActivity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LiveVisitor {
  id: string
  country: string
  page: string
  duration: number
  lastActive: number
}

// Generate random live visitor data
const generateLiveVisitors = (count: number): LiveVisitor[] => {
  const visitors: LiveVisitor[] = []
  const countries = ["United States", "Canada", "United Kingdom", "Germany", "Australia", "Japan", "Brazil", "India"]
  const pages = ["/", "/scripts", "/premium-scripts", "/about"]

  for (let i = 0; i < count; i++) {
    const now = Date.now()
    visitors.push({
      id: `live-${Math.random().toString(36).substring(2, 9)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      page: pages[Math.floor(Math.random() * pages.length)],
      duration: Math.floor(Math.random() * 600), // 0-10 minutes in seconds
      lastActive: now - Math.floor(Math.random() * 60000), // Last active within the last minute
    })
  }

  return visitors
}

export default function LiveVisitors() {
  const [visitors, setVisitors] = useState<LiveVisitor[]>([])
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    // Initial count between 5-15
    const initialCount = Math.floor(Math.random() * 10) + 5
    setVisitorCount(initialCount)
    setVisitors(generateLiveVisitors(initialCount))

    // Update live visitors every 5 seconds
    const interval = setInterval(() => {
      // Randomly add or remove visitors to simulate real traffic
      const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      const newCount = Math.max(3, Math.min(20, visitorCount + change))
      setVisitorCount(newCount)
      setVisitors(generateLiveVisitors(newCount))
    }, 5000)

    return () => clearInterval(interval)
  }, [visitorCount])

  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-4 border border-green-900 bg-black">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LucideActivity className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-medium text-green-400">Live Visitors</h3>
        </div>
        <Badge className="bg-green-600">{visitors.length} Online Now</Badge>
      </div>

      <div className="border border-green-900 rounded-lg overflow-hidden">
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-900/30">
              <tr className="text-left">
                <th className="p-3 text-green-400">Country</th>
                <th className="p-3 text-green-400">Current Page</th>
                <th className="p-3 text-green-400">Duration</th>
                <th className="p-3 text-green-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => {
                const isActive = Date.now() - visitor.lastActive < 30000 // Active if last active within 30 seconds

                return (
                  <tr key={visitor.id} className="border-t border-green-900/30">
                    <td className="p-3 text-gray-300">{visitor.country}</td>
                    <td className="p-3 text-gray-400">{visitor.page}</td>
                    <td className="p-3 text-gray-400">{formatDuration(visitor.duration)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-amber-500"}`}></span>
                        <span className="text-gray-400">{isActive ? "Active" : "Idle"}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

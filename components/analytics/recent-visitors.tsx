"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideRefreshCw, LucideUser, LucideGlobe } from "lucide-react"

interface Visitor {
  id: string
  ip: string
  country: string
  browser: string
  os: string
  timestamp: number
  page: string
}

// Generate random visitor data
const generateVisitors = (count: number): Visitor[] => {
  const visitors: Visitor[] = []
  const countries = ["United States", "Canada", "United Kingdom", "Germany", "Australia", "Japan", "Brazil", "India"]
  const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"]
  const os = ["Windows", "macOS", "iOS", "Android", "Linux"]
  const pages = ["/", "/scripts", "/premium-scripts", "/about"]

  for (let i = 0; i < count; i++) {
    const now = Date.now()
    visitors.push({
      id: `visitor-${Math.random().toString(36).substring(2, 9)}`,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: os[Math.floor(Math.random() * os.length)],
      timestamp: now - Math.floor(Math.random() * 3600000), // Within the last hour
      page: pages[Math.floor(Math.random() * pages.length)],
    })
  }

  // Sort by timestamp (newest first)
  return visitors.sort((a, b) => b.timestamp - a.timestamp)
}

export default function RecentVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadVisitors = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setVisitors(generateVisitors(10))
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    loadVisitors()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadVisitors()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-4 border border-green-900 bg-black">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LucideUser className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-medium text-green-400">Recent Visitors</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-400"
          onClick={loadVisitors}
          disabled={isLoading}
        >
          <LucideRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="border border-green-900 rounded-lg overflow-hidden">
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-900/30">
              <tr className="text-left">
                <th className="p-3 text-green-400">Time</th>
                <th className="p-3 text-green-400">Location</th>
                <th className="p-3 text-green-400">Browser/OS</th>
                <th className="p-3 text-green-400">Page</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="border-t border-green-900/30">
                  <td className="p-3 text-gray-400">{new Date(visitor.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <LucideGlobe className="h-4 w-4 text-green-400" />
                      {visitor.country}
                    </div>
                  </td>
                  <td className="p-3 text-gray-400">
                    {visitor.browser} / {visitor.os}
                  </td>
                  <td className="p-3 text-gray-400">{visitor.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

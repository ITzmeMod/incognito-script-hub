"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideRefreshCw, LucideExternalLink } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LinkClick {
  id: string
  scriptId: number
  scriptTitle: string
  timestamp: number
  successful: boolean
  country: string
}

// Generate random link click data
const generateLinkClicks = (count: number): LinkClick[] => {
  const clicks: LinkClick[] = []
  const countries = ["United States", "Canada", "United Kingdom", "Germany", "Australia", "Japan", "Brazil", "India"]
  const scriptTitles = [
    "Ultimate Game Pass Unlocker",
    "Infinite Jump Script",
    "ESP Player Tracker",
    "Auto Farm Script",
    "Speed Hack Pro",
    "Admin Commands",
    "Aimbot Ultimate",
  ]

  for (let i = 0; i < count; i++) {
    const now = Date.now()
    clicks.push({
      id: `click-${Math.random().toString(36).substring(2, 9)}`,
      scriptId: Math.floor(Math.random() * 7) + 1,
      scriptTitle: scriptTitles[Math.floor(Math.random() * scriptTitles.length)],
      timestamp: now - Math.floor(Math.random() * 86400000), // Within the last day
      successful: Math.random() > 0.2, // 80% success rate
      country: countries[Math.floor(Math.random() * countries.length)],
    })
  }

  // Sort by timestamp (newest first)
  return clicks.sort((a, b) => b.timestamp - a.timestamp)
}

export default function LinkClicks() {
  const [clicks, setClicks] = useState<LinkClick[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadClicks = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setClicks(generateLinkClicks(20))
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    loadClicks()
  }, [])

  // Calculate success rate
  const successRate =
    clicks.length > 0 ? Math.round((clicks.filter((click) => click.successful).length / clicks.length) * 100) : 0

  // Group clicks by script
  const scriptStats = clicks.reduce(
    (acc, click) => {
      if (!acc[click.scriptTitle]) {
        acc[click.scriptTitle] = { total: 0, successful: 0 }
      }

      acc[click.scriptTitle].total++
      if (click.successful) {
        acc[click.scriptTitle].successful++
      }

      return acc
    },
    {} as Record<string, { total: number; successful: number }>,
  )

  // Convert to array and sort by total clicks
  const scriptStatsArray = Object.entries(scriptStats)
    .map(([title, stats]) => ({ title, ...stats }))
    .sort((a, b) => b.total - a.total)

  return (
    <Card className="p-4 border border-green-900 bg-black">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LucideExternalLink className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-medium text-green-400">Script Link Clicks</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-400"
          onClick={loadClicks}
          disabled={isLoading}
        >
          <LucideRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 border border-green-900 rounded-lg">
          <h4 className="text-green-300 font-medium mb-2">Success Rate</h4>
          <div className="flex items-center gap-4">
            <Progress value={successRate} className="h-2" />
            <span className="text-green-400 font-bold">{successRate}%</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {clicks.filter((click) => click.successful).length} successful clicks out of {clicks.length} total
          </p>
        </div>

        <div className="p-4 border border-green-900 rounded-lg">
          <h4 className="text-green-300 font-medium mb-2">Today's Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Clicks</p>
              <p className="text-green-400 text-2xl font-bold">{clicks.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-green-400 text-2xl font-bold">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <h4 className="text-green-300 font-medium mb-2">Top Scripts</h4>
      <div className="border border-green-900 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-green-900/30">
            <tr className="text-left">
              <th className="p-3 text-green-400">Script</th>
              <th className="p-3 text-green-400">Clicks</th>
              <th className="p-3 text-green-400">Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {scriptStatsArray.slice(0, 5).map((script, index) => (
              <tr key={index} className="border-t border-green-900/30">
                <td className="p-3 text-gray-300">{script.title}</td>
                <td className="p-3 text-gray-400">{script.total}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Progress value={(script.successful / script.total) * 100} className="h-2 w-24" />
                    <span className="text-green-400">{Math.round((script.successful / script.total) * 100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-green-300 font-medium mb-2">Recent Clicks</h4>
      <div className="border border-green-900 rounded-lg overflow-hidden">
        <div className="max-h-[200px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-900/30">
              <tr className="text-left">
                <th className="p-3 text-green-400">Time</th>
                <th className="p-3 text-green-400">Script</th>
                <th className="p-3 text-green-400">Country</th>
                <th className="p-3 text-green-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {clicks.slice(0, 10).map((click) => (
                <tr key={click.id} className="border-t border-green-900/30">
                  <td className="p-3 text-gray-400">{new Date(click.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 text-gray-300">{click.scriptTitle}</td>
                  <td className="p-3 text-gray-400">{click.country}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        click.successful ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {click.successful ? "Success" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

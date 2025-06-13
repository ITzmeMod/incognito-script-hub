"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LucideRefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface SecurityEvent {
  type: string
  timestamp: number
  details?: string
}

export default function SecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isOwner } = useAuth()

  // Load events on mount
  useEffect(() => {
    if (isOwner) {
      loadEvents()
    }
  }, [isOwner])

  const loadEvents = () => {
    setIsLoading(true)

    // In a real app, this would fetch from an API
    // For demo, we'll use localStorage
    try {
      const savedEvents = localStorage.getItem("security_events")
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents))
      }
    } catch (error) {
      console.error("Failed to load security events", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a demo event
  const addDemoEvent = () => {
    const eventTypes = [
      "Login attempt",
      "Rate limit exceeded",
      "CSRF token mismatch",
      "Invalid input detected",
      "Authentication success",
    ]

    const newEvent: SecurityEvent = {
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp: Date.now(),
      details: `IP: 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    }

    const updatedEvents = [newEvent, ...events].slice(0, 20)
    setEvents(updatedEvents)
    localStorage.setItem("security_events", JSON.stringify(updatedEvents))
  }

  useEffect(() => {
    // Only load events if owner is logged in
    if (!isOwner) return

    const savedEvents = localStorage.getItem("security_events")
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents))
      } catch (e) {
        console.error("Failed to parse security events", e)
      }
    }

    // Listen for security events
    const handleSecurityEvent = (e: CustomEvent) => {
      const newEvent: SecurityEvent = {
        type: e.detail.type,
        timestamp: Date.now(),
        details: e.detail.details,
      }

      setEvents((prev) => {
        const updated = [newEvent, ...prev].slice(0, 100) // Keep last 100 events
        localStorage.setItem("security_events", JSON.stringify(updated))
        return updated
      })
    }

    window.addEventListener("securityEvent" as any, handleSecurityEvent as EventListener)

    return () => {
      window.removeEventListener("securityEvent" as any, handleSecurityEvent as EventListener)
    }
  }, [isOwner])

  // Log security event helper
  const logSecurityEvent = (type: string, details?: string) => {
    const event = new CustomEvent("securityEvent", {
      detail: { type, details },
    })
    window.dispatchEvent(event)
  }

  // Make the logger available globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).logSecurityEvent = logSecurityEvent
    }
  }, [])

  if (!isOwner) return null

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-green-300 font-medium">Security Event Log</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-green-500 text-green-400" onClick={addDemoEvent}>
            Add Demo Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-500 text-green-400"
            onClick={loadEvents}
            disabled={isLoading}
          >
            <LucideRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-400 text-center py-4 border border-green-900 rounded-lg">No security events recorded</p>
      ) : (
        <div className="border border-green-900 rounded-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-900/30">
                <tr className="text-left">
                  <th className="p-3 text-green-400">Time</th>
                  <th className="p-3 text-green-400">Event</th>
                  <th className="p-3 text-green-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => (
                  <tr key={i} className="border-t border-green-900/30">
                    <td className="p-3 text-gray-400">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-gray-300">{event.type}</td>
                    <td className="p-3 text-gray-400">{event.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

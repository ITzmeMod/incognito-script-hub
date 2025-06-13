"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
  LucideShield,
  LucideDownload,
  LucideSettings,
  LucideEdit,
  LucideLock,
  LucideBarChart,
  LucideCode,
} from "lucide-react"
import SecurityInfo from "./security-info"
import SecurityMonitor from "./security-monitor"
import TechStackInfo from "./tech-stack-info"
import AnalyticsDashboard from "./analytics/analytics-dashboard"
import ScriptManagement from "./script-management"

export default function OwnerDashboard() {
  const { isOwner, user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("welcome")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOwner || !user) return null

  return (
    <div className="mt-8 p-6 border border-green-900 rounded-lg bg-black/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LucideShield className="h-6 w-6 text-green-500" />
          <h3 className="text-2xl font-bold text-green-400">Owner Dashboard</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src={user.picture || "/placeholder.svg"}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-green-500"
              referrerPolicy="no-referrer"
            />
            <span className="text-green-400 hidden md:inline">{user.email}</span>
          </div>
          <Button variant="outline" className="border-red-500 text-red-400" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="welcome" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="welcome" className="data-[state=active]:bg-green-900">
            <LucideShield className="h-4 w-4 mr-2" />
            Welcome
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-900">
            <LucideBarChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="scripts" className="data-[state=active]:bg-green-900">
            <LucideEdit className="h-4 w-4 mr-2" />
            Scripts
          </TabsTrigger>
          <TabsTrigger value="uploads" className="data-[state=active]:bg-green-900">
            <LucideDownload className="h-4 w-4 mr-2" />
            Uploads
          </TabsTrigger>
          <TabsTrigger value="tech" className="data-[state=active]:bg-green-900">
            <LucideCode className="h-4 w-4 mr-2" />
            Tech Stack
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-green-900">
            <LucideLock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-green-900">
            <LucideSettings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <Card className="bg-black border-green-900">
            <CardHeader>
              <CardTitle className="text-green-400">Welcome, {user.name}!</CardTitle>
              <CardDescription>You are logged in as the owner of INCOGNITO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-green-900 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2">Owner Status Active</h4>
                  <p className="text-gray-300">
                    Your Google account <span className="text-green-400">{user.email}</span> has been authorized as the
                    owner of this website. You now have full access to all administrative features.
                  </p>
                </div>

                <div className="p-4 border border-green-900 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2">What You Can Do</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• View visitor analytics and traffic statistics</li>
                    <li>• Edit, add, and delete scripts with full control</li>
                    <li>• Upload new scripts and resources</li>
                    <li>• View tech stack information</li>
                    <li>• Monitor security features and settings</li>
                    <li>• Customize website settings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="scripts">
          <ScriptManagement />
        </TabsContent>

        <TabsContent value="uploads">
          <Card className="bg-black border-green-900">
            <CardHeader>
              <CardTitle className="text-green-400">Upload Scripts</CardTitle>
              <CardDescription>Add new scripts to your website</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Upload functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech">
          <Card className="bg-black border-green-900">
            <CardHeader>
              <CardTitle className="text-green-400">Tech Stack</CardTitle>
              <CardDescription>View the technologies powering your website</CardDescription>
            </CardHeader>
            <CardContent>
              <TechStackInfo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-black border-green-900">
            <CardHeader>
              <CardTitle className="text-green-400">Security Features</CardTitle>
              <CardDescription>View the security measures protecting your website</CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityInfo />
              <SecurityMonitor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-black border-green-900">
            <CardHeader>
              <CardTitle className="text-green-400">Website Settings</CardTitle>
              <CardDescription>Configure global website settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

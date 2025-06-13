"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideBarChart, LucideUsers, LucideExternalLink, LucideActivity } from "lucide-react"
import VisitorChart from "./visitor-chart"
import RecentVisitors from "./recent-visitors"
import LinkClicks from "./link-clicks"
import LiveVisitors from "./live-visitors"

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Card className="bg-black border-green-900">
      <CardHeader>
        <CardTitle className="text-green-400">Analytics Dashboard</CardTitle>
        <CardDescription>Track visitors and monitor script performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-900">
              <LucideBarChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="visitors" className="data-[state=active]:bg-green-900">
              <LucideUsers className="h-4 w-4 mr-2" />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-green-900">
              <LucideActivity className="h-4 w-4 mr-2" />
              Live
            </TabsTrigger>
            <TabsTrigger value="clicks" className="data-[state=active]:bg-green-900">
              <LucideExternalLink className="h-4 w-4 mr-2" />
              Link Clicks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <VisitorChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecentVisitors />
              <LinkClicks />
            </div>
          </TabsContent>

          <TabsContent value="visitors">
            <RecentVisitors />
          </TabsContent>

          <TabsContent value="live">
            <LiveVisitors />
          </TabsContent>

          <TabsContent value="clicks">
            <LinkClicks />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

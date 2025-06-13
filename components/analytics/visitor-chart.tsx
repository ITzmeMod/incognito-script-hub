"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for the visitor chart
const generateVisitorData = () => {
  const today = new Date()
  const data = []

  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visitors: Math.floor(Math.random() * 100) + 50,
      uniqueVisitors: Math.floor(Math.random() * 60) + 30,
    })
  }

  return data
}

// Sample data for the last 30 days
const generateMonthlyData = () => {
  const today = new Date()
  const data = []

  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visitors: Math.floor(Math.random() * 100) + 50,
      uniqueVisitors: Math.floor(Math.random() * 60) + 30,
    })
  }

  return data
}

export default function VisitorChart() {
  const [timeRange, setTimeRange] = useState("7days")
  const [chartData, setChartData] = useState(generateVisitorData())

  const handleRangeChange = (value: string) => {
    setTimeRange(value)
    if (value === "7days") {
      setChartData(generateVisitorData())
    } else if (value === "30days") {
      setChartData(generateMonthlyData())
    }
  }

  return (
    <Card className="p-4 border border-green-900 bg-black">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-green-400">Visitor Traffic</h3>
        <Tabs defaultValue="7days" value={timeRange} onValueChange={handleRangeChange}>
          <TabsList className="bg-green-900/20">
            <TabsTrigger value="7days" className="data-[state=active]:bg-green-900">
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger value="30days" className="data-[state=active]:bg-green-900">
              Last 30 Days
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[300px] w-full">
        <ChartContainer
          config={{
            visitors: {
              label: "Total Visitors",
              color: "hsl(var(--chart-1))",
            },
            uniqueVisitors: {
              label: "Unique Visitors",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-visitors)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="var(--color-uniqueVisitors)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  )
}

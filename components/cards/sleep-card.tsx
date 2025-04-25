"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Moon } from "lucide-react"

// Sample sleep data
const sleepData = [
  { day: "Mon", deep: 2.1, light: 4.3, rem: 1.5 },
  { day: "Tue", deep: 1.8, light: 3.9, rem: 1.2 },
  { day: "Wed", deep: 2.3, light: 4.5, rem: 1.7 },
  { day: "Thu", deep: 2.0, light: 4.2, rem: 1.0 },
  { day: "Fri", deep: 1.9, light: 4.0, rem: 1.3 },
  { day: "Sat", deep: 2.5, light: 4.8, rem: 1.9 },
  { day: "Sun", deep: 2.2, light: 4.1, rem: 1.4 },
]

interface SleepCardProps {
  detailed?: boolean
  sleep: number
}

export default function SleepCard({ detailed = false, sleep }: SleepCardProps) {
  // Format sleep hours to hours and minutes
  const sleepHours = Math.floor(sleep)
  const sleepMinutes = Math.round((sleep - sleepHours) * 60)
  const sleepFormatted = `${sleepHours}h ${sleepMinutes}m`

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-full">
              <Moon className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-base">Sleep</CardTitle>
          </div>
          <CardDescription className="text-base font-medium">{sleepFormatted}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            deep: {
              label: "Deep Sleep",
              color: "hsl(270, 70%, 50%)",
            },
            light: {
              label: "Light Sleep",
              color: "hsl(270, 70%, 80%)",
            },
            rem: {
              label: "REM",
              color: "hsl(270, 70%, 30%)",
            },
          }}
          className={detailed ? "h-[300px]" : "h-[150px]"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sleepData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              barGap={0}
              barCategoryGap="15%"
            >
              {detailed && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="deep" stackId="a" fill="var(--color-deep)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="light" stackId="a" fill="var(--color-light)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rem" stackId="a" fill="var(--color-rem)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {detailed && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Deep</p>
              <p className="font-medium">{(sleep * 0.3).toFixed(1)}h</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Light</p>
              <p className="font-medium">{(sleep * 0.55).toFixed(1)}h</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">REM</p>
              <p className="font-medium">{(sleep * 0.15).toFixed(1)}h</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

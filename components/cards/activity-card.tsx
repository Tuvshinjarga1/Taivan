"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Activity } from "lucide-react"

// Sample activity data
const activityData = [
  { time: "00:00", calories: 0 },
  { time: "03:00", calories: 120 },
  { time: "06:00", calories: 250 },
  { time: "09:00", calories: 480 },
  { time: "12:00", calories: 820 },
  { time: "15:00", calories: 1240 },
  { time: "18:00", calories: 1540 },
  { time: "21:00", calories: 1842 },
]

interface ActivityCardProps {
  detailed?: boolean
  calories: number
}

export default function ActivityCard({ detailed = false, calories }: ActivityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Activity className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-base">Activity</CardTitle>
          </div>
          <CardDescription className="text-base font-medium">{calories.toLocaleString()} cal</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            calories: {
              label: "Calories",
              color: "hsl(142, 76%, 36%)",
            },
          }}
          className={detailed ? "h-[300px]" : "h-[150px]"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              {detailed && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (detailed ? value : "")}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-calories)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-calories)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="calories"
                stroke="var(--color-calories)"
                fillOpacity={1}
                fill="url(#colorCalories)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {detailed && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="font-medium">2,200 cal</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="font-medium">{Math.round(calories * 0.45).toLocaleString()} cal</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">BMR</p>
              <p className="font-medium">{Math.round(calories * 0.55).toLocaleString()} cal</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

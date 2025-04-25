"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Footprints } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Sample steps data
const stepsData = [
  { day: "Mon", steps: 9234 },
  { day: "Tue", steps: 7890 },
  { day: "Wed", steps: 10456 },
  { day: "Thu", steps: 8243 },
  { day: "Fri", steps: 9123 },
  { day: "Sat", steps: 6789 },
  { day: "Sun", steps: 5432 },
]

interface StepsCardProps {
  detailed?: boolean
  steps: number
}

export default function StepsCard({ detailed = false, steps }: StepsCardProps) {
  const goalSteps = 10000
  const progressPercentage = (steps / goalSteps) * 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Footprints className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-base">Steps</CardTitle>
          </div>
          <CardDescription className="text-base font-medium">{steps.toLocaleString()}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {detailed && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Daily Goal</span>
              <span className="text-sm font-medium">
                {steps.toLocaleString()} / {goalSteps.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <ChartContainer
          config={{
            steps: {
              label: "Steps",
              color: "hsl(210, 100%, 60%)",
            },
          }}
          className={detailed ? "h-[300px]" : "h-[150px]"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stepsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              {detailed && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="steps" fill="var(--color-steps)" radius={4} barSize={detailed ? 30 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {detailed && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-medium">{(steps * 0.0008).toFixed(1)} km</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="font-medium">{Math.round(steps * 0.04)}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Floors</p>
              <p className="font-medium">{Math.round(steps / 500)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

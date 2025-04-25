"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Heart } from "lucide-react"

// Sample heart rate data
const heartRateData = [
  { time: "00:00", rate: 62 },
  { time: "03:00", rate: 58 },
  { time: "06:00", rate: 65 },
  { time: "09:00", rate: 78 },
  { time: "12:00", rate: 82 },
  { time: "15:00", rate: 76 },
  { time: "18:00", rate: 74 },
  { time: "21:00", rate: 68 },
]

interface HeartRateCardProps {
  detailed?: boolean
  heartRate: number
}

export default function HeartRateCard({ detailed = false, heartRate }: HeartRateCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-2 rounded-full">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <CardTitle className="text-base">Heart Rate</CardTitle>
          </div>
          <CardDescription className="text-base font-medium">{heartRate} bpm</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            rate: {
              label: "Heart Rate",
              color: "hsl(0, 84%, 60%)",
            },
          }}
          className={detailed ? "h-[300px]" : "h-[150px]"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heartRateData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              {detailed && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
              {detailed && <YAxis domain={[50, 100]} />}
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (detailed ? value : "")}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-rate)"
                strokeWidth={2}
                dot={detailed}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {detailed && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Resting</p>
              <p className="font-medium">58 bpm</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="font-medium">{heartRate} bpm</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-muted-foreground">Max</p>
              <p className="font-medium">82 bpm</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

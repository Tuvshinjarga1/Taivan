"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Bar,
  BarChart,
} from "recharts"
import { getUserHealthDataAction } from "@/app/actions/firebase-actions"
import { Heart, Footprints, Moon, Activity, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Sample data for when we don't have enough real data
const sampleWeeklyData = [
  { day: "Mon", heartRate: 68, steps: 7500, sleep: 7.2, calories: 1650 },
  { day: "Tue", heartRate: 72, steps: 8200, sleep: 6.8, calories: 1720 },
  { day: "Wed", heartRate: 70, steps: 9100, sleep: 7.5, calories: 1850 },
  { day: "Thu", heartRate: 73, steps: 8500, sleep: 7.0, calories: 1780 },
  { day: "Fri", heartRate: 71, steps: 9300, sleep: 6.5, calories: 1900 },
  { day: "Sat", heartRate: 69, steps: 7800, sleep: 8.2, calories: 1600 },
  { day: "Sun", heartRate: 67, steps: 6500, sleep: 8.5, calories: 1500 },
]

const sampleMonthlyData = [
  { week: "Week 1", avgHeartRate: 69, totalSteps: 52000, avgSleep: 7.3, totalCalories: 12000 },
  { week: "Week 2", avgHeartRate: 71, totalSteps: 56000, avgSleep: 7.1, totalCalories: 12500 },
  { week: "Week 3", avgHeartRate: 70, totalSteps: 54000, avgSleep: 7.4, totalCalories: 12300 },
  { week: "Week 4", avgHeartRate: 68, totalSteps: 50000, avgSleep: 7.6, totalCalories: 11800 },
]

interface ReportsProps {
  userId: string
}

export default function Reports({ userId }: ReportsProps) {
  const [timeRange, setTimeRange] = useState("7")
  const [reportType, setReportType] = useState("daily")
  const [healthData, setHealthData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const days = Number.parseInt(timeRange)
        const result = await getUserHealthDataAction(userId, days)

        if (result.success && result.data && result.data.length > 0) {
          // Process the data for display
          const processedData = result.data.map((item: any) => ({
            day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
            date: item.date,
            heartRate: item.heartRate,
            steps: item.steps,
            sleep: item.sleep,
            calories: item.calories,
          }))

          // Sort by date
          processedData.sort((a: any, b: any) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
          })

          setHealthData(processedData)
        } else {
          // Use sample data if no data is available
          setHealthData(reportType === "daily" ? sampleWeeklyData : sampleMonthlyData)
        }
      } catch (error) {
        console.error("Error fetching health data for reports:", error)
        // Use sample data on error
        setHealthData(reportType === "daily" ? sampleWeeklyData : sampleMonthlyData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, timeRange, reportType])

  // Calculate averages and totals for the summary cards
  const summary = healthData.reduce(
    (acc, curr) => {
      return {
        avgHeartRate: acc.avgHeartRate + (curr.heartRate || 0),
        totalSteps: acc.totalSteps + (curr.steps || 0),
        avgSleep: acc.avgSleep + (curr.sleep || 0),
        totalCalories: acc.totalCalories + (curr.calories || 0),
      }
    },
    { avgHeartRate: 0, totalSteps: 0, avgSleep: 0, totalCalories: 0 },
  )

  const dataLength = healthData.length || 1
  summary.avgHeartRate = Math.round(summary.avgHeartRate / dataLength)
  summary.avgSleep = Number.parseFloat((summary.avgSleep / dataLength).toFixed(1))

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Health Reports</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Report Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-full">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <CardTitle className="text-sm">Heart Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.avgHeartRate} <span className="text-sm font-normal">bpm</span>
            </div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Footprints className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-sm">Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSteps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <Moon className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-sm">Sleep</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.avgSleep} <span className="text-sm font-normal">hrs</span>
            </div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              <CardTitle className="text-sm">Calories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCalories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heartRate">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="calories">Calories</TabsTrigger>
        </TabsList>

        <TabsContent value="heartRate">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate Trends</CardTitle>
              <CardDescription>Average heart rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    heartRate: {
                      label: "Heart Rate (bpm)",
                      color: "hsl(0, 84%, 60%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="var(--color-heartRate)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Heart Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle>Steps Trends</CardTitle>
              <CardDescription>Daily step count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    steps: {
                      label: "Steps",
                      color: "hsl(210, 100%, 60%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="steps" fill="var(--color-steps)" name="Steps" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep">
          <Card>
            <CardHeader>
              <CardTitle>Sleep Trends</CardTitle>
              <CardDescription>Hours of sleep over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    sleep: {
                      label: "Sleep (hours)",
                      color: "hsl(270, 70%, 50%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sleep"
                        stroke="var(--color-sleep)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Sleep"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calories">
          <Card>
            <CardHeader>
              <CardTitle>Calories Trends</CardTitle>
              <CardDescription>Calories burned over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    calories: {
                      label: "Calories",
                      color: "hsl(142, 76%, 36%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="calories" fill="var(--color-calories)" name="Calories" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

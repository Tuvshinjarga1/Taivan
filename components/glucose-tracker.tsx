"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Droplet, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { saveGlucoseReading, getGlucoseReadings, type GlucoseReading } from "@/lib/diabetes-service"

interface GlucoseTrackerProps {
  userId: string
}

export default function GlucoseTracker({ userId }: GlucoseTrackerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [glucoseValue, setGlucoseValue] = useState("")
  const [readingType, setReadingType] = useState<"fasting" | "before_meal" | "after_meal" | "bedtime" | "random">(
    "random",
  )
  const [notes, setNotes] = useState("")
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([])
  const [timeRange, setTimeRange] = useState("7") // 7 days by default
  const { toast } = useToast()
  const router = useRouter()

  // Сахарын хэмжилтүүдийг ачаалах
  useEffect(() => {
    const loadGlucoseReadings = async () => {
      setIsLoading(true)
      try {
        const days = Number.parseInt(timeRange)
        const result = await getGlucoseReadings(userId, days)
        if (result.success) {
          setGlucoseReadings(result.data)
        } else {
          toast({
            title: "Алдаа гарлаа",
            description: result.error || "Сахарын хэмжилтүүдийг ачаалахад алдаа гарлаа.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading glucose readings:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Сахарын хэмжилтүүдийг ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadGlucoseReadings()
  }, [userId, timeRange, toast])

  // Сахарын хэмжилт нэмэх
  const handleAddGlucoseReading = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const value = Number.parseFloat(glucoseValue)
      if (isNaN(value) || value <= 0) {
        toast({
          title: "Буруу утга",
          description: "Сахарын хэмжээ нь эерэг тоо байх ёстой.",
          variant: "destructive",
        })
        return
      }

      const newReading: Omit<GlucoseReading, "id"> = {
        userId,
        value,
        readingType,
        timestamp: new Date(),
        notes,
      }

      const result = await saveGlucoseReading(newReading)

      if (result.success) {
        toast({
          title: "Хэмжилт нэмэгдлээ",
          description: "Сахарын хэмжилт амжилттай хадгалагдлаа.",
        })

        // Формыг цэвэрлэх
        setGlucoseValue("")
        setReadingType("random")
        setNotes("")

        // Хэмжилтүүдийг дахин ачаалах
        const days = Number.parseInt(timeRange)
        const readingsResult = await getGlucoseReadings(userId, days)
        if (readingsResult.success) {
          setGlucoseReadings(readingsResult.data)
        }
      } else {
        toast({
          title: "Алдаа гарлаа",
          description: result.error || "Сахарын хэмжилтийг хадгалахад алдаа гарлаа.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving glucose reading:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Сахарын хэмжилтийг хадгалахад алдаа гарлаа.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Сахарын хэмжилтийн статусыг тодорхойлох
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: "low", label: "Бага", color: "text-blue-500 bg-blue-100" }
    if (value <= 140) return { status: "normal", label: "Хэвийн", color: "text-green-500 bg-green-100" }
    if (value <= 180) return { status: "elevated", label: "Өндөр", color: "text-yellow-500 bg-yellow-100" }
    return { status: "high", label: "Маш өндөр", color: "text-red-500 bg-red-100" }
  }

  // Сахарын хэмжилтийн дундаж утгыг тооцоолох
  const calculateAverageGlucose = () => {
    if (glucoseReadings.length === 0) return 0
    const sum = glucoseReadings.reduce((acc, reading) => acc + reading.value, 0)
    return Math.round(sum / glucoseReadings.length)
  }

  // Сахарын хэмжилтийн хамгийн их утгыг олох
  const getMaxGlucose = () => {
    if (glucoseReadings.length === 0) return 0
    return Math.max(...glucoseReadings.map((reading) => reading.value))
  }

  // Сахарын хэмжилтийн хамгийн бага утгыг олох
  const getMinGlucose = () => {
    if (glucoseReadings.length === 0) return 0
    return Math.min(...glucoseReadings.map((reading) => reading.value))
  }

  // График дээр харуулах өгөгдлийг бэлтгэх
  const prepareChartData = () => {
    // Хуулбарыг үүсгэж, огноогоор эрэмбэлэх
    const sortedReadings = [...glucoseReadings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    return sortedReadings.map((reading) => ({
      date: new Date(reading.timestamp).toLocaleDateString("mn-MN", {
        month: "short",
        day: "numeric",
      }),
      time: new Date(reading.timestamp).toLocaleTimeString("mn-MN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: reading.value,
      type: reading.readingType,
    }))
  }

  const chartData = prepareChartData()
  const averageGlucose = calculateAverageGlucose()
  const maxGlucose = getMaxGlucose()
  const minGlucose = getMinGlucose()

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Хянах самбар руу буцах
        </Button>
        <h1 className="text-2xl font-bold">Сахарын хэмжилт</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Дундаж</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{averageGlucose}</div>
              <div className="ml-2 text-sm text-muted-foreground">мг/дл</div>
              <Badge variant="outline" className={`ml-auto ${getGlucoseStatus(averageGlucose).color}`}>
                {getGlucoseStatus(averageGlucose).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Хамгийн их</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{maxGlucose}</div>
              <div className="ml-2 text-sm text-muted-foreground">мг/дл</div>
              <Badge variant="outline" className={`ml-auto ${getGlucoseStatus(maxGlucose).color}`}>
                {getGlucoseStatus(maxGlucose).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Хамгийн бага</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{minGlucose}</div>
              <div className="ml-2 text-sm text-muted-foreground">мг/дл</div>
              <Badge variant="outline" className={`ml-auto ${getGlucoseStatus(minGlucose).color}`}>
                {getGlucoseStatus(minGlucose).label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Сахарын түвшний түүх</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Хугацааны хязгаар" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Сүүлийн 7 өдөр</SelectItem>
                <SelectItem value="14">Сүүлийн 14 өдөр</SelectItem>
                <SelectItem value="30">Сүүлийн 30 өдөр</SelectItem>
                <SelectItem value="90">Сүүлийн 3 сар</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Сахарын түвшин (мг/дл)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value, index) => {
                        // Зөвхөн хэдэн хэдэн огноог харуулах
                        return index % 2 === 0 ? value : ""
                      }}
                    />
                    <YAxis domain={[0, "auto"]} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name, props) => {
                            const entry = props.payload
                            return [
                              `${value} мг/дл`,
                              `${entry.time}, ${
                                entry.type === "fasting"
                                  ? "Өлөн үед"
                                  : entry.type === "before_meal"
                                    ? "Хоолны өмнө"
                                    : entry.type === "after_meal"
                                      ? "Хоолны дараа"
                                      : entry.type === "bedtime"
                                        ? "Унтахын өмнө"
                                        : "Санамсаргүй"
                              }`,
                            ]
                          }}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    {/* Хэвийн хязгаарыг харуулах шугамууд */}
                    <Line
                      type="monotone"
                      dataKey={() => 70}
                      stroke="#3b82f6"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      activeDot={false}
                      name="Бага хязгаар"
                    />
                    <Line
                      type="monotone"
                      dataKey={() => 140}
                      stroke="#22c55e"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      activeDot={false}
                      name="Хэвийн хязгаар"
                    />
                    <Line
                      type="monotone"
                      dataKey={() => 180}
                      stroke="#eab308"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      activeDot={false}
                      name="Өндөр хязгаар"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Сахарын хэмжилтийн түүх байхгүй байна</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Шинэ хэмжилт нэмэх</CardTitle>
          <CardDescription>Сахарын хэмжилтээ бүртгэж, хянаж байгаарай</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddGlucoseReading} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="glucose-value">Сахарын хэмжээ (мг/дл)</Label>
              <Input
                id="glucose-value"
                type="number"
                placeholder="Жишээ: 120"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reading-type">Хэмжилтийн төрөл</Label>
              <Select value={readingType} onValueChange={(value) => setReadingType(value as any)}>
                <SelectTrigger id="reading-type">
                  <SelectValue placeholder="Хэмжилтийн төрлийг сонгоно уу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fasting">Өлөн үед</SelectItem>
                  <SelectItem value="before_meal">Хоолны өмнө</SelectItem>
                  <SelectItem value="after_meal">Хоолны дараа</SelectItem>
                  <SelectItem value="bedtime">Унтахын өмнө</SelectItem>
                  <SelectItem value="random">Санамсаргүй</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Тэмдэглэл (заавал биш)</Label>
              <Input
                id="notes"
                placeholder="Жишээ: Өглөөний цай уусны дараа"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                "Хэмжилт нэмэх"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сүүлийн хэмжилтүүд</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {glucoseReadings.length > 0 ? (
              glucoseReadings.slice(0, 5).map((reading) => (
                <Card key={reading.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getGlucoseStatus(reading.value).color}`}>
                        <Droplet className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{reading.value} мг/дл</h4>
                          <Badge variant="outline" className={getGlucoseStatus(reading.value).color}>
                            {getGlucoseStatus(reading.value).label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reading.timestamp).toLocaleString("mn-MN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {reading.readingType === "fasting"
                            ? "Өлөн үед"
                            : reading.readingType === "before_meal"
                              ? "Хоолны өмнө"
                              : reading.readingType === "after_meal"
                                ? "Хоолны дараа"
                                : reading.readingType === "bedtime"
                                  ? "Унтахын өмнө"
                                  : "Санамсаргүй"}
                        </p>
                        {reading.notes && <p className="text-xs italic mt-1">{reading.notes}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">Сахарын хэмжилтийн түүх байхгүй байна</div>
            )}
          </div>
          {glucoseReadings.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => router.push("/glucose-history")}>
                Бүх хэмжилтүүдийг харах
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Зөвлөмж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Хэзээ хэмжих вэ?</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Өглөө сэрсний дараа, хоол идэхээс өмнө (өлөн үеийн)</li>
                <li>Үндсэн хоол идэхээс өмнө</li>
                <li>Үндсэн хоол идсэнээс 2 цагийн дараа</li>
                <li>Унтахаас өмнө</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Зорилтот хэмжээ</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <span className="font-medium">Өлөн үеийн:</span> 80-130 мг/дл
                </li>
                <li>
                  <span className="font-medium">Хоолны дараах:</span> 180 мг/дл-ээс бага
                </li>
                <li>
                  <span className="font-medium">Унтахын өмнөх:</span> 100-140 мг/дл
                </li>
                <li>
                  <span className="font-medium">HbA1c:</span> 7.0%-ээс бага
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Яаралтай тусламж</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <span className="font-medium">Бага сахар (70 мг/дл-ээс доош):</span> 15 гр нүүрс ус хэрэглэх (жишээ
                  нь: 4 унц жүүс, 3-4 ширхэг глюкозын шахмал)
                </li>
                <li>
                  <span className="font-medium">Өндөр сахар (250 мг/дл-ээс дээш):</span> Их хэмжээний ус уух, эмчид
                  хандах
                </li>
                <li>
                  <span className="font-medium">Маш өндөр сахар (350 мг/дл-ээс дээш):</span> Яаралтай эмчид хандах
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/diabetes-information")}>
            Чихрийн шижингийн талаар дэлгэрэнгүй мэдээлэл авах
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

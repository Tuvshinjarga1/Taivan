import { Suspense } from "react"
import { getGlucoseReadings } from "@/lib/diabetes-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Droplet } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function GlucoseHistoryPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123" // Placeholder user ID

  // Fetch glucose readings
  const result = await getGlucoseReadings(userId, 30)

  // Сахарын хэмжилтийн статусыг тодорхойлох
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: "low", label: "Бага", color: "text-blue-500 bg-blue-100" }
    if (value <= 140) return { status: "normal", label: "Хэвийн", color: "text-green-500 bg-green-100" }
    if (value <= 180) return { status: "elevated", label: "Өндөр", color: "text-yellow-500 bg-yellow-100" }
    return { status: "high", label: "Маш өндөр", color: "text-red-500 bg-red-100" }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard" passHref>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Хянах самбар руу буцах
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Сахарын хэмжилтийн түүх</h1>
        </div>

        <Suspense fallback={<div className="p-4">Ачаалж байна...</div>}>
          <Card>
            <CardHeader>
              <CardTitle>Сүүлийн 30 өдрийн хэмжилтүүд</CardTitle>
              <CardDescription>Нийт {result.success ? result.data.length : 0} хэмжилт</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.success && result.data.length > 0 ? (
                  result.data.map((reading) => (
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
            </CardContent>
          </Card>
        </Suspense>

        <div className="flex justify-center mt-4">
          <Link href="/glucose-tracker" passHref>
            <Button>Шинэ хэмжилт нэмэх</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

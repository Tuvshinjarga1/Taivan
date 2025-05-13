"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { saveGlucoseReading, getGlucoseReadings } from "@/lib/diabetes-service";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import GlucoseChart from "@/components/glucose-chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Define types based on the diabetes-service.ts file
interface GlucoseReading {
  id?: string;
  userId: string;
  value: number;
  readingType: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random";
  timestamp: Date;
  notes?: string;
}

interface GlucoseStats {
  average: number;
  min: number;
  max: number;
  inRange: number;
  total: number;
  trend: "up" | "down" | "stable";
  readingsByType: {
    [key: string]: {
      count: number;
      average: number;
    };
  };
}

export default function GlucoseTrackerPage() {
  const [activeTab, setActiveTab] = useState("chart");
  const [value, setValue] = useState(110);
  const [readingType, setReadingType] =
    useState<GlucoseReading["readingType"]>("before_meal");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [isLoadingReadings, setIsLoadingReadings] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Статик хэрэглэгчийн ID - real app would get this from auth
  const userId = "user123";

  // Fetch glucose readings on component mount
  useEffect(() => {
    async function fetchReadings() {
      setIsLoadingReadings(true);
      try {
        const result = await getGlucoseReadings(userId, 30);
        if (result.success && result.data) {
          setReadings(result.data);
        } else {
          toast({
            title: "Алдаа гарлаа",
            description: result.error || "Хэмжилтүүдийг ачаалж чадсангүй",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching readings:", error);
        toast({
          title: "Алдаа гарлаа",
          description: "Хэмжилтүүдийг ачаалж чадсангүй",
          variant: "destructive",
        });
      } finally {
        setIsLoadingReadings(false);
      }
    }

    fetchReadings();
  }, [toast, userId]);

  // Simple search functionality
  const filteredReadings = readings.filter(
    (reading) =>
      reading.readingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.value.toString().includes(searchTerm.toLowerCase())
  );

  // Function to get color based on glucose value
  const getStatusColor = (value: number) => {
    if (value < 70) return "text-blue-600 bg-blue-100";
    if (value <= 140) return "text-green-600 bg-green-100";
    if (value <= 180) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // Function to get status label based on glucose value
  const getStatusLabel = (value: number) => {
    if (value < 70) return "Бага";
    if (value <= 140) return "Хэвийн";
    if (value <= 180) return "Өндөр";
    return "Маш өндөр";
  };

  // Convert reading type to display text
  const getReadingTypeText = (type: GlucoseReading["readingType"]) => {
    switch (type) {
      case "fasting":
        return "Өлөн үед";
      case "before_meal":
        return "Хооллохын өмнө";
      case "after_meal":
        return "Хооллосноос хойш";
      case "bedtime":
        return "Унтахын өмнө";
      case "random":
        return "Санамсаргүй";
      default:
        return type;
    }
  };

  // Calculate statistics for a given time period
  const calculateStats = (
    periodReadings: GlucoseReading[]
  ): GlucoseStats | null => {
    if (!periodReadings.length) return null;

    // Sort readings by timestamp
    const sortedReadings = [...periodReadings].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate average
    const sum = sortedReadings.reduce((acc, reading) => acc + reading.value, 0);
    const average = Math.round(sum / sortedReadings.length);

    // Calculate min and max
    const min = Math.min(...sortedReadings.map((r) => r.value));
    const max = Math.max(...sortedReadings.map((r) => r.value));

    // Calculate % in range (70-140 mg/dL is considered normal)
    const inRange = sortedReadings.filter(
      (r) => r.value >= 70 && r.value <= 140
    ).length;
    const percentInRange = Math.round((inRange / sortedReadings.length) * 100);

    // Calculate trend (compare first half vs second half of readings)
    const midpoint = Math.floor(sortedReadings.length / 2);
    const firstHalf = sortedReadings.slice(0, midpoint);
    const secondHalf = sortedReadings.slice(midpoint);

    const firstHalfAvg =
      firstHalf.reduce((acc, r) => acc + r.value, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((acc, r) => acc + r.value, 0) / secondHalf.length;

    let trend: "up" | "down" | "stable" = "stable";
    if (secondHalfAvg > firstHalfAvg + 5) trend = "up";
    else if (secondHalfAvg < firstHalfAvg - 5) trend = "down";

    // Calculate readings by type
    const readingsByType: GlucoseStats["readingsByType"] = {};

    sortedReadings.forEach((reading) => {
      const type = reading.readingType;
      if (!readingsByType[type]) {
        readingsByType[type] = { count: 0, average: 0 };
      }
      readingsByType[type].count++;
      readingsByType[type].average =
        (readingsByType[type].average * (readingsByType[type].count - 1) +
          reading.value) /
        readingsByType[type].count;
    });

    // Round averages
    Object.keys(readingsByType).forEach((type) => {
      readingsByType[type].average = Math.round(readingsByType[type].average);
    });

    return {
      average,
      min,
      max,
      inRange: percentInRange,
      total: sortedReadings.length,
      trend,
      readingsByType,
    };
  };

  // Get 7-day and monthly statistics
  const last7Days = readings.filter((reading) => {
    const readingDate = new Date(reading.timestamp);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return readingDate >= sevenDaysAgo;
  });

  const lastMonth = readings.filter((reading) => {
    const readingDate = new Date(reading.timestamp);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return readingDate >= thirtyDaysAgo;
  });

  const weeklyStats = calculateStats(last7Days);
  const monthlyStats = calculateStats(lastMonth);

  // Save a new reading
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newReading: Omit<GlucoseReading, "id"> = {
        userId,
        value,
        readingType,
        timestamp: new Date(),
        notes: notes.trim() || undefined,
      };

      const result = await saveGlucoseReading(newReading);

      if (result.success) {
        toast({
          title: "Амжилттай",
          description: "Сахарын хэмжилт амжилттай хадгалагдлаа",
        });

        // Refresh data
        const updatedReadings = await getGlucoseReadings(userId, 30);
        if (updatedReadings.success && updatedReadings.data) {
          setReadings(updatedReadings.data);
        }

        // Reset form
        setNotes("");

        // Switch to chart tab
        setActiveTab("chart");
      } else {
        toast({
          title: "Алдаа гарлаа",
          description: result.error || "Хэмжилт хадгалж чадсангүй",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving reading:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Хэмжилт хадгалж чадсангүй",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert readings format for chart component
  const chartReadings = readings.map((reading) => ({
    id: reading.id || "",
    value: reading.value,
    timestamp: reading.timestamp,
    type: getReadingTypeText(reading.readingType),
  }));

  return (
    <div className="px-4 py-4 mx-auto max-w-5xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Буцах
        </Button>
        <h1 className="text-2xl font-bold">Цусны сахарын хяналт</h1>
      </div>

      {readings.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Хамгийн сүүлийн хэмжилт</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">
                  {readings[0].value} мг/дл
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(readings[0].timestamp)}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    readings[0].value
                  )}`}
                >
                  {getStatusLabel(readings[0].value)}
                </span>
                <div className="text-sm text-muted-foreground mt-1">
                  {getReadingTypeText(readings[0].readingType)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="chart" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chart">График</TabsTrigger>
          <TabsTrigger value="stats">Статистик</TabsTrigger>
          <TabsTrigger value="history">Түүх</TabsTrigger>
          <TabsTrigger value="add">Шинэ хэмжилт</TabsTrigger>
        </TabsList>

        {/* График харуулах */}
        <TabsContent value="chart" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>
                Сахарын түвшний хугацаанаас хамаарах өөрчлөлт
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReadings ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                    <div className="text-muted-foreground">
                      Ачааллаж байна...
                    </div>
                  </div>
                </div>
              ) : readings.length > 0 ? (
                <div className="h-80">
                  <GlucoseChart readings={chartReadings} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Хэмжилтийн мэдээлэл байхгүй байна</p>
                    <p className="text-sm mt-2">
                      Шинэ хэмжилт нэмснээр график харуулах боломжтой
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Статистик харуулах */}
        <TabsContent value="stats" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>Сахарын хэмжилтийн статистик</CardTitle>
              <CardDescription>
                Сүүлийн 7 хоног болон сарын мэдээлэл
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReadings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                    <div className="text-muted-foreground">
                      Ачааллаж байна...
                    </div>
                  </div>
                </div>
              ) : readings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Хэмжилтийн мэдээлэл байхгүй байна</p>
                  <p className="text-sm mt-2">
                    Шинэ хэмжилт нэмснээр статистик харах боломжтой
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 7 хоногийн статистик */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-medium">Сүүлийн 7 хоног</h3>
                    </div>

                    {weeklyStats ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Дундаж хэмжээ
                            </span>
                            <span className="font-bold">
                              {weeklyStats.average} мг/дл
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Хамгийн бага
                            </span>
                            <span className="font-medium">
                              {weeklyStats.min} мг/дл
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Хамгийн их
                            </span>
                            <span className="font-medium">
                              {weeklyStats.max} мг/дл
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Нийт хэмжилт
                            </span>
                            <span className="font-medium">
                              {weeklyStats.total}
                            </span>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Хэвийн хүрээнд
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                weeklyStats.inRange >= 70
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {weeklyStats.inRange}%
                            </Badge>
                          </div>
                          <div className="mb-3">
                            <Progress
                              value={weeklyStats.inRange}
                              className="h-2"
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-1">
                              Тренд:
                            </span>
                            <div className="flex items-center">
                              {weeklyStats.trend === "up" && (
                                <>
                                  <ChevronUp className="h-4 w-4 text-red-500" />{" "}
                                  <span className="text-sm text-red-500">
                                    Өсөж байна
                                  </span>
                                </>
                              )}
                              {weeklyStats.trend === "down" && (
                                <>
                                  <ChevronDown className="h-4 w-4 text-green-500" />{" "}
                                  <span className="text-sm text-green-500">
                                    Буурч байна
                                  </span>
                                </>
                              )}
                              {weeklyStats.trend === "stable" && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-blue-500" />{" "}
                                  <span className="text-sm text-blue-500">
                                    Тогтвортой
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-muted-foreground border rounded-lg">
                        Сүүлийн 7 хоногт хэмжилт хийгдээгүй байна
                      </div>
                    )}
                  </div>

                  {/* Сарын статистик */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-medium">Сүүлийн сар</h3>
                    </div>

                    {monthlyStats ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Дундаж хэмжээ
                            </span>
                            <span className="font-bold">
                              {monthlyStats.average} мг/дл
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Хамгийн бага
                            </span>
                            <span className="font-medium">
                              {monthlyStats.min} мг/дл
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Хамгийн их
                            </span>
                            <span className="font-medium">
                              {monthlyStats.max} мг/дл
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Нийт хэмжилт
                            </span>
                            <span className="font-medium">
                              {monthlyStats.total}
                            </span>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Хэвийн хүрээнд
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                monthlyStats.inRange >= 70
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {monthlyStats.inRange}%
                            </Badge>
                          </div>
                          <div className="mb-3">
                            <Progress
                              value={monthlyStats.inRange}
                              className="h-2"
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-1">
                              Тренд:
                            </span>
                            <div className="flex items-center">
                              {monthlyStats.trend === "up" && (
                                <>
                                  <ChevronUp className="h-4 w-4 text-red-500" />{" "}
                                  <span className="text-sm text-red-500">
                                    Өсөж байна
                                  </span>
                                </>
                              )}
                              {monthlyStats.trend === "down" && (
                                <>
                                  <ChevronDown className="h-4 w-4 text-green-500" />{" "}
                                  <span className="text-sm text-green-500">
                                    Буурч байна
                                  </span>
                                </>
                              )}
                              {monthlyStats.trend === "stable" && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-blue-500" />{" "}
                                  <span className="text-sm text-blue-500">
                                    Тогтвортой
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-muted-foreground border rounded-lg">
                        Сүүлийн сард хэмжилт хийгдээгүй байна
                      </div>
                    )}
                  </div>

                  {/* Хэмжилтийн төрлөөр */}
                  {monthlyStats &&
                    Object.keys(monthlyStats.readingsByType).length > 0 && (
                      <div>
                        <div className="flex items-center mb-3">
                          <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
                          <h3 className="text-lg font-medium">Төрлөөр</h3>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Төрөл</TableHead>
                              <TableHead className="text-right">
                                Хэмжилт
                              </TableHead>
                              <TableHead className="text-right">
                                Дундаж
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(monthlyStats.readingsByType).map(
                              ([type, data]) => (
                                <TableRow key={type}>
                                  <TableCell>
                                    {getReadingTypeText(
                                      type as GlucoseReading["readingType"]
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {data.count}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {data.average} мг/дл
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Хэмжилтийн түүх */}
        <TabsContent value="history" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>Сахарын хэмжилтийн түүх</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Хайх..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Огноо</TableHead>
                      <TableHead>Хэмжээ</TableHead>
                      <TableHead>Төрөл</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingReadings ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Ачааллаж байна...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredReadings.length > 0 ? (
                      filteredReadings.map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell className="font-medium">
                            {formatDate(reading.timestamp)}
                          </TableCell>
                          <TableCell>{reading.value} мг/дл</TableCell>
                          <TableCell>
                            {getReadingTypeText(reading.readingType)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                reading.value
                              )}`}
                            >
                              {getStatusLabel(reading.value)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Хэмжилт олдсонгүй
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шинэ хэмжилт нэмэх */}
        <TabsContent value="add" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>Шинэ хэмжилт нэмэх</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="value" className="text-sm font-medium">
                    Сахарын хэмжээ (мг/дл)
                  </label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    min="20"
                    max="600"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="readingType" className="text-sm font-medium">
                    Хэмжилтийн төрөл
                  </label>
                  <select
                    id="readingType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={readingType}
                    onChange={(e) =>
                      setReadingType(
                        e.target.value as GlucoseReading["readingType"]
                      )
                    }
                  >
                    <option value="before_meal">Хооллохын өмнө</option>
                    <option value="after_meal">Хооллосноос хойш</option>
                    <option value="fasting">Өлөн үед</option>
                    <option value="bedtime">Унтахын өмнө</option>
                    <option value="random">Санамсаргүй</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Тэмдэглэл (заавал биш)
                  </label>
                  <Input
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full"
                    placeholder="Жишээ: идсэн хоол, дасгал хөдөлгөөн, эсвэл өөр сэтгэгдэл"
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Хадгалах
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

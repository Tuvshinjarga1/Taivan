"use client";

import { useState, useEffect } from "react";
import SmartwatchConnection from "@/components/smartwatch-connection";
import {
  getAllHealthDataAction,
  isGoogleFitAuthenticatedAction,
} from "@/app/actions/googlefit-actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ConnectGoogleFitButton from "@/components/connect-googlefit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interfaces for type safety
interface HealthData {
  steps: number;
  heartRate: number;
  sleep: number;
  calories: number;
  userId: string;
}

interface HealthAnalysis {
  stepGoalReached: boolean;
  caloriesLevel: "high" | "normal";
  sleepQuality: "good" | "average" | "poor";
  heartRateStatus: "elevated" | "normal" | "low";
}

// Interface for weekly and monthly data
interface PeriodData {
  steps: number[];
  heartRate: number[];
  sleep: number[];
  calories: number[];
  dates: string[];
}

export default function SmartwatchPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123"; // Placeholder user ID
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [weeklyData, setWeeklyData] = useState<PeriodData | null>(null);
  const [monthlyData, setMonthlyData] = useState<PeriodData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is authenticated with Google Fit and fetch data
  useEffect(() => {
    async function checkAuthentication() {
      setIsLoading(true);
      const authResult = await isGoogleFitAuthenticatedAction();
      setIsAuthenticated(!!authResult);

      if (authResult) {
        await fetchHealthData();
        await fetchWeeklyData();
        await fetchMonthlyData();
      }

      setIsLoading(false);
    }

    checkAuthentication();
  }, []);

  // Function to fetch health data from Google Fit
  async function fetchHealthData() {
    try {
      setIsAnalyzing(true);
      const result = await getAllHealthDataAction(userId);

      if (result.success && result.data) {
        setHealthData(result.data);

        // Show success toast
        toast({
          title: "Мэдээлэл амжилттай шинэчлэгдлээ",
          description: "Google Fit-ээс мэдээлэл амжилттай татагдлаа",
        });
      } else {
        toast({
          title: "Алдаа гарлаа",
          description: result.error || "Мэдээлэл татахад алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching health data:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Мэдээлэл татахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Function to fetch weekly data (7 days)
  async function fetchWeeklyData() {
    // For demo purposes, generate mock data
    // In a real app, you would call an API to get this data
    const mockWeeklyData: PeriodData = {
      steps: [8500, 9200, 10500, 7800, 9300, 11000, 8900],
      heartRate: [72, 75, 78, 70, 76, 80, 73],
      sleep: [6.5, 7, 7.5, 6, 6.8, 7.2, 6.7],
      calories: [1800, 1900, 2100, 1750, 1950, 2200, 1850],
      dates: generateLastDays(7).map((date) =>
        date.toLocaleDateString("mn-MN")
      ),
    };

    setWeeklyData(mockWeeklyData);
  }

  // Function to fetch monthly data
  async function fetchMonthlyData() {
    // For demo purposes, generate mock data
    // In a real app, you would call an API to get this data
    const mockMonthlyData: PeriodData = {
      steps: Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 4000) + 7000
      ),
      heartRate: Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 15) + 65
      ),
      sleep: Array.from({ length: 30 }, () => Math.random() * 2 + 6),
      calories: Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 600) + 1600
      ),
      dates: generateLastDays(30).map((date) =>
        date.toLocaleDateString("mn-MN")
      ),
    };

    setMonthlyData(mockMonthlyData);
  }

  // Helper function to generate dates for the last n days
  function generateLastDays(days: number): Date[] {
    const dates: Date[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }

  // Calculate period averages
  function calculateAverage(values: number[]): number {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  // Analyze data function
  function analyzeHealthData(): HealthAnalysis | null {
    if (!healthData) return null;

    const analysis: HealthAnalysis = {
      stepGoalReached: healthData.steps >= 10000,
      caloriesLevel: healthData.calories > 2000 ? "high" : "normal",
      sleepQuality:
        healthData.sleep >= 7
          ? "good"
          : healthData.sleep >= 6
          ? "average"
          : "poor",
      heartRateStatus:
        healthData.heartRate > 100
          ? "elevated"
          : healthData.heartRate < 60
          ? "low"
          : "normal",
    };

    return analysis;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Ачааллаж байна...
          </p>
        </div>
      </div>
    );
  }

  // Get analysis results if data exists
  const analysis = analyzeHealthData();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Хянах самбар руу буцах
          </Button>
        </div>

        {!isAuthenticated ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Google Fit-тэй холбогдох</CardTitle>
              <CardDescription>
                Ухаалаг цаг болон Google Fit мэдээллийг холбохын тулд эхлээд
                Google бүртгэлтэйгээ холбогдох шаардлагатай
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectGoogleFitButton fullWidth />
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="daily">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Өдөр</TabsTrigger>
                <TabsTrigger value="weekly">7 хоног</TabsTrigger>
                <TabsTrigger value="monthly">Сар</TabsTrigger>
              </TabsList>

              {/* Daily View */}
              <TabsContent value="daily">
                {healthData && (
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>
                            Эрүүл мэндийн мэдээллийн дүн шинжилгээ
                          </CardTitle>
                          <CardDescription>
                            Google Fit-ээс татсан хамгийн сүүлийн мэдээлэл
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchHealthData}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Шинэчилж байна...
                            </>
                          ) : (
                            "Шинэчлэх"
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Алхалт</h3>
                          <p className="text-3xl font-bold">
                            {healthData.steps.toLocaleString()}
                          </p>
                          {analysis && (
                            <p
                              className={`text-sm mt-1 ${
                                analysis.stepGoalReached
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {analysis.stepGoalReached
                                ? "Өдрийн зорилтод хүрсэн"
                                : "Зорилтод хүрээгүй (10,000 алхам)"}
                            </p>
                          )}
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">
                            Зүрхний цохилт
                          </h3>
                          <p className="text-3xl font-bold">
                            {healthData.heartRate} BPM
                          </p>
                          {analysis && (
                            <p
                              className={`text-sm mt-1 ${
                                analysis.heartRateStatus === "normal"
                                  ? "text-green-600"
                                  : analysis.heartRateStatus === "elevated"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {analysis.heartRateStatus === "normal"
                                ? "Хэвийн"
                                : analysis.heartRateStatus === "elevated"
                                ? "Өндөр"
                                : "Бага"}
                            </p>
                          )}
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Нойр</h3>
                          <p className="text-3xl font-bold">
                            {healthData.sleep} цаг
                          </p>
                          {analysis && (
                            <p
                              className={`text-sm mt-1 ${
                                analysis.sleepQuality === "good"
                                  ? "text-green-600"
                                  : analysis.sleepQuality === "average"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {analysis.sleepQuality === "good"
                                ? "Сайн"
                                : analysis.sleepQuality === "average"
                                ? "Дунд"
                                : "Муу"}
                            </p>
                          )}
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Калори</h3>
                          <p className="text-3xl font-bold">
                            {healthData.calories} ккал
                          </p>
                          {analysis && (
                            <p
                              className={`text-sm mt-1 ${
                                analysis.caloriesLevel === "normal"
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {analysis.caloriesLevel === "normal"
                                ? "Хэвийн"
                                : "Өндөр"}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Weekly View */}
              <TabsContent value="weekly">
                {weeklyData && (
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>
                            7 хоногийн мэдээллийн дүн шинжилгээ
                          </CardTitle>
                          <CardDescription>
                            Сүүлийн 7 хоногийн статистик
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchWeeklyData}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Шинэчилж байна...
                            </>
                          ) : (
                            "Шинэчлэх"
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Алхалт</h3>
                          <p className="text-3xl font-bold">
                            {Math.round(
                              calculateAverage(weeklyData.steps)
                            ).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Дундаж өдрийн алхалт
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              7 хоногийн хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-1">
                              {weeklyData.steps.map((step, index) => (
                                <div
                                  key={index}
                                  className="bg-primary/80 rounded-t w-full"
                                  style={{
                                    height: `${(step / 15000) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${weeklyData.dates[index]}: ${step} алхам`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{weeklyData.dates[0]}</span>
                              <span>
                                {weeklyData.dates[weeklyData.dates.length - 1]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">
                            Зүрхний цохилт
                          </h3>
                          <p className="text-3xl font-bold">
                            {Math.round(calculateAverage(weeklyData.heartRate))}{" "}
                            BPM
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Дундаж зүрхний цохилт
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              7 хоногийн хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-1">
                              {weeklyData.heartRate.map((rate, index) => (
                                <div
                                  key={index}
                                  className="bg-rose-500/80 rounded-t w-full"
                                  style={{
                                    height: `${(rate / 120) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${weeklyData.dates[index]}: ${rate} BPM`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{weeklyData.dates[0]}</span>
                              <span>
                                {weeklyData.dates[weeklyData.dates.length - 1]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Нойр</h3>
                          <p className="text-3xl font-bold">
                            {calculateAverage(weeklyData.sleep).toFixed(1)} цаг
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Дундаж нойрны хугацаа
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              7 хоногийн хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-1">
                              {weeklyData.sleep.map((sleep, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-500/80 rounded-t w-full"
                                  style={{
                                    height: `${(sleep / 10) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${weeklyData.dates[index]}: ${sleep} цаг`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{weeklyData.dates[0]}</span>
                              <span>
                                {weeklyData.dates[weeklyData.dates.length - 1]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Калори</h3>
                          <p className="text-3xl font-bold">
                            {Math.round(calculateAverage(weeklyData.calories))}{" "}
                            ккал
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Дундаж зарцуулсан калори
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              7 хоногийн хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-1">
                              {weeklyData.calories.map((calorie, index) => (
                                <div
                                  key={index}
                                  className="bg-orange-500/80 rounded-t w-full"
                                  style={{
                                    height: `${(calorie / 3000) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${weeklyData.dates[index]}: ${calorie} ккал`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{weeklyData.dates[0]}</span>
                              <span>
                                {weeklyData.dates[weeklyData.dates.length - 1]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Monthly View */}
              <TabsContent value="monthly">
                {monthlyData && (
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Сарын мэдээллийн дүн шинжилгээ</CardTitle>
                          <CardDescription>
                            Сүүлийн 30 хоногийн статистик
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchMonthlyData}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Шинэчилж байна...
                            </>
                          ) : (
                            "Шинэчлэх"
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Алхалт</h3>
                          <p className="text-3xl font-bold">
                            {Math.round(
                              calculateAverage(monthlyData.steps)
                            ).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Сарын дундаж өдрийн алхалт
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              Сарын хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-0.5">
                              {monthlyData.steps.map((step, index) => (
                                <div
                                  key={index}
                                  className="bg-primary/80 rounded-t w-full"
                                  style={{
                                    height: `${(step / 15000) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${monthlyData.dates[index]}: ${step} алхам`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{monthlyData.dates[0]}</span>
                              <span>
                                {
                                  monthlyData.dates[
                                    monthlyData.dates.length - 1
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">
                            Зүрхний цохилт
                          </h3>
                          <p className="text-3xl font-bold">
                            {Math.round(
                              calculateAverage(monthlyData.heartRate)
                            )}{" "}
                            BPM
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Сарын дундаж зүрхний цохилт
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              Сарын хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-0.5">
                              {monthlyData.heartRate.map((rate, index) => (
                                <div
                                  key={index}
                                  className="bg-rose-500/80 rounded-t w-full"
                                  style={{
                                    height: `${(rate / 120) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${monthlyData.dates[index]}: ${rate} BPM`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{monthlyData.dates[0]}</span>
                              <span>
                                {
                                  monthlyData.dates[
                                    monthlyData.dates.length - 1
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Нойр</h3>
                          <p className="text-3xl font-bold">
                            {calculateAverage(monthlyData.sleep).toFixed(1)} цаг
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Сарын дундаж нойрны хугацаа
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              Сарын хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-0.5">
                              {monthlyData.sleep.map((sleep, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-500/80 rounded-t w-full"
                                  style={{
                                    height: `${(sleep / 10) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${monthlyData.dates[index]}: ${sleep} цаг`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{monthlyData.dates[0]}</span>
                              <span>
                                {
                                  monthlyData.dates[
                                    monthlyData.dates.length - 1
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Калори</h3>
                          <p className="text-3xl font-bold">
                            {Math.round(calculateAverage(monthlyData.calories))}{" "}
                            ккал
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Сарын дундаж зарцуулсан калори
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              Сарын хандалт
                            </h4>
                            <div className="flex h-16 items-end gap-0.5">
                              {monthlyData.calories.map((calorie, index) => (
                                <div
                                  key={index}
                                  className="bg-orange-500/80 rounded-t w-full"
                                  style={{
                                    height: `${(calorie / 3000) * 100}%`,
                                    minHeight: "4px",
                                  }}
                                  title={`${monthlyData.dates[index]}: ${calorie} ккал`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{monthlyData.dates[0]}</span>
                              <span>
                                {
                                  monthlyData.dates[
                                    monthlyData.dates.length - 1
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  );
}

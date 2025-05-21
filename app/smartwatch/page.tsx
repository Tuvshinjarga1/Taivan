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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, RefreshCw, Link2Off } from "lucide-react";
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
  const [tokenStatus, setTokenStatus] = useState<
    "valid" | "expired" | "unknown"
  >("unknown");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is authenticated with Google Fit and fetch data
  useEffect(() => {
    async function checkAuthentication() {
      setIsLoading(true);
      try {
        const authResult = await isGoogleFitAuthenticatedAction();
        setIsAuthenticated(!!authResult);

        // Check if token is valid or expired
        if (authResult) {
          setTokenStatus("valid");
          await fetchHealthData();
          await fetchWeeklyData();
          await fetchMonthlyData();
        } else {
          // If not authenticated, token might have expired
          setTokenStatus("expired");
        }
      } catch (error) {
        console.error("Баталгаажуулалт шалгахад алдаа гарлаа:", error);
        setTokenStatus("expired");
        setIsAuthenticated(false);

        toast({
          title: "Холболтын алдаа",
          description:
            "Google Fit-тэй холболт дууссан байж магадгүй. Дахин холбогдоно уу.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthentication();
  }, []);

  // Function to handle reconnection
  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      toast({
        title: "Дахин холбогдож байна",
        description: "Google Fit-тэй холболтыг шинэчилж байна...",
      });

      // Will be handled by ConnectGoogleFitButton component
      setTokenStatus("unknown");
    } catch (error) {
      console.error("Дахин холбоход алдаа гарлаа:", error);
      toast({
        title: "Холболт амжилтгүй",
        description: "Google Fit-тэй дахин холбогдоход алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  // Function to handle disconnection
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      // Call API to revoke token (this would need to be implemented in a real application)
      // For demo purposes, just simulating a disconnect

      // Notify the user
      toast({
        title: "Холболт салгагдлаа",
        description: "Google Fit-тэй холболт амжилттай салгагдлаа",
      });

      // Reset authentication status
      setIsAuthenticated(false);
      setTokenStatus("expired");
      setHealthData(null);
      setWeeklyData(null);
      setMonthlyData(null);
    } catch (error) {
      console.error("Холболт салгахад алдаа гарлаа:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Google Fit-тэй холболт салгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };

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
      <div className="mx-auto px-2 sm:px-4 max-w-full sm:max-w-screen-lg">
        <div className="flex items-center py-3 mb-2 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Буцах
          </Button>
        </div>

        {/* Token expiration warning */}
        {tokenStatus === "expired" && (
          <Card className="mb-4 sm:mb-6 border-yellow-300 bg-yellow-50">
            <CardHeader className="pb-2 px-3 py-3 sm:px-4 sm:py-4">
              <CardTitle className="text-yellow-800 text-base sm:text-lg">
                Холболт дууссан байна
              </CardTitle>
              <CardDescription className="text-yellow-700 text-xs sm:text-sm">
                Google Fit-тэй холболт дууссан тул мэдээлэл авах боломжгүй байна
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-yellow-700">
                Төхөөрөмжийн мэдээлэл авахын тулд дахин холболт хийх
                шаардлагатай. Аюулгүй байдлын үүднээс Google Fit-ийн холболт нь
                тодорхой хугацааны дараа автоматаар дуусдаг.
              </p>
              <Button
                className="w-full text-sm bg-yellow-600 hover:bg-yellow-700"
                disabled={isReconnecting}
                onClick={handleReconnect}
              >
                {isReconnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Холбогдож байна...
                  </>
                ) : (
                  "Дахин холбогдох"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {!isAuthenticated ? (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg">
                Google Fit-тэй холбогдох
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ухаалаг цаг болон Google Fit мэдээллийг холбохын тулд эхлээд
                Google бүртгэлтэйгээ холбогдох шаардлагатай
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
              <ConnectGoogleFitButton fullWidth />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Connection status indicator */}
            <div className="flex flex-wrap items-center mb-4 gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs sm:text-sm text-green-700 font-medium">
                  Google Fit-тэй амжилттай холбогдсон
                </span>
              </div>
              <div className="flex w-full sm:w-auto sm:ml-auto gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReconnect}
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-green-700 border-green-200 hover:bg-green-100"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Дахин холбогдох
                </Button>

                <AlertDialog
                  open={showDisconnectDialog}
                  onOpenChange={setShowDisconnectDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none text-xs sm:text-sm text-red-700 border-red-200 hover:bg-red-100"
                      disabled={isDisconnecting}
                    >
                      <Link2Off className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {isDisconnecting ? "Салгаж байна..." : "Холболт салгах"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Холболт салгах уу?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        Google Fit-тэй холболтыг салгаснаар та одоогийн
                        мэдээллээ харах боломжгүй болно. Дараа нь дахин
                        холбогдож болно.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel className="text-xs sm:text-sm h-9">
                        Цуцлах
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm h-9"
                        onClick={handleDisconnect}
                      >
                        Салгах
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="mb-3 sm:mb-4 w-full grid grid-cols-3">
                <TabsTrigger
                  value="daily"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  Өдөр
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  7 хоног
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  Сар
                </TabsTrigger>
              </TabsList>

              {/* Daily View */}
              <TabsContent value="daily">
                {healthData && (
                  <Card className="mb-4 sm:mb-6">
                    <CardHeader className="pb-2 px-3 py-3 sm:px-6 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <CardTitle className="text-base sm:text-lg">
                            Эрүүл мэндийн мэдээллийн дүн шинжилгээ
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Google Fit-ээс татсан хамгийн сүүлийн мэдээлэл
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchHealthData}
                          disabled={isAnalyzing}
                          className="self-start sm:self-auto text-xs sm:text-sm whitespace-nowrap"
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              Шинэчилж байна...
                            </>
                          ) : (
                            "Шинэчлэх"
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 border rounded-lg">
                          <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                            Алхалт
                          </h3>
                          <p className="text-xl sm:text-3xl font-bold">
                            {healthData.steps.toLocaleString()}
                          </p>
                          {analysis && (
                            <p
                              className={`text-xs sm:text-sm mt-1 ${
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

                        <div className="p-3 sm:p-4 border rounded-lg">
                          <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                            Зүрхний цохилт
                          </h3>
                          <p className="text-xl sm:text-3xl font-bold">
                            {healthData.heartRate} BPM
                          </p>
                          {analysis && (
                            <p
                              className={`text-xs sm:text-sm mt-1 ${
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

                        <div className="p-3 sm:p-4 border rounded-lg">
                          <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                            Нойр
                          </h3>
                          <p className="text-xl sm:text-3xl font-bold">
                            {healthData.sleep} цаг
                          </p>
                          {analysis && (
                            <p
                              className={`text-xs sm:text-sm mt-1 ${
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

                        <div className="p-3 sm:p-4 border rounded-lg">
                          <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                            Калори
                          </h3>
                          <p className="text-xl sm:text-3xl font-bold">
                            {healthData.calories} ккал
                          </p>
                          {analysis && (
                            <p
                              className={`text-xs sm:text-sm mt-1 ${
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

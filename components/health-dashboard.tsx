"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Heart,
  Moon,
  Footprints,
  LineChart,
  BarChart3,
  Settings,
  Sparkles,
  PlusCircle,
  Utensils,
  Watch,
  AlertTriangle,
  Info,
  Droplet,
} from "lucide-react";
import HeartRateCard from "./cards/heart-rate-card";
import StepsCard from "./cards/steps-card";
import SleepCard from "./cards/sleep-card";
import ActivityCard from "./cards/activity-card";
import HealthSummary from "./health-summary";
import MobileHeader from "./mobile-header";
import HealthInsights from "./health-insights";
import AddHealthData from "./add-health-data";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveHealthData } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Туршилтын сахарын өгөгдөл
const staticGlucoseData = [
  {
    id: "g1",
    value: 110,
    timestamp: "2023-04-20T07:28:00Z",
    type: "Хооллохын өмнө",
  },
  {
    id: "g2",
    value: 135,
    timestamp: "2023-04-20T06:30:00Z",
    type: "Хооллосноос хойш",
  },
  {
    id: "g3",
    value: 105,
    timestamp: "2023-04-20T05:45:00Z",
    type: "Хооллохын өмнө",
  },
];

interface HealthDashboardProps {
  healthData: {
    heartRate: number;
    steps: number;
    sleep: number;
    calories: number;
  };
  userId: string;
}

export default function HealthDashboard({
  healthData,
  userId,
}: HealthDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const { toast } = useToast();

  // Туршилтын тохиргоо - чихрийн шижингийн функцуудыг идэвхжүүлэх
  const isDiabetic = true;

  // Хамгийн сүүлийн сахарын хэмжилт (туршилтын өгөгдөл)
  const latestGlucoseReading = staticGlucoseData[0];

  // Өгөгдлийг Firebase-д хадгалах (Хэрэглэгч тус бүрийн хандалтыг хянах)
  // useEffect(() => {
  //   const saveUserActivity = async () => {
  //     try {
  //       // Хэрэглэгчийн хандалтын өгөгдлийг хадгалах
  //       await saveHealthData(userId, {
  //         viewTimestamp: new Date().toISOString(),
  //         healthMetrics: healthData,
  //         activeTab: "overview",
  //         latestGlucoseReading,
  //         deviceInfo: {
  //           userAgent: window.navigator.userAgent,
  //           language: window.navigator.language,
  //           platform: window.navigator.platform,
  //         },
  //       });
  //     } catch (error) {
  //       console.error("Хэрэглэгчийн идэвхийг хадгалахад алдаа гарлаа:", error);
  //     }
  //   };

  //   // Хуудас руу орох бүрт ажиллана
  //   saveUserActivity();
  // }, [userId, healthData, latestGlucoseReading]);

  // Таб сонгох бүрт гүйцэтгэх
  const handleTabChange = async (value: string) => {
    setActiveTab(value);

    try {
      // Таб сонгосон үйлдлийг хадгалах
      await saveHealthData(userId, {
        eventType: "tabChange",
        tabValue: value,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Таб өөрчлөх үйлдлийг хадгалахад алдаа гарлаа:", error);
    }
  };

  const handleNavigation = async (path: string) => {
    try {
      // Хуудас шилжилтийн үйлдлийг хадгалах
      await saveHealthData(userId, {
        eventType: "navigation",
        destination: path,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Хуудас шилжих үйлдлийг хадгалахад алдаа гарлаа:", error);
    }

    router.push(path);
  };

  // Сахарын хэмжилтийн статусыг тодорхойлох
  const getGlucoseStatus = (value: number) => {
    if (value < 70)
      return {
        status: "low",
        label: "Бага",
        color: "text-blue-500 bg-blue-100",
      };
    if (value <= 140)
      return {
        status: "normal",
        label: "Хэвийн",
        color: "text-green-500 bg-green-100",
      };
    if (value <= 180)
      return {
        status: "elevated",
        label: "Өндөр",
        color: "text-yellow-500 bg-yellow-100",
      };
    return {
      status: "high",
      label: "Маш өндөр",
      color: "text-red-500 bg-red-100",
    };
  };

  // Чихрийн шижингийн үнэлгээ хийх үйлдэл
  const handleDiabetesAssessment = async () => {
    try {
      // Үнэлгээ хийх үйлдлийг хадгалах
      await saveHealthData(userId, {
        eventType: "diabetesAssessmentRequested",
        timestamp: new Date().toISOString(),
        glucoseLevel: latestGlucoseReading?.value,
      });

      // Нэмэлт мэдээлэл харуулах
      toast({
        title: "Чихрийн шижингийн үнэлгээ",
        description: "Үнэлгээний хуудас руу шилжиж байна",
      });

      // Үнэлгээний хуудас руу шилжих
      handleNavigation("/diabetes-assessment");
    } catch (error) {
      console.error("Чихрийн шижингийн үнэлгээ хийхэд алдаа гарлаа:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Үйлдлийг гүйцэтгэх үед алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MobileHeader />
      <div className="flex-1 pb-20">
        <div className="mb-4 sm:mb-6 px-3 sm:px-4 pt-2 sm:pt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
            Эрүүл мэндийн мэдээлэл
          </h1>
          <p className="text-sm text-gray-500">Таны биеийн байдлын мэдээлэл</p>
        </div>

        <div className="px-3 sm:px-4">
          <HealthSummary healthData={healthData} />

          {/* Сахарын хэмжилтийн товч мэдээлэл */}
          {latestGlucoseReading && (
            <Card className="bg-white mt-3 sm:mt-5 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden border-0">
              <CardContent className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center">
                    <div className="bg-teal-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                      <Droplet className="h-4 w-4 sm:h-6 sm:w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                        Цусны сахар
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <p className="text-xl sm:text-2xl font-bold">
                          {latestGlucoseReading.value}
                        </p>
                        <span className="text-xs sm:text-sm text-gray-500">
                          мг/дл
                        </span>
                        <Badge
                          variant="outline"
                          className={`${
                            getGlucoseStatus(latestGlucoseReading.value).color
                          } px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium`}
                        >
                          {getGlucoseStatus(latestGlucoseReading.value).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex justify-between sm:block">
                    <p className="text-xs sm:text-sm text-gray-500 mb-0 sm:mb-1">
                      07:28
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      onClick={() => handleNavigation("/glucose-tracker")}
                    >
                      Дэлгэрэнгүй
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs
            defaultValue="overview"
            className="mt-4 sm:mt-6"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-1 h-auto bg-white shadow-sm rounded-xl mb-3 sm:mb-4">
              <TabsTrigger
                value="insights"
                className="flex items-center gap-1.5 sm:gap-2 py-2 sm:py-3 px-3 sm:px-4 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">
                  Хиймэл оюун ухаанаар дүгнэлт гаргах
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className="mt-3 sm:mt-4 space-y-3 sm:space-y-5"
            >
              <div className="grid grid-cols-1 gap-3 sm:gap-5">
                {/* Чихрийн шижингийн үнэлгээний карт */}
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden border-0">
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                          <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                            Чихрийн шижингийн эрсдэлийн үнэлгээ
                          </h3>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={handleDiabetesAssessment}
                      >
                        Үнэлгээ хийх
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Чихрийн шижингийн мэдээллийн карт */}
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden border-0">
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                          <Info className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                            Чихрийн шижингийн мэдээлэл
                          </h3>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={() =>
                          handleNavigation("/diabetes-information")
                        }
                      >
                        Харах
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="heart" className="mt-4">
              <HeartRateCard heartRate={healthData.heartRate} detailed />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ActivityCard calories={healthData.calories} detailed />
            </TabsContent>

            <TabsContent value="steps" className="mt-4">
              <StepsCard steps={healthData.steps} detailed />
            </TabsContent>

            <TabsContent value="sleep" className="mt-4">
              <SleepCard sleep={healthData.sleep} detailed />
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <HealthInsights healthData={healthData} />
            </TabsContent>

            <TabsContent value="add" className="mt-4">
              <AddHealthData userId={userId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around items-center p-2 sm:p-3">
        <button
          className="flex flex-col items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => handleNavigation("/dashboard")}
        >
          <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
            Хянах самбар
          </span>
        </button>
        <button
          className="flex flex-col items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => handleNavigation("/smartwatch")}
        >
          <Watch className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
            Ухаалаг цаг
          </span>
        </button>
        <button
          className="flex flex-col items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => handleNavigation("/food-analyzer")}
        >
          <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
            Хоол
          </span>
        </button>
        <button
          className="flex flex-col items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => handleNavigation("/glucose-tracker")}
        >
          <Droplet className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
            Сахар
          </span>
        </button>
        <button
          className="flex flex-col items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => handleNavigation("/settings")}
        >
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
            Тохиргоо
          </span>
        </button>
      </div>
    </div>
  );
}

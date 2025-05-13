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

// Static glucose data for demo
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

  // Demo flag - always enable diabetic features for demo
  const isDiabetic = true;

  // Latest glucose reading (static data)
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
  //       console.error("Error saving user activity data:", error);
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
      console.error("Error saving tab change event:", error);
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
      console.error("Error saving navigation event:", error);
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
      console.error("Error handling diabetes assessment:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Үйлдлийг гүйцэтгэх үед алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader />
      <div className="flex-1 p-4 pb-16">
        <HealthSummary healthData={healthData} />

        {/* Сахарын хэмжилтийн товч мэдээлэл */}
        {latestGlucoseReading && (
          <Card className="bg-white mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-teal-100 p-2 rounded-full mr-4">
                    <Droplet className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Цусны сахар</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {latestGlucoseReading.value}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        мг/дл
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          getGlucoseStatus(latestGlucoseReading.value).color
                        }
                      >
                        {getGlucoseStatus(latestGlucoseReading.value).label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">07:28</p>
                  <Button
                    variant="ghost"
                    size="sm"
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
          className="mt-6"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid grid-cols-7 h-auto">
            {/* <TabsTrigger
              value="overview"
              className="flex flex-col items-center py-2 px-1"
            >
              <LineChart className="h-5 w-5 mb-1" />
              <span className="text-xs">Ерөнхий</span>
            </TabsTrigger>
            <TabsTrigger
              value="heart"
              className="flex flex-col items-center py-2 px-1"
            >
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs">Зүрх</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex flex-col items-center py-2 px-1"
            >
              <Activity className="h-5 w-5 mb-1" />
              <span className="text-xs">Идэвх</span>
            </TabsTrigger>
            <TabsTrigger
              value="steps"
              className="flex flex-col items-center py-2 px-1"
            >
              <Footprints className="h-5 w-5 mb-1" />
              <span className="text-xs">Алхалт</span>
            </TabsTrigger>
            <TabsTrigger
              value="sleep"
              className="flex flex-col items-center py-2 px-1"
            >
              <Moon className="h-5 w-5 mb-1" />
              <span className="text-xs">Нойр</span>
            </TabsTrigger> */}
            <TabsTrigger
              value="insights"
              className="flex flex-col items-center py-2 px-1"
            >
              <Sparkles className="h-5 w-5 mb-1" />
              <span className="text-xs">AI</span>
            </TabsTrigger>
            {/* <TabsTrigger
              value="add"
              className="flex flex-col items-center py-2 px-1"
            >
              <PlusCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">Нэмэх</span>
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 gap-4">
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <HeartRateCard heartRate={healthData.heartRate} />
                <StepsCard steps={healthData.steps} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SleepCard sleep={healthData.sleep} />
                <ActivityCard calories={healthData.calories} />
              </div> */}

              {/* Add Diabetes Assessment Card */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Чихрийн шижингийн эрсдэлийн үнэлгээ
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Чихрийн шижин үүсэх эрсдэлээ шалгах
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={handleDiabetesAssessment}>
                      Үнэлгээ хийх
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Add Glucose Tracker Card */}
              {/* <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <Droplet className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Сахарын мэдээлэл</h3>
                        <p className="text-sm text-muted-foreground">
                          Сахарын хэмжилт хянах, тэмдэглэх
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleNavigation("/glucose-tracker")}
                    >
                      Хянах
                    </Button>
                  </div>
                </CardContent>
              </Card> */}

              {/* Add Food Analyzer Card */}
              {/* <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Utensils className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Хоолны шинжилгээ</h3>
                        <p className="text-sm text-muted-foreground">
                          Хоолны найрлага, нүүрс ус хянах
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleNavigation("/food-analyzer")}
                    >
                      Шинжлэх
                    </Button>
                  </div>
                </CardContent>
              </Card> */}

              {/* <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Watch className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Ухаалаг цаг холбох</h3>
                        <p className="text-sm text-muted-foreground">
                          Зүүдэг төхөөрөмжөө холбож, синхрончлох
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleNavigation("/smartwatch")}
                    >
                      Төхөөрөмж холбох
                    </Button>
                  </div>
                </CardContent>
              </Card> */}

              {/* Add Diabetes Information Card */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Info className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Чихрийн шижингийн мэдээлэл
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Мэдээлэл, зөвлөгөө, сануулга
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleNavigation("/diabetes-information")}
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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2">
        <button
          className="flex flex-col items-center p-2"
          onClick={() => handleNavigation("/dashboard")}
        >
          <LineChart className="h-5 w-5" />
          <span className="text-xs mt-1">Хянах самбар</span>
        </button>
        <button
          className="flex flex-col items-center p-2"
          onClick={() => handleNavigation("/smartwatch")}
        >
          <Watch className="h-5 w-5" />
          <span className="text-xs mt-1">Ухаалаг цаг</span>
        </button>
        <button
          className="flex flex-col items-center p-2"
          onClick={() => handleNavigation("/food-analyzer")}
        >
          <Utensils className="h-5 w-5" />
          <span className="text-xs mt-1">Хоол</span>
        </button>
        <button
          className="flex flex-col items-center p-2"
          onClick={() => handleNavigation("/glucose-tracker")}
        >
          <Droplet className="h-5 w-5" />
          <span className="text-xs mt-1">Сахар</span>
        </button>
        <button
          className="flex flex-col items-center p-2"
          onClick={() => handleNavigation("/settings")}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Тохиргоо</span>
        </button>
      </div>
    </div>
  );
}

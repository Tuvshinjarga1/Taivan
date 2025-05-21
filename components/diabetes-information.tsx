"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Info,
  Bell,
  Apple,
  AlertTriangle,
  Droplet,
  PlusCircle,
  Clock,
  Calendar,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  saveReminder,
  getUserReminders,
  type DiabetesReminder,
  type DiabetesReminderType,
} from "@/lib/diabetes-service";
import {
  getGlucoseReadings,
  type GlucoseReading,
} from "@/lib/diabetes-service";

interface DiabetesInformationProps {
  userId: string;
}

export default function DiabetesInformation({
  userId,
}: DiabetesInformationProps) {
  const [activeTab, setActiveTab] = useState("about");
  const [reminderSettings, setReminderSettings] = useState({
    medicationReminders: true,
    glucoseCheckReminders: true,
    appointmentReminders: true,
    dietaryReminders: false,
    exerciseReminders: true,
  });
  const [reminders, setReminders] = useState<DiabetesReminder[]>([]);
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reminderType, setReminderType] =
    useState<DiabetesReminderType>("medication");
  const { toast } = useToast();
  const router = useRouter();

  // Сануулгууд болон сахарын хэмжилтүүдийг ачаалах
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Сануулгуудыг ачаалах
        const remindersResult = await getUserReminders(userId);
        if (remindersResult.success && remindersResult.data) {
          setReminders(remindersResult.data || []);
        }

        // Сахарын хэмжилтүүдийг ачаалах
        const glucoseResult = await getGlucoseReadings(userId, 14);
        if (glucoseResult.success && glucoseResult.data) {
          setGlucoseReadings(glucoseResult.data || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const updateReminderSetting = (
    key: keyof typeof reminderSettings,
    value: boolean
  ) => {
    setReminderSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    toast({
      title: "Тохиргоо шинэчлэгдлээ",
      description: "Таны сануулгын тохиргоо амжилттай хадгалагдлаа.",
    });
  };

  const handleAddReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("reminder-name") as string;
      const time = formData.get("reminder-time") as string;
      const frequency = formData.get("reminder-frequency") as
        | "once"
        | "daily"
        | "weekdays"
        | "weekends"
        | "weekly"
        | "monthly";
      const notes = formData.get("reminder-notes") as string;

      // Дараагийн огноог тооцоолох
      const nextOccurrence = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      nextOccurrence.setHours(hours, minutes, 0, 0);

      // Хэрэв өнөөдрийн цаг өнгөрсөн бол маргааш болгох
      if (nextOccurrence < new Date()) {
        nextOccurrence.setDate(nextOccurrence.getDate() + 1);
      }

      const newReminder: Omit<DiabetesReminder, "id"> = {
        userId,
        type: reminderType,
        name,
        time,
        frequency,
        notes,
        isActive: true,
        nextOccurrence,
      };

      const result = await saveReminder(newReminder);

      if (result.success) {
        toast({
          title: "Сануулга нэмэгдлээ",
          description: "Таны шинэ сануулга амжилттай нэмэгдлээ.",
        });

        // Сануулгуудыг дахин ачаалах
        const remindersResult = await getUserReminders(userId);
        if (remindersResult.success && remindersResult.data) {
          // Use empty array as fallback if data is undefined
          setReminders(remindersResult.data || []);
        }

        // Формыг цэвэрлэх
        e.currentTarget.reset();
      } else {
        toast({
          title: "Алдаа гарлаа",
          description:
            result.error || "Сануулга нэмэхэд алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Сануулга нэмэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Сахарын хэмжилтийн дундаж утгыг тооцоолох
  const calculateAverageGlucose = () => {
    if (glucoseReadings.length === 0) return 0;
    const sum = glucoseReadings.reduce(
      (acc, reading) => acc + reading.value,
      0
    );
    return Math.round(sum / glucoseReadings.length);
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

  // Сүүлийн сахарын хэмжилт
  const getLatestGlucoseReading = () => {
    if (glucoseReadings.length === 0) return null;
    return glucoseReadings[0];
  };

  const latestReading = getLatestGlucoseReading();
  const averageGlucose = calculateAverageGlucose();

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-xs sm:text-sm"
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Хянах самбар руу буцах
        </Button>
        <h1 className="text-lg sm:text-xl font-bold">Чихрийн шижин</h1>
      </div>

      {/* Сахарын хэмжилтийн товч мэдээлэл */}
      {latestReading && (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full">
                  <Droplet className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">
                    Сахарын түвшин
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="text-xl sm:text-2xl font-bold">
                      {latestReading.value}
                    </p>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      мг/дл
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        getGlucoseStatus(latestReading.value).color
                      }`}
                    >
                      {getGlucoseStatus(latestReading.value).label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right mt-1 sm:mt-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(latestReading.timestamp).toLocaleString("mn-MN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs sm:text-sm">
                  Дундаж:{" "}
                  <span className="font-medium">{averageGlucose} мг/дл</span>
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-1.5 py-1 sm:px-3 sm:py-2 h-auto flex items-center justify-center gap-1"
                onClick={() => router.push("/diabetes-assessment")}
              >
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Эрсдэлийн</span> Үнэлгээ
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-1.5 py-1 sm:px-3 sm:py-2 h-auto flex items-center justify-center gap-1"
                onClick={() => setActiveTab("reminders")}
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                Сануулга
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs px-1.5 py-1 sm:px-3 sm:py-2 h-auto flex items-center justify-center gap-1"
                onClick={() => router.push("/glucose-tracker")}
              >
                <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Шинэ</span> Хэмжилт
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 gap-0.5 sm:gap-2 mb-4 w-full">
          <TabsTrigger
            value="about"
            className="flex flex-col items-center py-1.5 sm:py-2 text-xs"
          >
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs">Мэдээлэл</span>
          </TabsTrigger>
          <TabsTrigger
            value="prevention"
            className="flex flex-col items-center py-1.5 sm:py-2 text-xs"
          >
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs">Сэргийлэлт</span>
          </TabsTrigger>
          <TabsTrigger
            value="diet"
            className="flex flex-col items-center py-1.5 sm:py-2 text-xs"
          >
            <Apple className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs">Хооллолт</span>
          </TabsTrigger>
          <TabsTrigger
            value="reminders"
            className="flex flex-col items-center py-1.5 sm:py-2 text-xs"
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs">Сануулга</span>
          </TabsTrigger>
        </TabsList>

        {/* Чихрийн шижин гэж юу вэ? */}
        <TabsContent value="about" className="space-y-4 mt-2 sm:mt-4">
          <Card>
            <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg">
                Чихрийн шижин гэж юу вэ?
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Чихрийн шижингийн талаарх үндсэн мэдээлэл
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">
                  Чихрийн шижингийн тодорхойлолт
                </h3>
                <p className="text-xs sm:text-sm">
                  Чихрийн шижин бол бие махбодь хангалттай хэмжээний инсулин
                  үйлдвэрлэж чадахгүй эсвэл үйлдвэрлэсэн инсулинээ үр дүнтэй
                  ашиглаж чадахгүй үед үүсдэг архаг өвчин юм. Инсулин нь нойр
                  булчирхайгаас ялгардаг даавар бөгөөд цусан дахь сахарыг
                  эсүүдэд нэвтрүүлж, эрчим хүч болгон хувиргахад тусалдаг.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">
                  Чихрийн шижингийн төрлүүд
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="type1">
                    <AccordionTrigger className="text-xs sm:text-sm py-2">
                      1-р хэлбэрийн чихрийн шижин
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm">
                      <p>
                        1-р хэлбэрийн чихрийн шижин нь аутоиммуны эмгэг бөгөөд
                        биеийн дархлааны систем нойр булчирхайн инсулин
                        үйлдвэрлэдэг эсүүдийг алдагдуулдаг. Энэ төрлийн чихрийн
                        шижинтэй хүмүүс амьдралынхаа туршид инсулин хэрэглэх
                        шаардлагатай. Энэ нь ихэвчлэн хүүхэд, өсвөр насныханд
                        илэрдэг боловч насанд хүрэгчдэд ч тохиолдож болно.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="type2">
                    <AccordionTrigger className="text-xs sm:text-sm py-2">
                      2-р хэлбэрийн чихрийн шижин
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm">
                      <p>
                        2-р хэлбэрийн чихрийн шижин нь хамгийн түгээмэл хэлбэр
                        бөгөөд бие махбодь инсулинд тэсвэртэй болох эсвэл
                        хангалттай инсулин үйлдвэрлэж чадахгүй болох үед үүсдэг.
                        Энэ нь ихэвчлэн насанд хүрэгчдэд тохиолддог боловч
                        хүүхдүүдэд ч илэрч болно. Таргалалт, идэвхгүй амьдралын
                        хэв маяг, удамшил зэрэг нь эрсдэлийг нэмэгдүүлдэг.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="gestational">
                    <AccordionTrigger className="text-xs sm:text-sm py-2">
                      Жирэмсний чихрийн шижин
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm">
                      <p>
                        Жирэмсний чихрийн шижин нь жирэмсэн үед үүсдэг бөгөөд
                        ихэнх тохиолдолд хүүхэд төрсний дараа арилдаг. Гэсэн
                        хэдий ч энэ нь эхийг ирээдүйд 2-р хэлбэрийн чихрийн
                        шижин үүсэх эрсдэлд оруулдаг.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="prediabetes">
                    <AccordionTrigger className="text-xs sm:text-sm py-2">
                      Урьдал чихрийн шижин
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm">
                      <p>
                        Урьдал чихрийн шижин гэдэг нь цусан дахь сахарын хэмжээ
                        хэвийн хэмжээнээс өндөр боловч 2-р хэлбэрийн чихрийн
                        шижин гэж оношлогдохоор хангалттай өндөр биш байх үеийг
                        хэлнэ. Энэ нь 2-р хэлбэрийн чихрийн шижин үүсэх
                        эрсдэлийг нэмэгдүүлдэг боловч амьдралын хэв маягийн
                        өөрчлөлтөөр урьдчилан сэргийлэх боломжтой.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">
                  Шинж тэмдгүүд
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">
                      Ерөнхий шинж тэмдгүүд
                    </h4>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                      <li>Их цангах</li>
                      <li>Ойр ойрхон шээх</li>
                      <li>Тайлбарлашгүй жин алдалт</li>
                      <li>Үргэлж ядарч сульдах</li>
                      <li>Бүрэлзэн харах</li>
                      <li>Удаан эдгэрэх шарх</li>
                      <li>Халдварт өртөмтгий болох</li>
                    </ul>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">
                      1-р хэлбэрийн онцлог шинжүүд
                    </h4>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                      <li>Гэнэтийн шинж тэмдэг</li>
                      <li>Кетоацидоз (амьсгал муудах)</li>
                      <li>Хурдан жин алдалт</li>
                    </ul>
                    <h4 className="font-medium text-sm sm:text-base mt-3 sm:mt-4 mb-1 sm:mb-2">
                      2-р хэлбэрийн онцлог шинжүүд
                    </h4>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                      <li>Аажим үүсэх шинж тэмдэг</li>
                      <li>Арьс хар болох (acanthosis nigricans)</li>
                      <li>Мэдрэлийн гэмтэл (хөл бадайрах)</li>
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">
                  Оношилгоо
                </h3>
                <p className="text-xs sm:text-sm">
                  Чихрийн шижинг дараах шинжилгээнүүдээр оношилдог:
                </p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                  <li>
                    <span className="font-medium">
                      Өлөн үеийн цусан дахь сахарын шинжилгээ (FPG):
                    </span>{" "}
                    126 мг/дл (7.0 ммоль/л) эсвэл түүнээс дээш
                  </li>
                  <li>
                    <span className="font-medium">
                      Глюкозын ачаалалтай шинжилгээ (OGTT):
                    </span>{" "}
                    2 цагийн дараах үзүүлэлт 200 мг/дл (11.1 ммоль/л) эсвэл
                    түүнээс дээш
                  </li>
                  <li>
                    <span className="font-medium">HbA1c шинжилгээ:</span> 6.5%
                    эсвэл түүнээс дээш
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Урьдчилан сэргийлэлт */}
        <TabsContent value="prevention" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Урьдчилан сэргийлэлт</CardTitle>
              <CardDescription>
                Чихрийн шижингээс урьдчилан сэргийлэх аргууд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  2-р хэлбэрийн чихрийн шижингээс урьдчилан сэргийлэх
                </h3>
                <p>
                  2-р хэлбэрийн чихрийн шижингээс урьдчилан сэргийлэх эсвэл
                  хойшлуулах боломжтой. Дараах арга хэмжээг авснаар эрсдэлийг
                  бууруулж болно:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium">Эрүүл хооллолт</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Жимс, хүнсний ногоо ихээр хэрэглэх</li>
                    <li>Бүхэл үр тариа сонгох</li>
                    <li>Өөх тос багатай уураг хэрэглэх</li>
                    <li>Сахар, цагаан гурил, боловсруулсан хүнс хязгаарлах</li>
                    <li>Хоолны хэмжээг хянах</li>
                  </ul>
                  <div className="mt-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-green-600"
                      onClick={() => {
                        setActiveTab("diet");
                      }}
                    >
                      Хооллолтын зөвлөмж харах →
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium">Идэвхтэй амьдралын хэв маяг</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Долоо хоногт 150 минутаас доошгүй дасгал хийх</li>
                    <li>Өдөр бүр 30 минут алхах</li>
                    <li>Суугаа байдлыг багасгах</li>
                    <li>Хүч, уян хатан чанарын дасгал хийх</li>
                    <li>Өдөр тутмын үйл ажиллагаандаа идэвхтэй байх</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <svg
                        className="h-5 w-5 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium">Эрүүл жин барих</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Биеийн жингийн индексээ (BMI) хэвийн хэмжээнд барих</li>
                    <li>Хэрэв илүүдэл жинтэй бол 5-10% жин хасах</li>
                    <li>Жингээ аажмаар, тогтвортой бууруулах</li>
                    <li>Хоолны дэглэм, дасгал хослуулах</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <svg
                        className="h-5 w-5 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium">Муу зуршил хаях</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Тамхи татахаа болих</li>
                    <li>Архи хэрэглээг хязгаарлах</li>
                    <li>Стрессээ зохицуулах</li>
                    <li>Хангалттай унтаж амрах</li>
                  </ul>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Эрсдэлт бүлгийнхэнд зориулсан зөвлөмж
                </h3>
                <p>
                  Дараах хүчин зүйлс танд байгаа бол чихрийн шижин үүсэх эрсдэл
                  өндөр байж болно:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Гэр бүлийн түүхэнд чихрийн шижин байгаа</li>
                  <li>45-аас дээш настай</li>
                  <li>Илүүдэл жинтэй эсвэл таргалалттай</li>
                  <li>Идэвхгүй амьдралын хэв маягтай</li>
                  <li>Өндөр цусны даралттай</li>
                  <li>Холестерин, триглицеридийн түвшин өндөр</li>
                  <li>Жирэмсний чихрийн шижингийн түүхтэй</li>
                  <li>Өндөр жинтэй хүүхэд төрүүлсэн (9 фунтаас дээш)</li>
                  <li>Поликистоз өндгөвчний хам шинжтэй</li>
                  <li>Урьдал чихрийн шижин оноштой</li>
                </ul>
                <p className="mt-2">
                  Хэрэв та эдгээр эрсдэлт хүчин зүйлсийн аль нэгтэй бол тогтмол
                  шинжилгээ хийлгэж, эрүүл амьдралын хэв маягийг баримтлах нь
                  чухал.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/diabetes-assessment")}
                    className="w-full"
                  >
                    Эрсдэлийн үнэлгээ хийх
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Шинжилгээ хийлгэх хуваарь
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Хэн
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Хэзээ
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Ямар шинжилгээ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Эрсдэлгүй насанд хүрэгчид
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          45 наснаас эхлэн 3 жил тутамд
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Өлөн үеийн цусан дахь сахар, HbA1c
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Илүүдэл жинтэй, эрсдэлт хүчин зүйлтэй
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Аль ч насанд, жил бүр
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Өлөн үеийн цусан дахь сахар, HbA1c
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Урьдал чихрийн шижинтэй
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Жил бүр
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Өлөн үеийн цусан дахь сахар, HbA1c
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Жирэмсэн эмэгтэйчүүд
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          24-28 долоо хоногт
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Глюкозын ачаалалтай шинжилгээ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Хооллолт */}
        <TabsContent value="diet" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Хооллолтын зөвлөгөө</CardTitle>
              <CardDescription>
                Чихрийн шижинтэй болон эрсдэлтэй хүмүүст зориулсан хооллолтын
                зөвлөмж
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Чихрийн шижингийн хоолны дэглэмийн зарчмууд
                </h3>
                <p>
                  Чихрийн шижинтэй хүмүүст зориулсан хоолны дэглэм нь цусан дахь
                  сахарын хэмжээг хянах, эрүүл жин барих, зүрх судасны өвчнөөс
                  урьдчилан сэргийлэхэд тусална.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Идэх хүнс</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <span className="font-medium">Хүнсний ногоо:</span> Ногоон
                      навчит ногоо, брокколи, лууван, улаан лооль, огурци
                    </li>
                    <li>
                      <span className="font-medium">Жимс:</span> Жимсгэнэ, алим,
                      лийр, гүзээлзгэнэ (хэмжээг хянах)
                    </li>
                    <li>
                      <span className="font-medium">Бүхэл үр тариа:</span> Бор
                      будаа, бүхэл үрийн талх, овъёос, киноа
                    </li>
                    <li>
                      <span className="font-medium">
                        Өөх тос багатай уураг:
                      </span>{" "}
                      Тахиа, загас, өндөг, буурцаг
                    </li>
                    <li>
                      <span className="font-medium">Эрүүл тос:</span> Чидун
                      жимсний тос, самрын тос, оливын тос
                    </li>
                    <li>
                      <span className="font-medium">Самар, үр:</span> Хэмжээг
                      хянаж хэрэглэх
                    </li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Хязгаарлах хүнс</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <span className="font-medium">Цагаан гурил:</span> Цагаан
                      талх, гоймон, жигнэмэг
                    </li>
                    <li>
                      <span className="font-medium">Сахар:</span> Чихэр, бялуу,
                      жигнэмэг, чихэрлэг ундаа
                    </li>
                    <li>
                      <span className="font-medium">Боловсруулсан хүнс:</span>{" "}
                      Түргэн хоол, савласан бэлэн хоол
                    </li>
                    <li>
                      <span className="font-medium">Ханасан тос:</span> Мах,
                      цөцгийн тос, сүүн бүтээгдэхүүн
                    </li>
                    <li>
                      <span className="font-medium">Давс:</span> Өндөр давстай
                      хүнс, амтлагч
                    </li>
                    <li>
                      <span className="font-medium">Архи:</span> Хэрэглээг
                      хязгаарлах
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Хоолны хэмжээ ба давтамж
                </h3>
                <p>
                  Хоолны хэмжээ, хооллох давтамж нь цусан дахь сахарын хэмжээг
                  тогтвортой байлгахад чухал үүрэгтэй:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Өдөрт 3 үндсэн хоол, 2-3 завсрын зууш идэх</li>
                  <li>Хоолны хэмжээг хянах (таваг дүүргэх биш)</li>
                  <li>Нүүрс ус, уураг, тосыг зөв харьцаатай хэрэглэх</li>
                  <li>
                    Хоолны дундуур их хэмжээний нүүрс ус хэрэглэхээс зайлсхийх
                  </li>
                  <li>Өдөр бүр ойролцоогоор ижил цагт хооллох</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Нүүрс усны тооллого</h3>
                <p>
                  Нүүрс усны тооллого нь чихрийн шижинтэй хүмүүст цусан дахь
                  сахарын хэмжээг хянахад тусалдаг:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Хүнс
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Хэмжээ
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Нүүрс ус (г)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Цагаан будаа
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          1/3 аяга (болсон)
                        </td>
                        <td className="border border-gray-300 px-4 py-2">15</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Талх
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          1 зүсэм
                        </td>
                        <td className="border border-gray-300 px-4 py-2">15</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Алим
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          1 жижиг
                        </td>
                        <td className="border border-gray-300 px-4 py-2">15</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Сүү
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          1 аяга
                        </td>
                        <td className="border border-gray-300 px-4 py-2">12</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          Ногоо (ихэнх)
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          1 аяга түүхий
                        </td>
                        <td className="border border-gray-300 px-4 py-2">5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/food-analyzer")}
                    className="w-full"
                  >
                    Хоолны калори тооцоолох
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Өдрийн хоолны жишээ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Өглөөний хоол</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>1/2 аяга овъёос</li>
                      <li>1 жижиг алим, хэрчсэн</li>
                      <li>1 халбага самар</li>
                      <li>1 аяга өөх тос багатай сүү</li>
                      <li>Чихэргүй цай эсвэл кофе</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Үдийн хоол</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>2 зүсэм бүхэл үрийн талх</li>
                      <li>85 гр тахианы мах</li>
                      <li>Салатны навч, улаан лооль, огурци</li>
                      <li>1 жижиг лийр</li>
                      <li>Ус эсвэл чихэргүй ундаа</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Оройн хоол</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>85 гр шарсан загас</li>
                      <li>2/3 аяга бор будаа</li>
                      <li>1 аяга жигнэсэн ногоо</li>
                      <li>Жижиг салат (оливын тостой)</li>
                      <li>Ус эсвэл чихэргүй ундаа</li>
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Хоолны дэглэмийн аргууд
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Тавгийн арга</h4>
                    <p className="text-sm mb-2">
                      Тавгийн аргыг ашиглан хоолоо төлөвлөх нь хялбар бөгөөд үр
                      дүнтэй:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>1/2 тавгийг ногоогоор дүүргэх</li>
                      <li>1/4 тавгийг өөх тос багатай уургаар дүүргэх</li>
                      <li>1/4 тавгийг бүхэл үр тариа, цардуулаар дүүргэх</li>
                      <li>Жимс, сүүн бүтээгдэхүүнийг нэмэлтээр хэрэглэх</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Гликемик индекс</h4>
                    <p className="text-sm mb-2">
                      Бага, дунд зэргийн гликемик индекстэй хүнс сонгох:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        <span className="font-medium">Бага GI:</span> Буурцаг,
                        самар, ихэнх жимс, ногоо
                      </li>
                      <li>
                        <span className="font-medium">Дунд GI:</span> Бүхэл
                        үрийн талх, бор будаа, овъёос
                      </li>
                      <li>
                        <span className="font-medium">
                          Өндөр GI (хязгаарлах):
                        </span>{" "}
                        Цагаан талх, цагаан будаа, чихэр
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Хоолны дэглэмийн нэмэлт зөвлөмж
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Өдөрт 8-10 аяга ус уух</li>
                  <li>Хоолоо удаан, сайтар зажилж идэх</li>
                  <li>Хоолны өмнө ногоо, шөл идэх</li>
                  <li>Хоолны дэвтэр хөтлөх</li>
                  <li>Хоолны шошгыг уншиж сурах</li>
                  <li>Гэрийн хоол хийж идэх</li>
                  <li>Хоолны дэглэмээ хэт хатуу биш, тогтвортой байлгах</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Сануулга */}
        <TabsContent value="reminders" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Сануулга тохируулах</CardTitle>
              <CardDescription>
                Чихрийн шижингийн менежментэд туслах сануулгууд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Сануулгын төрлүүд</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="medication-reminders"
                      className="flex flex-col gap-1"
                    >
                      <span>Эм уух сануулга</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Эм уух цагаа мартахгүй байхад тусална
                      </span>
                    </Label>
                    <Switch
                      id="medication-reminders"
                      checked={reminderSettings.medicationReminders}
                      onCheckedChange={(checked) =>
                        updateReminderSetting("medicationReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="glucose-check-reminders"
                      className="flex flex-col gap-1"
                    >
                      <span>Сахар шалгах сануулга</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Цусан дахь сахараа хэмжих цагийг сануулна
                      </span>
                    </Label>
                    <Switch
                      id="glucose-check-reminders"
                      checked={reminderSettings.glucoseCheckReminders}
                      onCheckedChange={(checked) =>
                        updateReminderSetting("glucoseCheckReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="appointment-reminders"
                      className="flex flex-col gap-1"
                    >
                      <span>Эмчийн цаг сануулга</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Эмчийн цаг товлосон үеийг сануулна
                      </span>
                    </Label>
                    <Switch
                      id="appointment-reminders"
                      checked={reminderSettings.appointmentReminders}
                      onCheckedChange={(checked) =>
                        updateReminderSetting("appointmentReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="dietary-reminders"
                      className="flex flex-col gap-1"
                    >
                      <span>Хооллолтын сануулга</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Хооллох цаг болон хоолны зөвлөмжийг сануулна
                      </span>
                    </Label>
                    <Switch
                      id="dietary-reminders"
                      checked={reminderSettings.dietaryReminders}
                      onCheckedChange={(checked) =>
                        updateReminderSetting("dietaryReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="exercise-reminders"
                      className="flex flex-col gap-1"
                    >
                      <span>Дасгал хөдөлгөөний сануулга</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Дасгал хийх цагийг сануулна
                      </span>
                    </Label>
                    <Switch
                      id="exercise-reminders"
                      checked={reminderSettings.exerciseReminders}
                      onCheckedChange={(checked) =>
                        updateReminderSetting("exerciseReminders", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Шинэ сануулга нэмэх</h3>
                <form onSubmit={handleAddReminder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-type">Сануулгын төрөл</Label>
                    <Select
                      defaultValue="medication"
                      onValueChange={(value) =>
                        setReminderType(value as DiabetesReminderType)
                      }
                    >
                      <SelectTrigger id="reminder-type">
                        <SelectValue placeholder="Сануулгын төрлийг сонгоно уу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medication">Эм уух</SelectItem>
                        <SelectItem value="glucose">Сахар шалгах</SelectItem>
                        <SelectItem value="appointment">Эмчийн цаг</SelectItem>
                        <SelectItem value="meal">Хооллолт</SelectItem>
                        <SelectItem value="exercise">
                          Дасгал хөдөлгөөн
                        </SelectItem>
                        <SelectItem value="other">Бусад</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-name">Сануулгын нэр</Label>
                    <Input
                      id="reminder-name"
                      name="reminder-name"
                      placeholder="Жишээ: Өглөөний эм"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-time">Цаг</Label>
                      <Input
                        id="reminder-time"
                        name="reminder-time"
                        type="time"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reminder-frequency">Давтамж</Label>
                      <Select defaultValue="daily" name="reminder-frequency">
                        <SelectTrigger id="reminder-frequency">
                          <SelectValue placeholder="Давтамжийг сонгоно уу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Нэг удаа</SelectItem>
                          <SelectItem value="daily">Өдөр бүр</SelectItem>
                          <SelectItem value="weekdays">
                            Ажлын өдрүүдэд
                          </SelectItem>
                          <SelectItem value="weekends">
                            Амралтын өдрүүдэд
                          </SelectItem>
                          <SelectItem value="weekly">
                            Долоо хоног бүр
                          </SelectItem>
                          <SelectItem value="monthly">Сар бүр</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-notes">Нэмэлт тэмдэглэл</Label>
                    <Input
                      id="reminder-notes"
                      name="reminder-notes"
                      placeholder="Жишээ: Хоолны дараа уух"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Хадгалж байна...
                      </>
                    ) : (
                      "Сануулга нэмэх"
                    )}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Идэвхтэй сануулгууд</h3>
                <div className="space-y-2">
                  {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                      <Card key={reminder.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                reminder.type === "medication"
                                  ? "bg-blue-100"
                                  : reminder.type === "glucose"
                                  ? "bg-red-100"
                                  : reminder.type === "appointment"
                                  ? "bg-green-100"
                                  : reminder.type === "meal"
                                  ? "bg-yellow-100"
                                  : reminder.type === "exercise"
                                  ? "bg-purple-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {reminder.type === "medication" ? (
                                <Clock className="h-4 w-4 text-blue-500" />
                              ) : reminder.type === "glucose" ? (
                                <Droplet className="h-4 w-4 text-red-500" />
                              ) : reminder.type === "appointment" ? (
                                <Calendar className="h-4 w-4 text-green-500" />
                              ) : reminder.type === "meal" ? (
                                <Apple className="h-4 w-4 text-yellow-500" />
                              ) : reminder.type === "exercise" ? (
                                <Activity className="h-4 w-4 text-purple-500" />
                              ) : (
                                <Bell className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{reminder.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {reminder.time},{" "}
                                {reminder.frequency === "once"
                                  ? "Нэг удаа"
                                  : reminder.frequency === "daily"
                                  ? "Өдөр бүр"
                                  : reminder.frequency === "weekdays"
                                  ? "Ажлын өдрүүдэд"
                                  : reminder.frequency === "weekends"
                                  ? "Амралтын өдрүүдэд"
                                  : reminder.frequency === "weekly"
                                  ? "Долоо хоног бүр"
                                  : "Сар бүр"}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Засах
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Одоогоор идэвхтэй сануулга байхгүй байна
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Чихрийн шижингийн менежментийн зөвлөмж
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Цусан дахь сахараа өдөрт 2-4 удаа шалгах</li>
                  <li>Эмээ эмчийн зааврын дагуу уух</li>
                  <li>Хоолны дэглэмээ баримтлах</li>
                  <li>Тогтмол дасгал хөдөлгөөн хийх</li>
                  <li>Эмчийн үзлэгт тогтмол хамрагдах</li>
                  <li>Хөлөө өдөр бүр шалгаж, арчлах</li>
                  <li>Стрессээ зохицуулах</li>
                  <li>Хангалттай унтаж амрах</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

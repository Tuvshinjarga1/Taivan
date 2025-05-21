"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, Moon, Footprints, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SettingsProps {
  userId: string;
}

export default function Settings({ userId }: SettingsProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Хэрэглэгчийн профайлын мэдээлэл
  const [profile, setProfile] = useState({
    name: "Түвшинжаргал",
    email: "tuvshinjargal@gmail.com",
    height: 175, // см
    weight: 75, // кг
    birthdate: "2001-01-01",
    gender: "male",
  });

  // Зорилтууд
  const [goals, setGoals] = useState({
    steps: 10000,
    sleep: 8, // цаг
    calories: 2200,
    heartRate: { min: 60, max: 140 },
  });

  // Мэдэгдлийн тохиргоо
  const [notifications, setNotifications] = useState({
    dailySummary: true,
    goalAchievements: true,
    inactivityReminders: false,
    sleepReminders: true,
    appUpdates: false,
  });

  // Хэмжих нэгжийн тохиргоо
  const [units, setUnits] = useState({
    distance: "km",
    weight: "kg",
    temperature: "celsius",
    time: "24h",
  });

  // Нууцлалын тохиргоо
  const [privacy, setPrivacy] = useState({
    shareData: false,
    locationTracking: true,
    dataCollection: true,
  });

  const handleProfileUpdate = () => {
    toast({
      title: "Профайл шинэчлэгдлээ",
      description: "Таны хувийн мэдээлэл амжилттай шинэчлэгдлээ.",
    });
  };

  const handleGoalsUpdate = () => {
    toast({
      title: "Зорилтууд шинэчлэгдлээ",
      description: "Таны эрүүл мэндийн зорилтууд амжилттай шинэчлэгдлээ.",
    });
  };

  const handleNotificationsUpdate = () => {
    toast({
      title: "Мэдэгдлийн тохиргоо шинэчлэгдлээ",
      description: "Таны мэдэгдлийн тохиргоо хадгалагдлаа.",
    });
  };

  const handleUnitsUpdate = () => {
    toast({
      title: "Нэгжийн тохиргоо шинэчлэгдлээ",
      description: "Таны хэмжих нэгжийн тохиргоо хадгалагдлаа.",
    });
  };

  const handlePrivacyUpdate = () => {
    toast({
      title: "Нууцлалын тохиргоо шинэчлэгдлээ",
      description: "Таны нууцлалын тохиргоо хадгалагдлаа.",
    });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Хянах самбар руу буцах
        </Button>
        {/* <h1 className="text-xl sm:text-2xl font-bold">Тохиргоо</h1> */}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5 mb-4 overflow-x-auto">
          <TabsTrigger
            value="profile"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Профайл
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Зорилтууд
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Мэдэгдэл
          </TabsTrigger>
          <TabsTrigger
            value="units"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Нэгж
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Нууцлал
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Хувийн мэдээлэл
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Хувийн мэдээллээ шинэчлэх
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-2">
                  <AvatarImage
                    src="/placeholder.svg?height=96&width=96"
                    alt="Профайл"
                  />
                  <AvatarFallback>ТЖ</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Зураг солих
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs sm:text-sm">
                    Бүтэн нэр
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">
                    Имэйл
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs sm:text-sm">
                    Өндөр (см)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        height: Number.parseInt(e.target.value),
                      })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-xs sm:text-sm">
                    Жин (кг)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        weight: Number.parseInt(e.target.value),
                      })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="text-xs sm:text-sm">
                    Төрсөн огноо
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={profile.birthdate}
                    onChange={(e) =>
                      setProfile({ ...profile, birthdate: e.target.value })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs sm:text-sm">
                    Хүйс
                  </Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) =>
                      setProfile({ ...profile, gender: value })
                    }
                  >
                    <SelectTrigger id="gender" className="text-xs sm:text-sm">
                      <SelectValue placeholder="Хүйсээ сонгоно уу" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male" className="text-xs sm:text-sm">
                        Эрэгтэй
                      </SelectItem>
                      <SelectItem value="female" className="text-xs sm:text-sm">
                        Эмэгтэй
                      </SelectItem>
                      <SelectItem value="other" className="text-xs sm:text-sm">
                        Бусад
                      </SelectItem>
                      <SelectItem
                        value="prefer-not-to-say"
                        className="text-xs sm:text-sm"
                      >
                        Хэлэхийг хүсэхгүй байна
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-4 sm:px-6 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
              <Button
                onClick={handleProfileUpdate}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Өөрчлөлтийг хадгалах
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Эрүүл мэндийн зорилтууд
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Өдөр тутмын эрүүл мэндийн зорилтуудаа тохируулах
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Footprints className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <Label htmlFor="steps-goal" className="text-xs sm:text-sm">
                    Өдрийн алхалтын зорилт: {goals.steps.toLocaleString()}
                  </Label>
                </div>
                <Slider
                  id="steps-goal"
                  min={1000}
                  max={20000}
                  step={500}
                  value={[goals.steps]}
                  onValueChange={(value) =>
                    setGoals({ ...goals, steps: value[0] })
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <Label htmlFor="sleep-goal" className="text-xs sm:text-sm">
                    Нойрны зорилт (цаг): {goals.sleep}
                  </Label>
                </div>
                <Slider
                  id="sleep-goal"
                  min={5}
                  max={12}
                  step={0.5}
                  value={[goals.sleep]}
                  onValueChange={(value) =>
                    setGoals({ ...goals, sleep: value[0] })
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <Label htmlFor="calories-goal" className="text-xs sm:text-sm">
                    Өдрийн калорийн зорилт: {goals.calories.toLocaleString()}
                  </Label>
                </div>
                <Slider
                  id="calories-goal"
                  min={1000}
                  max={4000}
                  step={100}
                  value={[goals.calories]}
                  onValueChange={(value) =>
                    setGoals({ ...goals, calories: value[0] })
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  <Label className="text-xs sm:text-sm">
                    Зүрхний цохилтын хязгаар (bpm): {goals.heartRate.min} -{" "}
                    {goals.heartRate.max}
                  </Label>
                </div>
                <Slider
                  min={40}
                  max={200}
                  step={5}
                  value={[goals.heartRate.min, goals.heartRate.max]}
                  onValueChange={(value) =>
                    setGoals({
                      ...goals,
                      heartRate: { min: value[0], max: value[1] },
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="px-4 sm:px-6">
              <Button
                onClick={handleGoalsUpdate}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Зорилтуудыг хадгалах
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Мэдэгдлийн тохиргоо
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Мэдэгдлийн сонголтуудаа удирдах
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-summary" className="text-xs sm:text-sm">
                    Өдөр тутмын тойм
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Эрүүл мэндийн мэдээллийн өдөр тутмын тойм хүлээн авах
                  </p>
                </div>
                <Switch
                  id="daily-summary"
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      dailySummary: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="goal-achievements"
                    className="text-xs sm:text-sm"
                  >
                    Зорилт биелүүлэлт
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Эрүүл мэндийн зорилтдоо хүрэхэд мэдэгдэл хүлээн авах
                  </p>
                </div>
                <Switch
                  id="goal-achievements"
                  checked={notifications.goalAchievements}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      goalAchievements: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="inactivity-reminders"
                    className="text-xs sm:text-sm"
                  >
                    Идэвхгүй байдлын сануулга
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Удаан хугацаагаар хөдөлгөөнгүй байвал сануулга хүлээн авах
                  </p>
                </div>
                <Switch
                  id="inactivity-reminders"
                  checked={notifications.inactivityReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      inactivityReminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="sleep-reminders"
                    className="text-xs sm:text-sm"
                  >
                    Нойрны сануулга
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Унтах цагаа бэлтгэхэд сануулга хүлээн авах
                  </p>
                </div>
                <Switch
                  id="sleep-reminders"
                  checked={notifications.sleepReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      sleepReminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-updates" className="text-xs sm:text-sm">
                    Аппын шинэчлэл
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Аппын шинэчлэл болон шинэ функцуудын талаар мэдэгдэл хүлээн
                    авах
                  </p>
                </div>
                <Switch
                  id="app-updates"
                  checked={notifications.appUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, appUpdates: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="px-4 sm:px-6">
              <Button
                onClick={handleNotificationsUpdate}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Мэдэгдлийн тохиргоог хадгалах
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="units">
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Хэмжих нэгжийн тохиргоо
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Хэмжих нэгжүүдээ өөрчлөх
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="distance-unit" className="text-xs sm:text-sm">
                  Зайн нэгж
                </Label>
                <Select
                  value={units.distance}
                  onValueChange={(value) =>
                    setUnits({ ...units, distance: value })
                  }
                >
                  <SelectTrigger
                    id="distance-unit"
                    className="text-xs sm:text-sm"
                  >
                    <SelectValue placeholder="Зайн нэгжээ сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km" className="text-xs sm:text-sm">
                      Километр (км)
                    </SelectItem>
                    <SelectItem value="mi" className="text-xs sm:text-sm">
                      Миль (mi)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight-unit" className="text-xs sm:text-sm">
                  Жингийн нэгж
                </Label>
                <Select
                  value={units.weight}
                  onValueChange={(value) =>
                    setUnits({ ...units, weight: value })
                  }
                >
                  <SelectTrigger
                    id="weight-unit"
                    className="text-xs sm:text-sm"
                  >
                    <SelectValue placeholder="Жингийн нэгжээ сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg" className="text-xs sm:text-sm">
                      Килограмм (кг)
                    </SelectItem>
                    <SelectItem value="lb" className="text-xs sm:text-sm">
                      Фунт (lb)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="temperature-unit"
                  className="text-xs sm:text-sm"
                >
                  Температурын нэгж
                </Label>
                <Select
                  value={units.temperature}
                  onValueChange={(value) =>
                    setUnits({ ...units, temperature: value })
                  }
                >
                  <SelectTrigger
                    id="temperature-unit"
                    className="text-xs sm:text-sm"
                  >
                    <SelectValue placeholder="Температурын нэгжээ сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius" className="text-xs sm:text-sm">
                      Цельс (°C)
                    </SelectItem>
                    <SelectItem
                      value="fahrenheit"
                      className="text-xs sm:text-sm"
                    >
                      Фаренгейт (°F)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format" className="text-xs sm:text-sm">
                  Цагийн формат
                </Label>
                <Select
                  value={units.time}
                  onValueChange={(value) => setUnits({ ...units, time: value })}
                >
                  <SelectTrigger
                    id="time-format"
                    className="text-xs sm:text-sm"
                  >
                    <SelectValue placeholder="Цагийн форматаа сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h" className="text-xs sm:text-sm">
                      24-цагийн
                    </SelectItem>
                    <SelectItem value="12h" className="text-xs sm:text-sm">
                      12-цагийн (AM/PM)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="px-4 sm:px-6">
              <Button
                onClick={handleUnitsUpdate}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Нэгжийн тохиргоог хадгалах
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Нууцлалын тохиргоо
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Өгөгдлийн нууцлалын тохиргоогоо удирдах
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-data" className="text-xs sm:text-sm">
                    Эрүүл мэндийн мэдээлэл хуваалцах
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Судалгааны зорилгоор эрүүл мэндийн мэдээллийг нэр
                    хаяггүйгээр хуваалцах
                  </p>
                </div>
                <Switch
                  id="share-data"
                  checked={privacy.shareData}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, shareData: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="location-tracking"
                    className="text-xs sm:text-sm"
                  >
                    Байршил хянах
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Идэвхийн мэдээлэлд байршлыг тэмдэглэхийг зөвшөөрөх
                  </p>
                </div>
                <Switch
                  id="location-tracking"
                  checked={privacy.locationTracking}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, locationTracking: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="data-collection"
                    className="text-xs sm:text-sm"
                  >
                    Өгөгдөл цуглуулалт
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Үйлчилгээг сайжруулах зорилгоор аппын хэрэглээний өгөгдөл
                    цуглуулахыг зөвшөөрөх
                  </p>
                </div>
                <Switch
                  id="data-collection"
                  checked={privacy.dataCollection}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, dataCollection: checked })
                  }
                />
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm text-red-600 border-red-200 hover:bg-red-50"
                >
                  Миний бүх өгөгдлийг устгах
                </Button>
              </div>
            </CardContent>
            <CardFooter className="px-4 sm:px-6">
              <Button
                onClick={handlePrivacyUpdate}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Нууцлалын тохиргоог хадгалах
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

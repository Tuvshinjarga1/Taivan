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

  // User profile state
  const [profile, setProfile] = useState({
    name: "Tuvshinjargal",
    email: "tuvshinjargal@gmail.com",
    height: 175, // cm
    weight: 75, // kg
    birthdate: "2001-01-01",
    gender: "male",
  });

  // Goals state
  const [goals, setGoals] = useState({
    steps: 10000,
    sleep: 8, // hours
    calories: 2200,
    heartRate: { min: 60, max: 140 },
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    dailySummary: true,
    goalAchievements: true,
    inactivityReminders: false,
    sleepReminders: true,
    appUpdates: false,
  });

  // Units settings
  const [units, setUnits] = useState({
    distance: "km",
    weight: "kg",
    temperature: "celsius",
    time: "24h",
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    shareData: false,
    locationTracking: true,
    dataCollection: true,
  });

  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleGoalsUpdate = () => {
    toast({
      title: "Goals Updated",
      description: "Your health goals have been updated successfully.",
    });
  };

  const handleNotificationsUpdate = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleUnitsUpdate = () => {
    toast({
      title: "Units Settings Updated",
      description: "Your unit preferences have been saved.",
    });
  };

  const handlePrivacyUpdate = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been saved.",
    });
  };

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage
                    src="/placeholder.svg?height=96&width=96"
                    alt="Profile"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Date of Birth</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={profile.birthdate}
                    onChange={(e) =>
                      setProfile({ ...profile, birthdate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) =>
                      setProfile({ ...profile, gender: value })
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleProfileUpdate}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Health Goals</CardTitle>
              <CardDescription>Set your daily health targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Footprints className="h-5 w-5 text-blue-500" />
                  <Label htmlFor="steps-goal">
                    Daily Steps Goal: {goals.steps.toLocaleString()}
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
                  <Moon className="h-5 w-5 text-purple-500" />
                  <Label htmlFor="sleep-goal">
                    Sleep Goal (hours): {goals.sleep}
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
                  <Activity className="h-5 w-5 text-green-500" />
                  <Label htmlFor="calories-goal">
                    Daily Calories Goal: {goals.calories.toLocaleString()}
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
                  <Heart className="h-5 w-5 text-red-500" />
                  <Label>
                    Heart Rate Range (bpm): {goals.heartRate.min} -{" "}
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
            <CardFooter>
              <Button onClick={handleGoalsUpdate}>Save Goals</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-summary">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of your health metrics
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
                  <Label htmlFor="goal-achievements">Goal Achievements</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you reach your health goals
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
                  <Label htmlFor="inactivity-reminders">
                    Inactivity Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders to move when inactive for too long
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
                  <Label htmlFor="sleep-reminders">Sleep Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders to prepare for sleep
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
                  <Label htmlFor="app-updates">App Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about app updates and new features
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
            <CardFooter>
              <Button onClick={handleNotificationsUpdate}>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="units">
          <Card>
            <CardHeader>
              <CardTitle>Units Settings</CardTitle>
              <CardDescription>
                Customize your measurement units
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="distance-unit">Distance Unit</Label>
                <Select
                  value={units.distance}
                  onValueChange={(value) =>
                    setUnits({ ...units, distance: value })
                  }
                >
                  <SelectTrigger id="distance-unit">
                    <SelectValue placeholder="Select distance unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Kilometers (km)</SelectItem>
                    <SelectItem value="mi">Miles (mi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight-unit">Weight Unit</Label>
                <Select
                  value={units.weight}
                  onValueChange={(value) =>
                    setUnits({ ...units, weight: value })
                  }
                >
                  <SelectTrigger id="weight-unit">
                    <SelectValue placeholder="Select weight unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lb">Pounds (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature-unit">Temperature Unit</Label>
                <Select
                  value={units.temperature}
                  onValueChange={(value) =>
                    setUnits({ ...units, temperature: value })
                  }
                >
                  <SelectTrigger id="temperature-unit">
                    <SelectValue placeholder="Select temperature unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select
                  value={units.time}
                  onValueChange={(value) => setUnits({ ...units, time: value })}
                >
                  <SelectTrigger id="time-format">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24-hour</SelectItem>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUnitsUpdate}>Save Unit Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage your data privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-data">Share Health Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous sharing of your health data for research
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
                  <Label htmlFor="location-tracking">Location Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the app to track your location for activity mapping
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
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow collection of app usage data to improve services
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
                <Button variant="outline" className="w-full">
                  Delete All My Data
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePrivacyUpdate}>
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

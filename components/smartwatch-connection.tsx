"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Bluetooth, RefreshCw, Watch, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for available devices
const MOCK_DEVICES = [
  { id: "1", name: "Apple Watch Series 8", type: "apple", batteryLevel: 72, connected: false },
  { id: "2", name: "Samsung Galaxy Watch 5", type: "samsung", batteryLevel: 45, connected: false },
  { id: "3", name: "Fitbit Versa 4", type: "fitbit", batteryLevel: 89, connected: false },
  { id: "4", name: "Garmin Venu 2", type: "garmin", batteryLevel: 64, connected: false },
]

// Mock data for sync settings
const DEFAULT_SYNC_SETTINGS = {
  autoSync: true,
  syncFrequency: "hourly",
  syncOnWifi: true,
  syncHeartRate: true,
  syncSteps: true,
  syncSleep: true,
  syncWorkouts: true,
  syncCalories: true,
  batteryOptimization: false,
}

interface SmartwatchConnectionProps {
  userId: string
}

export default function SmartwatchConnection({ userId }: SmartwatchConnectionProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [availableDevices, setAvailableDevices] = useState<typeof MOCK_DEVICES>([])
  const [connectedDevice, setConnectedDevice] = useState<(typeof MOCK_DEVICES)[0] | null>(null)
  const [syncSettings, setSyncSettings] = useState(DEFAULT_SYNC_SETTINGS)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [syncProgress, setSyncProgress] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  const scanForDevices = () => {
    setIsScanning(true)
    setAvailableDevices([])

    // Simulate scanning delay
    setTimeout(() => {
      setAvailableDevices(MOCK_DEVICES)
      setIsScanning(false)
      toast({
        title: "Scan Complete",
        description: `Found ${MOCK_DEVICES.length} devices nearby.`,
      })
    }, 3000)
  }

  const connectToDevice = (device: (typeof MOCK_DEVICES)[0]) => {
    // Simulate connection process
    setIsScanning(true)

    setTimeout(() => {
      const updatedDevice = { ...device, connected: true }
      setConnectedDevice(updatedDevice)
      setIsScanning(false)
      toast({
        title: "Device Connected",
        description: `Successfully connected to ${device.name}.`,
      })
    }, 2000)
  }

  const disconnectDevice = () => {
    if (!connectedDevice) return

    setIsScanning(true)

    setTimeout(() => {
      setConnectedDevice(null)
      setIsScanning(false)
      toast({
        title: "Device Disconnected",
        description: `Successfully disconnected from ${connectedDevice.name}.`,
      })
    }, 1000)
  }

  const syncData = () => {
    if (!connectedDevice) return

    setSyncStatus("syncing")
    setSyncProgress(0)

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setSyncStatus("success")
          toast({
            title: "Sync Complete",
            description: "Your health data has been successfully synchronized.",
          })
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  const updateSyncSetting = (key: keyof typeof DEFAULT_SYNC_SETTINGS, value: any) => {
    setSyncSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    toast({
      title: "Setting Updated",
      description: "Your sync settings have been updated.",
    })
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Smartwatch Connection</h1>
      </div>

      {/* Connected Device Card */}
      {connectedDevice ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Watch className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>{connectedDevice.name}</CardTitle>
                  <CardDescription>Connected</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Battery</div>
                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      connectedDevice.batteryLevel > 60
                        ? "bg-green-500"
                        : connectedDevice.batteryLevel > 20
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${connectedDevice.batteryLevel}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium">{connectedDevice.batteryLevel}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncStatus === "syncing" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing data...</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}

            {syncStatus === "success" && (
              <Alert variant="success" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Sync Complete</AlertTitle>
                <AlertDescription>Your health data has been successfully synchronized.</AlertDescription>
              </Alert>
            )}

            {syncStatus === "error" && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertTitle>Sync Failed</AlertTitle>
                <AlertDescription>There was an error synchronizing your data. Please try again.</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={syncData} disabled={syncStatus === "syncing"} className="flex-1">
                {syncStatus === "syncing" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Now"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={disconnectDevice}
                disabled={isScanning || syncStatus === "syncing"}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Connect a Smartwatch</CardTitle>
            <CardDescription>Connect your smartwatch to sync health data automatically</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={scanForDevices} disabled={isScanning} className="w-full">
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Bluetooth className="mr-2 h-4 w-4" />
                  Scan for Devices
                </>
              )}
            </Button>

            {availableDevices.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Available Devices</h3>
                <div className="space-y-2">
                  {availableDevices.map((device) => (
                    <Card key={device.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Watch className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{device.name}</p>
                            <p className="text-xs text-muted-foreground">Battery: {device.batteryLevel}%</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => connectToDevice(device)} disabled={isScanning}>
                          Connect
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>Configure how your smartwatch syncs data with the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-sync" className="flex flex-col gap-1">
              <span>Auto Sync</span>
              <span className="font-normal text-xs text-muted-foreground">
                Automatically sync data in the background
              </span>
            </Label>
            <Switch
              id="auto-sync"
              checked={syncSettings.autoSync}
              onCheckedChange={(checked) => updateSyncSetting("autoSync", checked)}
            />
          </div>

          {syncSettings.autoSync && (
            <div className="space-y-2">
              <Label htmlFor="sync-frequency">Sync Frequency</Label>
              <Select
                value={syncSettings.syncFrequency}
                onValueChange={(value) => updateSyncSetting("syncFrequency", value)}
              >
                <SelectTrigger id="sync-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="30min">Every 30 minutes</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-wifi" className="flex flex-col gap-1">
              <span>Sync on Wi-Fi Only</span>
              <span className="font-normal text-xs text-muted-foreground">Only sync when connected to Wi-Fi</span>
            </Label>
            <Switch
              id="sync-wifi"
              checked={syncSettings.syncOnWifi}
              onCheckedChange={(checked) => updateSyncSetting("syncOnWifi", checked)}
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="data-types">
              <AccordionTrigger>Data Types to Sync</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-heart-rate">Heart Rate</Label>
                  <Switch
                    id="sync-heart-rate"
                    checked={syncSettings.syncHeartRate}
                    onCheckedChange={(checked) => updateSyncSetting("syncHeartRate", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-steps">Steps</Label>
                  <Switch
                    id="sync-steps"
                    checked={syncSettings.syncSteps}
                    onCheckedChange={(checked) => updateSyncSetting("syncSteps", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-sleep">Sleep</Label>
                  <Switch
                    id="sync-sleep"
                    checked={syncSettings.syncSleep}
                    onCheckedChange={(checked) => updateSyncSetting("syncSleep", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-workouts">Workouts</Label>
                  <Switch
                    id="sync-workouts"
                    checked={syncSettings.syncWorkouts}
                    onCheckedChange={(checked) => updateSyncSetting("syncWorkouts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-calories">Calories</Label>
                  <Switch
                    id="sync-calories"
                    checked={syncSettings.syncCalories}
                    onCheckedChange={(checked) => updateSyncSetting("syncCalories", checked)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="advanced">
              <AccordionTrigger>Advanced Settings</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="battery-optimization" className="flex flex-col gap-1">
                    <span>Battery Optimization</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Reduce sync frequency when battery is low
                    </span>
                  </Label>
                  <Switch
                    id="battery-optimization"
                    checked={syncSettings.batteryOptimization}
                    onCheckedChange={(checked) => updateSyncSetting("batteryOptimization", checked)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setSyncSettings(DEFAULT_SYNC_SETTINGS)}>
            Reset to Default Settings
          </Button>
        </CardFooter>
      </Card>

      {/* Compatible Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Compatible Devices</CardTitle>
          <CardDescription>Smartwatches and fitness trackers that work with this app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2 border rounded-md">
              <div className="bg-gray-100 p-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    fill="#A2AAAD"
                  />
                  <path
                    d="M15.7274 8.53223C15.3975 8.84017 14.7677 9.10614 14.1379 9.04816C14.0599 8.42833 14.3118 7.80851 14.6027 7.42259C14.9326 7.06865 15.6014 6.82467 16.1922 6.80267C16.2507 7.45448 16.0573 8.1773 15.7274 8.53223Z"
                    fill="white"
                  />
                  <path
                    d="M16.1337 9.19209C15.3089 9.14511 14.6026 9.63902 14.1677 9.63902C13.7328 9.63902 13.1225 9.21111 12.4747 9.23211C11.6304 9.25311 10.8641 9.72502 10.4487 10.4839C9.59845 11.9996 10.2267 14.2511 11.0515 15.5368C11.4474 16.1696 11.9408 16.8705 12.5886 16.8495C13.1989 16.8285 13.4313 16.4426 14.1677 16.4426C14.9041 16.4426 15.1169 16.8495 15.7662 16.8285C16.4335 16.8075 16.8684 16.1906 17.2643 15.5578C17.7187 14.8359 17.9119 14.135 17.9119 14.093C17.8924 14.0721 16.7549 13.6231 16.7354 12.1494C16.7159 10.9057 17.6187 10.3779 17.6577 10.3569C17.0864 9.46307 16.1922 9.21909 15.7662 9.19209H16.1337Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Apple Watch</p>
                <p className="text-xs text-muted-foreground">Series 4 and newer</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border rounded-md">
              <div className="bg-gray-100 p-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19.2188 10.1454C19.9805 10.1454 20.5977 9.52832 20.5977 8.76758C20.5977 8.00684 19.9805 7.38867 19.2188 7.38867C18.457 7.38867 17.8398 8.00684 17.8398 8.76758C17.8398 9.52832 18.457 10.1454 19.2188 10.1454Z"
                    fill="#1428A0"
                  />
                  <path d="M6.45117 14.7656H17.5488V9.23438H6.45117V14.7656Z" fill="#1428A0" />
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#1428A0"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Samsung Galaxy Watch</p>
                <p className="text-xs text-muted-foreground">Galaxy Watch 3, 4, 5, and newer</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border rounded-md">
              <div className="bg-gray-100 p-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    fill="#00B0B9"
                  />
                  <path d="M15.5 8.5L12.5 11.5L15.5 14.5L12.5 17.5H8.5V6.5H12.5L15.5 8.5Z" fill="white" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Fitbit</p>
                <p className="text-xs text-muted-foreground">Versa 2, 3, 4, Sense, and newer</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border rounded-md">
              <div className="bg-gray-100 p-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    fill="#006CC3"
                  />
                  <path d="M7 12L10 7H14L17 12L14 17H10L7 12Z" fill="white" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Garmin</p>
                <p className="text-xs text-muted-foreground">Venu, Vivoactive, Forerunner series</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

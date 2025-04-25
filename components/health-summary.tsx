import { Card, CardContent } from "@/components/ui/card"
import { Heart, Footprints, Moon, Activity } from "lucide-react"

interface HealthSummaryProps {
  healthData: {
    heartRate: number
    steps: number
    sleep: number
    calories: number
  }
}

export default function HealthSummary({ healthData }: HealthSummaryProps) {
  // Format sleep hours to hours and minutes
  const sleepHours = Math.floor(healthData.sleep)
  const sleepMinutes = Math.round((healthData.sleep - sleepHours) * 60)
  const sleepFormatted = `${sleepHours}h ${sleepMinutes}m`

  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3">Today's Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-2 rounded-full">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heart Rate</p>
              <p className="font-medium">{healthData.heartRate} bpm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Footprints className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Steps</p>
              <p className="font-medium">{healthData.steps.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-full">
              <Moon className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sleep</p>
              <p className="font-medium">{sleepFormatted}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="font-medium">{healthData.calories.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

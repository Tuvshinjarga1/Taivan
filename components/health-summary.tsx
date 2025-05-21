import { Card, CardContent } from "@/components/ui/card";
import { Heart, Footprints, Moon, Activity } from "lucide-react";

interface HealthSummaryProps {
  healthData: {
    heartRate: number;
    steps: number;
    sleep: number;
    calories: number;
  };
}

export default function HealthSummary({ healthData }: HealthSummaryProps) {
  // Format sleep hours to hours and minutes
  const sleepHours = Math.floor(healthData.sleep);
  const sleepMinutes = Math.round((healthData.sleep - sleepHours) * 60);
  const sleepFormatted = `${sleepHours}h ${sleepMinutes}m`;

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
          Өнөөдрийн нэгтгэл
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-red-100 p-1.5 sm:p-2 rounded-full">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Зүрхний цохилт
              </p>
              <p className="text-sm sm:text-base font-medium">
                {healthData.heartRate} bpm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full">
              <Footprints className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Алхалт
              </p>
              <p className="text-sm sm:text-base font-medium">
                {healthData.steps.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full">
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Нойр
              </p>
              <p className="text-sm sm:text-base font-medium">
                {sleepFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Калори
              </p>
              <p className="text-sm sm:text-base font-medium">
                {healthData.calories.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

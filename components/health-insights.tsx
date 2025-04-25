"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { generateHealthInsightsAction } from "@/app/actions/ai-actions";

interface HealthInsightsProps {
  healthData: {
    heartRate: number;
    steps: number;
    sleep: number;
    calories: number;
  };
}

export default function HealthInsights({ healthData }: HealthInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateHealthInsightsAction(healthData);

      if (result.success && result.insights) {
        setInsights(result.insights);
      } else {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : "Эрүүл мэндийн дүгнэлт гаргах боломжгүй байна";

        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(
        "Эрүүл мэндийн дүгнэлт гаргах боломжгүй байна. Дараа дахин оролдоно уу."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-full">
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-base">
              AI Эрүүл мэндийн дүгнэлт
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Шинжилж байна...
              </>
            ) : (
              "Дүгнэлт гаргах"
            )}
          </Button>
        </div>
        <CardDescription>
          Таны эрүүл мэндийн өгөгдөлд AI дүн шинжилгээ хийх
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

        {!insights && !loading && !error && (
          <div className="text-center py-6 text-muted-foreground">
            AI-аар эрүүл мэндийн зөвлөгөө авахын тулд "Дүгнэлт гаргах" товчийг
            дарна уу
          </div>
        )}

        {loading && (
          <div className="text-center py-6 text-muted-foreground">
            Таны эрүүл мэндийн өгөгдлийг шинжилж байна...
          </div>
        )}

        {insights && !loading && (
          <div className="text-sm whitespace-pre-line">{insights}</div>
        )}
      </CardContent>
    </Card>
  );
}

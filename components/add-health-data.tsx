"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AddHealthDataProps {
  userId: string;
}

export default function AddHealthData({ userId }: AddHealthDataProps) {
  const [formData, setFormData] = useState({
    heartRate: 72,
    steps: 8000,
    sleep: 7.5,
    calories: 1800,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate saving data
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Эрүүл мэндийн өгөгдөл амжилттай хадгалагдлаа",
        variant: "default",
      });

      // Go back to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving health data:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Өгөгдөл хадгалахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Шинэ өгөгдөл нэмэх</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="heartRate" className="text-sm font-medium">
              Зүрхний цохилт
            </label>
            <Input
              id="heartRate"
              name="heartRate"
              type="number"
              placeholder="Зүрхний цохилт (BPM)"
              value={formData.heartRate}
              onChange={handleChange}
              className="w-full"
              min="40"
              max="200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="steps" className="text-sm font-medium">
              Алхалт
            </label>
            <Input
              id="steps"
              name="steps"
              type="number"
              placeholder="Алхалтын тоо"
              value={formData.steps}
              onChange={handleChange}
              className="w-full"
              min="0"
              max="50000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sleep" className="text-sm font-medium">
              Нойр
            </label>
            <Input
              id="sleep"
              name="sleep"
              type="number"
              step="0.1"
              placeholder="Нойрны хугацаа (цаг)"
              value={formData.sleep}
              onChange={handleChange}
              className="w-full"
              min="0"
              max="24"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium">
              Калори
            </label>
            <Input
              id="calories"
              name="calories"
              type="number"
              placeholder="Зарцуулсан калори"
              value={formData.calories}
              onChange={handleChange}
              className="w-full"
              min="0"
              max="10000"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

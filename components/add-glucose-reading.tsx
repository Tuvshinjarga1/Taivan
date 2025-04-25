"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface AddGlucoseReadingProps {
  userId: string;
}

export default function AddGlucoseReading({ userId }: AddGlucoseReadingProps) {
  const [value, setValue] = useState(110);
  const [type, setType] = useState("before_meal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate saving data
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Сахарын хэмжилт амжилттай хадгалагдлаа",
        variant: "default",
      });

      // Reset form
      setValue(110);
      setType("before_meal");

      // Go back to chart view (reloads the page in a real app)
      router.refresh();
    } catch (error) {
      console.error("Error saving glucose reading:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Хэмжилт хадгалахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Шинэ хэмжилт нэмэх</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="value" className="text-sm font-medium">
              Сахарын хэмжээ (мг/дл)
            </label>
            <Input
              id="value"
              name="value"
              type="number"
              min="20"
              max="600"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Хэмжилтийн төрөл
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Хэмжилтийн төрөл сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before_meal">Хооллохын өмнө</SelectItem>
                <SelectItem value="after_meal">Хооллосноос хойш</SelectItem>
                <SelectItem value="fasting">Өлөн үед</SelectItem>
                <SelectItem value="before_sleep">Унтахын өмнө</SelectItem>
                <SelectItem value="after_workout">Дасгалын дараа</SelectItem>
              </SelectContent>
            </Select>
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

"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  RefreshCw,
  Save,
  ArrowLeft,
  Apple,
  Utensils,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { analyzeFoodImageAction } from "@/app/actions/ai-actions";
import { saveHealthDataAction } from "@/app/actions/firebase-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  carbs?: number;
}

interface FoodCalorieAnalyzerProps {
  userId: string;
}

interface AnalysisResult {
  foodItems: FoodItem[];
  totalCalories: number;
  totalCarbs?: number;
  diabeticRecommendations?: string[];
  rawResponse?: string; // Add raw response for debugging
}

export default function FoodCalorieAnalyzer({
  userId,
}: FoodCalorieAnalyzerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch");
  const [isDiabetic, setIsDiabetic] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Диабетийн эрсдэлийн үнэлгээний үр дүнг шалгах
  useEffect(() => {
    const checkDiabeticStatus = async () => {
      // Энд бодит байдал дээр хэрэглэгчийн диабетийн статусыг шалгах логик байх ёстой
      // Жишээ болгон хуурамч өгөгдөл ашиглая
      try {
        // Хэрэглэгчийн сүүлийн үнэлгээг авах
        const lastAssessment = {
          riskLevel: "high", // "low", "moderate", "high"
          date: new Date().toISOString(),
        };

        // Хэрэв өндөр эсвэл дунд зэргийн эрсдэлтэй бол диабетийн горимыг идэвхжүүлэх
        if (
          lastAssessment.riskLevel === "high" ||
          lastAssessment.riskLevel === "moderate"
        ) {
          setIsDiabetic(true);
        }
      } catch (error) {
        console.error("Error checking diabetic status:", error);
      }
    };

    checkDiabeticStatus();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset previous analysis
      setAnalysisResult(null);

      // Read the file as a data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Trigger file input click to open camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImageAction(image);

      if (result.success && result.data) {
        // Диабетийн горимд нүүрс усны мэдээлэл нэмэх
        if (isDiabetic) {
          // Нүүрс усны хэмжээг тооцоолох (жишээ логик)
          const foodItemsWithCarbs = result.data.foodItems.map((item: any) => {
            // Энгийн жишээ тооцоолол - бодит байдал дээр илүү нарийн тооцоолол хийх ёстой
            const estimatedCarbs = Math.round(item.calories * 0.12); // Ойролцоогоор 12% нь нүүрс ус гэж үзье
            return {
              ...item,
              carbs: estimatedCarbs,
            };
          });

          const totalCarbs = foodItemsWithCarbs.reduce(
            (sum: number, item: any) => sum + (item.carbs || 0),
            0
          );

          // Диабетийн зөвлөмжүүд
          const diabeticRecommendations = [];
          if (totalCarbs > 60) {
            diabeticRecommendations.push(
              "Энэ хоолонд нүүрс ус өндөр байна. Хэмжээг багасгахыг зөвлөж байна."
            );
          }
          if (totalCarbs > 30 && mealType === "snack") {
            diabeticRecommendations.push(
              "Завсрын зууш дахь нүүрс усны хэмжээ хэт өндөр байна."
            );
          }
          if (
            result.data.totalCalories > 600 &&
            (mealType === "breakfast" || mealType === "snack")
          ) {
            diabeticRecommendations.push(
              "Энэ хоолны калори хэт өндөр байна. Хэмжээг багасгахыг зөвлөж байна."
            );
          }

          setAnalysisResult({
            foodItems: foodItemsWithCarbs,
            totalCalories: result.data.totalCalories,
            totalCarbs,
            diabeticRecommendations,
            rawResponse: result.rawResponse, // Store raw response if available
          });
        } else {
          setAnalysisResult({
            ...result.data,
            rawResponse: result.rawResponse, // Store raw response if available
          });
        }

        toast({
          title: "Шинжилгээ дууслаа",
          description: `${result.data.foodItems.length} хоолны зүйл илрүүлж, ойролцоогоор ${result.data.totalCalories} калори тодорхойлов.`,
        });
      } else {
        toast({
          title: "Шинжилгээ амжилтгүй",
          description:
            result.error ||
            "Хоолны зургийг шинжлэх боломжгүй байна. Дахин оролдоно уу.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error analyzing food image:", error);
      toast({
        title: "Алдаа",
        description: "Гэнэтийн алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHealthData = async () => {
    if (!analysisResult) return;

    setIsSaving(true);
    try {
      // Create form data to use with existing saveHealthDataAction
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("calories", analysisResult.totalCalories.toString());

      // Use default values for other required fields
      // In a real app, you might want to get these from the user's latest data
      formData.append("heartRate", "70");
      formData.append("steps", "0");
      formData.append("sleep", "0");

      // Add food data as a JSON string
      formData.append("foodItems", JSON.stringify(analysisResult.foodItems));
      formData.append("mealType", mealType);

      // Нүүрс усны мэдээлэл байвал нэмэх
      if (analysisResult.totalCarbs) {
        formData.append("totalCarbs", analysisResult.totalCarbs.toString());
      }

      const result = await saveHealthDataAction(formData);

      if (result.success) {
        toast({
          title: "Хоолны мэдээлэл хадгалагдлаа",
          description: `${analysisResult.totalCalories} калори таны эрүүл мэндийн мэдээлэлд нэмэгдлээ.`,
        });

        // Reset the form after successful save
        setImage(null);
        setAnalysisResult(null);
        setActiveTab("analyze");
      } else {
        toast({
          title: "Хадгалах үйлдэл амжилтгүй",
          description:
            result.error ||
            "Хоолны мэдээллийг хадгалах боломжгүй байна. Дахин оролдоно уу.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving food data:", error);
      toast({
        title: "Алдаа",
        description: "Гэнэтийн алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
          Хянах самбар руу буцах
        </Button>
        <h1 className="text-2xl font-bold">Хоолны калори тооцоолуур</h1>
      </div>

      {isDiabetic && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Туршилтын орчин</AlertTitle>
          <AlertDescription>
            Туршилтын орчин тул зарим үйлдэл хязгаарлагдсан байна.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="analyze">
            <Camera className="h-4 w-4 mr-2" />
            Шинжлэх
          </TabsTrigger>
          <TabsTrigger value="history" disabled={!analysisResult}>
            <Utensils className="h-4 w-4 mr-2" />
            Үр дүн
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Apple className="h-4 w-4 mr-2" />
            Зөвлөмж
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Хоолны зураг шинжлэх</CardTitle>
              <CardDescription>
                Хоолны калорийг тооцоолохын тулд зураг оруулна уу
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {image ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="Food image"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm font-medium">
                      Чирэх & буулгах эсвэл дарж зураг оруулах
                    </div>
                    <div className="text-xs text-muted-foreground">
                      JPG, PNG эсвэл WEBP (хамгийн ихдээ 5MB)
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Зураг оруулах
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Зураг авах
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {image && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="meal-type">Хоолны төрөл</Label>
                      <Select
                        value={mealType}
                        onValueChange={(value) => setMealType(value as any)}
                      >
                        <SelectTrigger id="meal-type">
                          <SelectValue placeholder="Хоолны төрлийг сонгоно уу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">
                            Өглөөний хоол
                          </SelectItem>
                          <SelectItem value="lunch">Үдийн хоол</SelectItem>
                          <SelectItem value="dinner">Оройн хоол</SelectItem>
                          <SelectItem value="snack">Завсрын зууш</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Шинжилж байна...
                        </>
                      ) : (
                        "Хоолыг шинжлэх"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>Шинжилгээний үр дүн</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-2 font-semibold">Илрүүлсэн хоолны зүйлс</h3>
                  <div className="space-y-2">
                    {analysisResult.foodItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.portion}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.calories} кал</p>
                          {isDiabetic && item.carbs !== undefined && (
                            <p className="text-sm text-muted-foreground">
                              {item.carbs} г нүүрс ус
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 font-bold">
                      <p>Нийт калори</p>
                      <p>{analysisResult.totalCalories} кал</p>
                    </div>
                    {isDiabetic && analysisResult.totalCarbs !== undefined && (
                      <div className="flex justify-between items-center font-bold text-purple-600">
                        <p>Нийт нүүрс ус</p>
                        <p>{analysisResult.totalCarbs} г</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debugging section for showing raw JSON response */}
                {analysisResult.rawResponse && (
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">
                        AI хариу (Хөгжүүлэгчийн горим)
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRawResponse(!showRawResponse)}
                      >
                        {showRawResponse ? "Нуух" : "Харуулах"}
                      </Button>
                    </div>
                    {showRawResponse && (
                      <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-60">
                        {analysisResult.rawResponse}
                      </pre>
                    )}
                  </div>
                )}

                {isDiabetic &&
                  analysisResult.diabeticRecommendations &&
                  analysisResult.diabeticRecommendations.length > 0 && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle>Чихрийн шижингийн зөвлөмж</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          {analysisResult.diabeticRecommendations.map(
                            (rec, index) => (
                              <li key={index}>{rec}</li>
                            )
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                <Button
                  onClick={saveToHealthData}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Эрүүл мэндийн мэдээлэлд хадгалах
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>Хоолны дэлгэрэнгүй мэдээлэл</CardTitle>
                <CardDescription>
                  {mealType === "breakfast"
                    ? "Өглөөний хоол"
                    : mealType === "lunch"
                    ? "Үдийн хоол"
                    : mealType === "dinner"
                    ? "Оройн хоол"
                    : "Завсрын зууш"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  {image && (
                    <Image
                      src={image || "/placeholder.svg"}
                      alt="Food image"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Калорийн мэдээлэл</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Нийт калори:</span>
                        <span className="font-bold">
                          {analysisResult.totalCalories} кал
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Өдрийн хэрэгцээний:</span>
                        <span>
                          {Math.round(
                            (analysisResult.totalCalories / 2000) * 100
                          )}
                          %
                        </span>
                      </div>
                      {isDiabetic &&
                        analysisResult.totalCarbs !== undefined && (
                          <div className="flex justify-between text-purple-600">
                            <span>Нийт нүүрс ус:</span>
                            <span className="font-bold">
                              {analysisResult.totalCarbs} г
                            </span>
                          </div>
                        )}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Хоолны төрөл</h3>
                    <div className="space-y-2">
                      {analysisResult.foodItems.map((item, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="mr-2 mb-2"
                        >
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Хоолны зүйлсийн дэлгэрэнгүй</h3>
                  <div className="space-y-2">
                    {analysisResult.foodItems.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.portion}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.calories} кал</p>
                            {isDiabetic && item.carbs !== undefined && (
                              <p className="text-sm text-purple-600">
                                {item.carbs} г нүүрс ус
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {isDiabetic &&
                  analysisResult.diabeticRecommendations &&
                  analysisResult.diabeticRecommendations.length > 0 && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle>Чихрийн шижингийн зөвлөмж</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          {analysisResult.diabeticRecommendations.map(
                            (rec, index) => (
                              <li key={index}>{rec}</li>
                            )
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setActiveTab("analyze")}
                  >
                    Шинэ хоол шинжлэх
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={saveToHealthData}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Хадгалж байна...
                      </>
                    ) : (
                      "Хадгалах"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Хооллолтын зөвлөмж</CardTitle>
              <CardDescription>
                Эрүүл хооллолтын талаарх зөвлөмжүүд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDiabetic ? (
                <div className="space-y-4">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle>Чихрийн шижингийн эрсдэлтэй</AlertTitle>
                    <AlertDescription>
                      Таны чихрийн шижингийн эрсдэлийн үнэлгээ өндөр байгаа тул
                      дараах зөвлөмжүүдийг анхаарна уу.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h3 className="font-medium">Нүүрс усны хязгаарлалт</h3>
                    <p className="text-sm">
                      Чихрийн шижингийн эрсдэлтэй хүмүүс нүүрс усны хэрэглээгээ
                      хянах шаардлагатай. Дараах зөвлөмжүүдийг дагана уу:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        Нэг удаагийн хоолонд 45-60 грамм нүүрс ус хэрэглэхийг
                        зөвлөдөг
                      </li>
                      <li>Завсрын зууш 15-30 грамм нүүрс устай байх</li>
                      <li>
                        Өдөрт нийт 130-180 грамм нүүрс ус хэрэглэхийг зөвлөдөг
                      </li>
                      <li>
                        Цагаан гурил, цагаан будаа, чихэр зэрэг энгийн нүүрс
                        усыг хязгаарлах
                      </li>
                      <li>
                        Бүхэл үр тариа, хүнсний ногоо, жимс зэрэг нарийн
                        ширхэгтэй хүнс хэрэглэх
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Зөвлөж буй хүнс</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Ногоон навчит ногоо (салат, шпинат)</li>
                        <li>Бүхэл үрийн талх, бор будаа</li>
                        <li>Өөх тос багатай уураг (тахиа, загас)</li>
                        <li>Жимсгэнэ, алим, лийр (хэмжээг хянах)</li>
                        <li>Самар, үр (хэмжээг хянах)</li>
                        <li>Чидун жимс, оливын тос</li>
                      </ul>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Хязгаарлах хүнс</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Цагаан гурил, цагаан будаа</li>
                        <li>Чихэр, жигнэмэг, бялуу</li>
                        <li>Чихэрлэг ундаа, жүүс</li>
                        <li>Боловсруулсан хүнс</li>
                        <li>Шарсан хүнс</li>
                        <li>Архи, пиво</li>
                      </ul>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Хоолны хэмжээ ба давтамж</h3>
                    <p className="text-sm">
                      Цусан дахь сахарын хэмжээг тогтвортой байлгахын тулд:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Өдөрт 3 үндсэн хоол, 2-3 завсрын зууш идэх</li>
                      <li>Хоолны хэмжээг хянах</li>
                      <li>Өдөр бүр ойролцоогоор ижил цагт хооллох</li>
                      <li>
                        Хоолны дундуур их хэмжээний нүүрс ус хэрэглэхээс
                        зайлсхийх
                      </li>
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/diabetes-information")}
                    className="w-full"
                  >
                    Чихрийн шижингийн талаар дэлгэрэнгүй мэдээлэл авах
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Эрүүл хооллолтын зарчмууд</h3>
                    <p className="text-sm">
                      Эрүүл хооллолт нь таны биеийн ерөнхий эрүүл мэндэд чухал
                      үүрэгтэй. Дараах зөвлөмжүүдийг дагана уу:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        Өдөрт 5-аас доошгүй төрлийн жимс, хүнсний ногоо хэрэглэх
                      </li>
                      <li>Бүхэл үр тариа хэрэглэх</li>
                      <li>Өөх тос багатай уураг хэрэглэх</li>
                      <li>Сахар, давс, өөх тосыг хязгаарлах</li>
                      <li>Хангалттай хэмжээний ус уух (өдөрт 8 аяга)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Зөвлөж буй хүнс</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Жимс, хүнсний ногоо</li>
                        <li>Бүхэл үрийн талх, гурил</li>
                        <li>Өөх тос багатай мах, загас</li>
                        <li>Өөх тос багатай сүүн бүтээгдэхүүн</li>
                        <li>Самар, үр</li>
                        <li>Эрүүл тос (оливын тос, самрын тос)</li>
                      </ul>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Хязгаарлах хүнс</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Боловсруулсан хүнс</li>
                        <li>Түргэн хоол</li>
                        <li>Чихэрлэг ундаа</li>
                        <li>Их хэмжээний сахар агуулсан хүнс</li>
                        <li>Их хэмжээний давс агуулсан хүнс</li>
                        <li>Ханасан тос ихтэй хүнс</li>
                      </ul>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Хоолны хэмжээ</h3>
                    <p className="text-sm">
                      Хоолны хэмжээг хянах нь эрүүл хооллолтын чухал хэсэг юм:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Тавгийн хагасыг хүнсний ногоогоор дүүргэх</li>
                      <li>Тавгийн дөрөвний нэгийг уургаар дүүргэх</li>
                      <li>
                        Тавгийн дөрөвний нэгийг бүхэл үр тариагаар дүүргэх
                      </li>
                      <li>Хоолоо удаан, сайтар зажилж идэх</li>
                      <li>Хоолны дэвтэр хөтлөх</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Хянах самбар руу буцах
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

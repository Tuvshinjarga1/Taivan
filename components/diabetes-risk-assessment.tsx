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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Activity,
  RefreshCw,
  AlertTriangle,
  Info,
  Droplet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveHealthData } from "@/lib/firebase";

interface DiabetesRiskAssessmentProps {
  userId: string;
}

export default function DiabetesRiskAssessment({
  userId,
}: DiabetesRiskAssessmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    Age: "",
    gender: "",
    polyuria: "", // шээс ихдэх
    polydipsia: "", // ам цангах
    suddenWeightLoss: "", // гэнэт жин хаях
    weakness: "", // ядралт
    polyphagia: "", // хоол их идэх
    genitalThrush: "", // бэлэг эрхтний мөөгөнцөр
    visualBlurring: "", // хараа бүрэлзэх
    itching: "", // загатнах
    irritability: "", // цочромтгой байдал
    delayedHealing: "", // шарх удаан эдгэх
    partialParesis: "", // хэсэгчилсэн саажилт
    muscleStiffness: "", // булчингийн хөшүүн байдал
    alopecia: "", // үс уналт
    obesity: "", // илүүдэл жинтэй эсэх
  });

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const runPrediction = async () => {
    // Validate form and display form data for debugging
    console.log("Form data:", formData);

    let hasMissingFields = false;
    let missingField = "";

    // Талбарын нэр - монгол нэрний харгалзаа
    const fieldLabels: Record<string, string> = {
      Age: "Нас",
      gender: "Хүйс",
      polyuria: "Шээс ихдэх",
      polydipsia: "Ам цангах",
      suddenWeightLoss: "Гэнэт жин хаях",
      weakness: "Ядралт",
      polyphagia: "Хоол их идэх",
      genitalThrush: "Бэлэг эрхтний мөөгөнцөр",
      visualBlurring: "Хараа бүрэлзэх",
      itching: "Загатнах",
      irritability: "Цочромтгой байдал",
      delayedHealing: "Шарх удаан эдгэх",
      partialParesis: "Хэсэгчилсэн саажилт",
      muscleStiffness: "Булчингийн хөшүүн байдал",
      alopecia: "Үс уналт",
      obesity: "Илүүдэл жинтэй эсэх",
    };

    // Check each field
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        hasMissingFields = true;
        missingField = fieldLabels[key] || key;
        break;
      }
    }

    if (hasMissingFields) {
      setError(`Бүх талбарыг бөглөнө үү. (${missingField} дутуу байна)`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Хэрэглэгчийн оруулсан мэдээллийг Firebase-д хадгалах
      // Энэ нь оролтын мэдээллийг хадгална
      const userInputData = {
        type: "diabetesAssessmentInput",
        timestamp: new Date().toISOString(),
        formData: { ...formData },
        deviceInfo: {
          userAgent: window.navigator.userAgent,
          language: window.navigator.language,
          platform: window.navigator.platform,
        },
      };

      // Оролтын мэдээллийг хадгалах
      await saveHealthData(userId, userInputData);

      // Prepare request data
      const requestData = {
        Age: parseInt(formData.Age),
        Gender: formData.gender === "Male" ? "Male" : "Female",
        Polyuria: formData.polyuria === "Yes" ? "Yes" : "No",
        Polydipsia: formData.polydipsia === "Yes" ? "Yes" : "No",
        "sudden weight loss":
          formData.suddenWeightLoss === "Yes" ? "Yes" : "No",
        weakness: formData.weakness === "Yes" ? "Yes" : "No",
        Polyphagia: formData.polyphagia === "Yes" ? "Yes" : "No",
        "Genital thrush": formData.genitalThrush === "Yes" ? "Yes" : "No",
        "visual blurring": formData.visualBlurring === "Yes" ? "Yes" : "No",
        Itching: formData.itching === "Yes" ? "Yes" : "No",
        Irritability: formData.irritability === "Yes" ? "Yes" : "No",
        "delayed healing": formData.delayedHealing === "Yes" ? "Yes" : "No",
        "partial paresis": formData.partialParesis === "Yes" ? "Yes" : "No",
        "muscle stiffness": formData.muscleStiffness === "Yes" ? "Yes" : "No",
        Alopecia: formData.alopecia === "Yes" ? "Yes" : "No",
        Obesity: formData.obesity === "Yes" ? "Yes" : "No",
      };

      console.log("API хүсэлт илгээх:", JSON.stringify(requestData));

      // Send request to API
      const response = await fetch(
        "https://ai-model-diabete-production.up.railway.app/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        // Алдааны мэдээлэл авах
        const errorText = await response.text();
        console.error(`API хүсэлт амжилтгүй: ${response.status}`, errorText);

        // Алдааны мессеж харуулах
        setError(
          `API хүсэлт амжилтгүй: ${response.status}. Алдааны мэдээлэл: ${
            errorText || "Мэдээлэл байхгүй"
          }`
        );
        throw new Error(`API хүсэлт амжилтгүй: ${response.status}`);
      }

      // Хариулт амжилттай
      const result = await response.json();
      console.log("API хариулт:", JSON.stringify(result));
      setPredictionResult(result);

      toast({
        title: "Оношилгоо дууслаа",
        description: "Таны чихрийн шижингийн оношилгоо амжилттай дууслаа",
      });

      // Save assessment data and results to Firebase
      const assessmentData = {
        type: "diabetesAssessmentComplete",
        timestamp: new Date().toISOString(),
        userInput: formData,
        requestData: requestData, // API рүү илгээсэн өгөгдөл
        symptoms: {
          age: parseInt(formData.Age),
          gender: formData.gender,
          hasPolyuria: formData.polyuria === "Yes",
          hasPolydipsia: formData.polydipsia === "Yes",
          hasSuddenWeightLoss: formData.suddenWeightLoss === "Yes",
          hasWeakness: formData.weakness === "Yes",
          hasPolyphagia: formData.polyphagia === "Yes",
          hasGenitalThrush: formData.genitalThrush === "Yes",
          hasVisualBlurring: formData.visualBlurring === "Yes",
          hasItching: formData.itching === "Yes",
          hasIrritability: formData.irritability === "Yes",
          hasDelayedHealing: formData.delayedHealing === "Yes",
          hasPartialParesis: formData.partialParesis === "Yes",
          hasMuscleStiffness: formData.muscleStiffness === "Yes",
          hasAlopecia: formData.alopecia === "Yes",
          hasObesity: formData.obesity === "Yes",
        },
        result: result,
        predictionPercentage: (result.prediction * 100).toFixed(1) + "%",
        isDiabetic: result.class === "Positive" || result.prediction > 0.5,
      };

      await saveHealthData(userId, assessmentData);
    } catch (error: any) {
      console.error("Error during prediction:", error);
      if (!error.message?.includes("API хүсэлт амжилтгүй")) {
        setError(
          `Оношилгоо хийх явцад алдаа гарлаа: ${
            error.message || "Тодорхойгүй алдаа"
          }`
        );
      }
      toast({
        title: "Алдаа гарлаа",
        description: `Оношилгоо хийх явцад алдаа гарлаа: ${
          error.message || "Тодорхойгүй алдаа"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get field label
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      Age: "Нас",
      Gender: "Хүйс",
      Polyuria: "Шээс ихдэх",
      polydipsia: "Ам цангах",
      suddenWeightLoss: "Гэнэт жин хаях",
      weakness: "Ядралт",
      polyphagia: "Хоол их идэх",
      genitalThrush: "Бэлэг эрхтний мөөгөнцөр",
      visualBlurring: "Хараа бүрэлзэх",
      Itching: "Загатнах",
      Irritability: "Цочромтгой байдал",
      delayedHealing: "Шарх удаан эдгэх",
      partialParesis: "Хэсэгчилсэн саажилт",
      muscleStiffness: "Булчингийн хөшүүн байдал",
      alopecia: "Үс уналт",
      Obesity: "Илүүдэл жинтэй эсэх",
    };
    return labels[field] || field;
  };

  // Generate form field
  const renderTextField = (field: string) => {
    // Талбарын нэрийг харгалзах formData ключ рүү хөрвүүлэх
    const fieldKey = getFieldKey(field);

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey}>{field}</Label>
        <Input
          id={fieldKey}
          type="number"
          value={formData[fieldKey as keyof typeof formData]}
          onChange={(e) => updateFormField(fieldKey, e.target.value)}
          className="w-full"
        />
      </div>
    );
  };

  // Монгол нэрийг formData ключ рүү хөрвүүлэх
  const getFieldKey = (fieldLabel: string): string => {
    const labelToKey: Record<string, string> = {
      Нас: "Age",
      Хүйс: "gender",
      "Шээс ихдэх": "polyuria",
      "Ам цангах": "polydipsia",
      "Гэнэт жин хаях": "suddenWeightLoss",
      Ядралт: "weakness",
      "Хоол их идэх": "polyphagia",
      "Бэлэг эрхтний мөөгөнцөр": "genitalThrush",
      "Хараа бүрэлзэх": "visualBlurring",
      Загатнах: "itching",
      "Цочромтгой байдал": "irritability",
      "Шарх удаан эдгэх": "delayedHealing",
      "Хэсэгчилсэн саажилт": "partialParesis",
      "Булчингийн хөшүүн байдал": "muscleStiffness",
      "Үс уналт": "alopecia",
      "Илүүдэл жинтэй эсэх": "obesity",
    };
    return labelToKey[fieldLabel] || fieldLabel;
  };

  // Generate dropdown field
  const renderDropdown = (field: string, options: string[]) => {
    // Талбарын нэрийг харгалзах formData ключ рүү хөрвүүлэх
    const fieldKey = getFieldKey(field);

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey}>{field}</Label>
        <Select
          value={formData[fieldKey as keyof typeof formData]}
          onValueChange={(value) => updateFormField(fieldKey, value)}
        >
          <SelectTrigger id={fieldKey}>
            <SelectValue placeholder={`Сонгоно уу`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "Yes" ? "Тийм" : option === "No" ? "Үгүй" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Generate prediction result
  const renderPredictionResult = () => {
    // API хариулт class:Negative/Positive, prediction:0-1 хооронд утга буцаадаг
    const isPositive =
      predictionResult &&
      (predictionResult.class === "Positive" ||
        predictionResult.prediction > 0.5);

    return (
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Оношилгооны үр дүн</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div
              className={`
                inline-flex items-center justify-center p-4 rounded-full mb-4
                ${
                  isPositive
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }
              `}
            >
              {isPositive ? (
                <AlertTriangle className="h-8 w-8" />
              ) : (
                <Activity className="h-8 w-8" />
              )}
            </div>

            <h3 className="text-xl font-bold mb-3">
              {isPositive
                ? "Чихрийн шижин байх магадлалтай"
                : "Чихрийн шижингийн эрсдэл бага"}
            </h3>

            <p className="text-muted-foreground">
              {isPositive
                ? "Таны оруулсан мэдээлэлд үндэслэн чихрийн шижин байх магадлалтай байна."
                : "Таны оруулсан мэдээлэлд үндэслэн чихрийн шижингийн эрсдэл бага байна."}
            </p>

            {/* Магадлалын хувь харуулах */}
            <p className="mt-2 text-sm">
              Магадлал: {(predictionResult.prediction * 100).toFixed(1)}%
            </p>

            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Зөвлөмж</AlertTitle>
              <AlertDescription>
                {isPositive
                  ? "Эмчид яаралтай үзүүлж, нарийвчилсан шинжилгээ хийлгэхийг зөвлөж байна."
                  : "Эрүүл амьдралын хэв маягаа хадгалж, эмчид тогтмол үзүүлээрэй."}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPredictionResult(null)}
            >
              Дахин оношилгоо хийх
            </Button>
            <Button
              className="w-full"
              onClick={() => router.push("/diabetes-information")}
            >
              Чихрийн шижингийн талаар дэлгэрэнгүй мэдээлэл авах
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
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
        <h1 className="text-2xl font-bold">Чихрийн шижингийн оношилгоо</h1>
      </div>

      {!predictionResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Чихрийн шижингийн оношилгоо</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Чухал мэдээлэл</AlertTitle>
              <AlertDescription>
                Энэхүү оношилгоо нь зөвхөн мэдээллийн зорилготой бөгөөд
                мэргэжлийн эмчийн оношилгоог орлохгүй. Үнэн зөв оношилгоо,
                эмчилгээний талаар үргэлж эмчтэйгээ зөвлөлдөөрэй.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Алдаа</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {renderTextField("Нас")}
              {renderDropdown("Хүйс", ["Male", "Female"])}
              {renderDropdown("Шээс ихдэх", ["Yes", "No"])}
              {renderDropdown("Ам цангах", ["Yes", "No"])}
              {renderDropdown("Гэнэт жин хаях", ["Yes", "No"])}
              {renderDropdown("Ядралт", ["Yes", "No"])}
              {renderDropdown("Хоол их идэх", ["Yes", "No"])}
              {renderDropdown("Бэлэг эрхтний мөөгөнцөр", ["Yes", "No"])}
              {renderDropdown("Хараа бүрэлзэх", ["Yes", "No"])}
              {renderDropdown("Загатнах", ["Yes", "No"])}
              {renderDropdown("Цочромтгой байдал", ["Yes", "No"])}
              {renderDropdown("Шарх удаан эдгэх", ["Yes", "No"])}
              {renderDropdown("Хэсэгчилсэн саажилт", ["Yes", "No"])}
              {renderDropdown("Булчингийн хөшүүн байдал", ["Yes", "No"])}
              {renderDropdown("Үс уналт", ["Yes", "No"])}
              {renderDropdown("Илүүдэл жинтэй эсэх", ["Yes", "No"])}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={runPrediction}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Уншиж байна...
                </>
              ) : (
                "Оношилгоо хийх"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        renderPredictionResult()
      )}
    </div>
  );
}

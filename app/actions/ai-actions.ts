"use server";

import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export async function generateHealthInsightsAction(healthData: {
  heartRate: number;
  steps: number;
  sleep: number;
  calories: number;
}) {
  try {
    // Check if we're in development mode and if we have actual API access
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasGroqApiKey =
      process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "";

    // If we're in development mode or don't have an API key, use a simulated response
    if (isDevelopment || !hasGroqApiKey) {
      // Simulate API call delay for realistic behavior
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a response based on the health data values
      let healthStatus = "сайн";
      let heartRateComment = "";
      let stepsComment = "";
      let sleepComment = "";

      // Analyze heart rate
      if (healthData.heartRate > 100) {
        healthStatus = "анхаарал хандуулах шаардлагатай";
        heartRateComment = "Таны зүрхний цохилт хэт өндөр байна. ";
      } else if (healthData.heartRate < 60) {
        healthStatus = "анхаарал хандуулах шаардлагатай";
        heartRateComment = "Таны зүрхний цохилт хэт бага байна. ";
      }

      // Analyze steps
      if (healthData.steps < 5000) {
        stepsComment =
          "Таны өдрийн алхалт бага байна. Идэвхтэй хөдөлгөөн нэмэгдүүлэхийг зөвлөж байна. ";
      } else if (healthData.steps > 10000) {
        stepsComment =
          "Таны өдрийн алхалт сайн байна. Үүнийгээ хадгалахыг зөвлөж байна. ";
      }

      // Analyze sleep
      if (healthData.sleep < 6) {
        sleepComment =
          "Таны нойр хангалтгүй байна. Дор хаяж 7-8 цаг унтахыг зөвлөж байна. ";
      } else if (healthData.sleep > 9) {
        sleepComment = "Таны нойр хэт их байж магадгүй. ";
      }

      const simulatedInsight = `
Ерөнхий эрүүл мэндийн байдлын дүгнэлт:
Таны эрүүл мэндийн ерөнхий байдал ${healthStatus} байна. ${heartRateComment}${stepsComment}${sleepComment}

Зөвлөмжүүд:
1. Өдөрт дор хаяж 30 минут дасгал хийх, эсвэл 8,000-10,000 алхам алхахыг зөвлөж байна. Энэ нь зүрхний үйл ажиллагааг сайжруулж, биеийн жинг хянахад тусална.
2. Унтахаасаа өмнө цахим хэрэгсэл ашиглахаа зогсоож, тогтсон цагт унтах дадал хэвшүүлэх. Нойрны чанарыг сайжруулахын тулд өрөөгөө харанхуй, тайван байлгах.

Анхаарах зүйл:
${
  heartRateComment
    ? "Зүрхний цохилтын хэмжээ хэвийн бус байгаа тул эмчид үзүүлэхийг зөвлөж байна."
    : healthData.steps < 3000
    ? "Хөдөлгөөний дутагдал нь зүрх судасны өвчин, чихрийн шижин, таргалалт зэрэг эрсдэлийг нэмэгдүүлдэг."
    : healthData.sleep < 5
    ? "Байнгын нойргүйдэл нь дархлааны систем, оюун санааны эрүүл мэндэд сөргөөр нөлөөлж, бодисын солилцоог өөрчилдөг."
    : "Одоогоор ноцтой анхаарах зүйл ажиглагдахгүй байна, гэхдээ эрүүл амьдралын хэв маягаа хадгалах нь чухал."
}
      `;

      return { success: true, insights: simulatedInsight };
    }

    // If not in development and we have an API key, use the actual AI service
    const prompt = `
    Эрүүл мэндийн туслах ажилтан хэлбэрээр дараах эрүүл мэндийн үзүүлэлтүүдийг задлан шинжилж, хувь хүн рүү чиглэсэн оновчтой зөвлөгөө өгнө үү:
    
    Зүрхний цохилт: ${healthData.heartRate} удаа/мин
    Алхалт: ${healthData.steps} алхам
    Нойр: ${healthData.sleep} цаг
    Шатсан калори: ${healthData.calories} калори
    
    Дараах мэдээллийг оруулна уу:
    1. Эдгээр үзүүлэлтүүд дээр үндэслэн ерөнхий эрүүл мэндийн байдлын товч дүгнэлт
    2. Эрүүл мэндээ сайжруулах хоёр тодорхой зөвлөмж
    3. Анхаарах шаардлагатай нэг боломжит эрүүл мэндийн эрсдэл (хэрэв байгаа бол)
    
    Хариуг монгол хэл дээр бичнэ үү.
    `;

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: prompt,
      maxTokens: 500,
    });

    return { success: true, insights: text };
  } catch (error) {
    console.error("Error generating health insights:", error);
    return {
      success: false,
      error: "Эрүүл мэндийн дүгнэлт гаргахад алдаа гарлаа",
    };
  }
}

export async function analyzeFoodImageAction(imageBase64: string) {
  try {
    // Extract the base64 data from the data URL if needed
    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;

    // Check if we have the Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      // Бүтэлгүйтлийн хариу буцаах
      return {
        success: false,
        error:
          "Gemini API түлхүүр олдсонгүй. Системийн админтай холбогдоно уу.",
      };
    }

    // Initialize the Gemini AI with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Configure safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Use the gemini-1.5-flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
    });

    const prompt = `
      Зурган дээрх хоолыг задлан шинжилж, дараах мэдээллийг зөвхөн JSON форматаар гарга:

      1. Хоол бүрийн нэр (монгол хэл дээр)
      2. Порцын хэмжээ (ойролцоогоор, грамм эсвэл унцаар)
      3. Нэг порц дахь калорийн хэмжээ (тоо)

      Хариултаа **зөвхөн дараах JSON формат** ашиглан өгнө үү. Өөр тайлбар, текст бүү нэм.
      {
        "foodItems": [
          {
            "name": "Хоолны нэр",
            "portion": "Порцын хэмжээ (жишээ нь: 100гр эсвэл 3oz)",
            "calories": 000
          }
        ]
      }

      Зөвхөн JSON форматаар хариулт өгнө үү.
    `;

    // Prepare the image part
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg", // Assume JPEG, but could be adapted based on input
      },
    };

    // Generate content with the image and prompt
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const textResponse = response.text();

    try {
      // Try to extract JSON from response if it contains additional text
      // First, handle the case where response is wrapped in markdown code blocks
      let cleanedResponse = textResponse;

      // Remove markdown code blocks if present (```json ... ```)
      const markdownCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
      const markdownMatches = markdownCodeBlockRegex.exec(textResponse);

      if (markdownMatches && markdownMatches[1]) {
        cleanedResponse = markdownMatches[1].trim();
      }

      // Then try to extract JSON objects
      const jsonRegex = /{[\s\S]*?}/g;
      const jsonMatches = cleanedResponse.match(jsonRegex);

      let jsonResponse;

      if (jsonMatches && jsonMatches.length > 0) {
        // Try to parse the first found JSON object
        try {
          jsonResponse = JSON.parse(jsonMatches[0]);
        } catch (e) {
          // If that fails, try to parse the entire cleaned response
          jsonResponse = JSON.parse(cleanedResponse);
        }
      } else {
        // No JSON found, try parsing the entire cleaned response
        jsonResponse = JSON.parse(cleanedResponse);
      }

      // Ensure the response has the expected structure
      if (!jsonResponse.foodItems || !Array.isArray(jsonResponse.foodItems)) {
        throw new Error("Invalid JSON structure: missing foodItems array");
      }

      // Sanitize and convert food items data
      const sanitizedFoodItems = jsonResponse.foodItems.map((item: any) => {
        // Ensure calories is a number
        let calories = 0;
        if (typeof item.calories === "number") {
          calories = item.calories;
        } else if (typeof item.calories === "string") {
          // Extract first number from string if it contains text
          const match = item.calories.match(/\d+/);
          if (match) {
            calories = parseInt(match[0]);
          }
        }

        return {
          name: item.name || "Тодорхойлогдоогүй хоол",
          portion: item.portion || "1 порц",
          calories: calories,
        };
      });

      // Calculate total calories
      const totalCalories = sanitizedFoodItems.reduce(
        (sum: number, item: any) => sum + item.calories,
        0
      );

      return {
        success: true,
        data: {
          foodItems: sanitizedFoodItems,
          totalCalories,
          rawResponse: textResponse,
        },
      };
    } catch (parseError) {
      console.error("Error parsing AI response as JSON:", parseError);
      console.log("Raw response:", textResponse);

      // Attempt to extract food information using regex pattern matching
      const extractedItems = extractFoodItemsFromText(textResponse);

      if (extractedItems.length > 0) {
        const totalCalories = extractedItems.reduce(
          (sum, item) => sum + item.calories,
          0
        );

        return {
          success: true,
          data: {
            foodItems: extractedItems,
            totalCalories,
            rawResponse: textResponse,
          },
        };
      }

      // If all parsing attempts fail
      return {
        success: false,
        error:
          "Хоолны мэдээллийг зөв хэлбэрээр задалж чадсангүй. Дахин оролдоно уу.",
        rawResponse: textResponse,
      };
    }
  } catch (error) {
    console.error("Error analyzing food image:", error);
    return {
      success: false,
      error: "Хоолны зургийг задлан шинжлэхэд алдаа гарлаа",
    };
  }
}

// Regex-based function to extract food items from non-JSON text
function extractFoodItemsFromText(
  text: string
): Array<{ name: string; portion: string; calories: number }> {
  const foodItems = [];

  // Try to find food names, portions and calories
  const foodNameRegex = /([А-ЯӨҮа-яөү\s]+)[\s\:]+/g;
  const portionRegex = /(\d+(?:\.\d+)?)\s*(?:гр|г|мл|порц|ширхэг|аяга)/g;
  const caloriesRegex = /(\d+(?:\.\d+)?)\s*(?:кал|калори|ккал)/g;

  // First attempt: try to match structured content
  const foodNames = Array.from(text.matchAll(foodNameRegex)).map((m) =>
    m[1].trim()
  );
  const portions = Array.from(text.matchAll(portionRegex)).map((m) =>
    m[0].trim()
  );
  const calories = Array.from(text.matchAll(caloriesRegex)).map((m) =>
    parseInt(m[1])
  );

  // If we have at least food names
  if (foodNames.length > 0) {
    for (let i = 0; i < foodNames.length; i++) {
      foodItems.push({
        name: foodNames[i],
        portion: i < portions.length ? portions[i] : "1 порц",
        calories: i < calories.length ? calories[i] : 200, // Default calories if not found
      });
    }
  } else {
    // Look for common Mongolian food items
    const commonFoods = [
      {
        pattern: /бууз/i,
        name: "Монгол бууз",
        portion: "5 ширхэг",
        calories: 600,
      },
      {
        pattern: /хуушуур/i,
        name: "Хуушуур",
        portion: "3 ширхэг",
        calories: 750,
      },
      { pattern: /цуйван/i, name: "Цуйван", portion: "1 порц", calories: 450 },
      { pattern: /гуляш/i, name: "Гуляш", portion: "1 порц", calories: 350 },
      { pattern: /будаа/i, name: "Будаа", portion: "1 аяга", calories: 200 },
      { pattern: /мах/i, name: "Мах", portion: "100гр", calories: 250 },
      {
        pattern: /салат/i,
        name: "Ногооны салат",
        portion: "1 порц",
        calories: 100,
      },
      { pattern: /шөл/i, name: "Шөл", portion: "1 аяга", calories: 150 },
    ];

    for (const food of commonFoods) {
      if (food.pattern.test(text)) {
        foodItems.push({
          name: food.name,
          portion: food.portion,
          calories: food.calories,
        });
      }
    }

    // If still no items detected, add a default item
    if (foodItems.length === 0) {
      foodItems.push({
        name: "Тодорхойлогдоогүй хоол",
        portion: "1 порц",
        calories: 250,
      });
    }
  }

  return foodItems;
}

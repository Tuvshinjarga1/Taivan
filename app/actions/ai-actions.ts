"use server";

import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

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

    // For development or when we don't have API access, just use simulation
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a simulated response based on the image
    // In a real implementation, this would come from the AI model
    const simulatedFoodItems = [
      {
        name: "Шарсан тахианы цээж",
        portion: "4 унц (113гр)",
        calories: 165,
      },
      {
        name: "Бор будаа",
        portion: "1 аяга (195гр)",
        calories: 216,
      },
      {
        name: "Жигнэсэн брокколи",
        portion: "1 аяга (91гр)",
        calories: 55,
      },
      {
        name: "Оливын тос (ногоон дээр)",
        portion: "1 цайны халбага (5мл)",
        calories: 40,
      },
    ];

    const totalCalories = simulatedFoodItems.reduce(
      (sum, item) => sum + item.calories,
      0
    );

    return {
      success: true,
      data: {
        foodItems: simulatedFoodItems,
        totalCalories,
      },
    };

    // In a real implementation with Groq, you would use something like:
    /*
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: prompt,
      maxTokens: 1000,
      // You would need to include the image data in a format the model can process
    })
    
    // Parse the JSON response
    const result = JSON.parse(text)
    return { success: true, data: result }
    */
  } catch (error) {
    console.error("Error analyzing food image:", error);
    return {
      success: false,
      error: "Хоолны зургийг задлан шинжлэхэд алдаа гарлаа",
    };
  }
}

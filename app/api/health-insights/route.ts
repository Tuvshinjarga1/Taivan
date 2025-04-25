import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { healthData } = await req.json()

    const prompt = `
    As a health assistant, analyze the following health metrics and provide personalized insights and recommendations:
    
    Heart Rate: ${healthData.heartRate} bpm
    Steps: ${healthData.steps} steps
    Sleep: ${healthData.sleep} hours
    Calories Burned: ${healthData.calories} calories
    
    Please provide:
    1. A brief analysis of the overall health status based on these metrics
    2. Two specific recommendations to improve health
    3. One potential health concern to be aware of, if any
    `

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: prompt,
      maxTokens: 500,
    })

    return Response.json({ insights: text })
  } catch (error) {
    console.error("Error generating health insights:", error)
    return Response.json({ error: "Failed to generate health insights" }, { status: 500 })
  }
}

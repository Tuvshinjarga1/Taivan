import FoodCalorieAnalyzer from "@/components/food-calorie-analyzer"

export default function FoodAnalyzerPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123" // Placeholder user ID

  return (
    <main className="min-h-screen bg-gray-50">
      <FoodCalorieAnalyzer userId={userId} />
    </main>
  )
}

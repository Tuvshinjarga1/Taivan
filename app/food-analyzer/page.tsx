import FoodCalorieAnalyzer from "@/components/food-calorie-analyzer";

export default function FoodAnalyzerPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123"; // Placeholder user ID

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-2 sm:px-4 max-w-full sm:max-w-screen-lg py-3 sm:py-6">
        <FoodCalorieAnalyzer userId={userId} />
      </div>
    </main>
  );
}

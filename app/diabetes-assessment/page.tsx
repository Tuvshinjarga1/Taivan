import DiabetesRiskAssessment from "@/components/diabetes-risk-assessment"

export default function DiabetesAssessmentPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123" // Placeholder user ID

  return (
    <main className="min-h-screen bg-gray-50">
      <DiabetesRiskAssessment userId={userId} />
    </main>
  )
}

import DiabetesInformation from "@/components/diabetes-information"

export default function DiabetesInformationPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123" // Placeholder user ID

  return (
    <main className="min-h-screen bg-gray-50">
      <DiabetesInformation userId={userId} />
    </main>
  )
}

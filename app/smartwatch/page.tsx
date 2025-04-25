import SmartwatchConnection from "@/components/smartwatch-connection"

export default function SmartwatchPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123" // Placeholder user ID

  return (
    <main className="min-h-screen bg-gray-50">
      <SmartwatchConnection userId={userId} />
    </main>
  )
}

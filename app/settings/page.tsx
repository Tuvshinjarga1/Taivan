import Settings from "@/components/settings"

export default function SettingsPage() {
  // In a real app, you would get the userId from the authenticated user
  const userId = "user123" // Placeholder user ID

  return (
    <main className="min-h-screen bg-gray-50">
      <Settings userId={userId} />
    </main>
  )
}

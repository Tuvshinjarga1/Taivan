import DiabetesInformation from "@/components/diabetes-information";

export default function DiabetesInformationPage() {
  // Бодит апп-д хэрэглэгчийн ID-г баталгаажуулалтаас авна
  const userId = "user123"; // Туршилтын хэрэглэгчийн ID

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-2 sm:px-4 max-w-full sm:max-w-screen-lg py-3 sm:py-6">
        <DiabetesInformation userId={userId} />
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Бүртгэлийн үед алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Эрүүл мэндийн хяналтын систем
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Шинэ бүртгэл үүсгэх
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          suppressHydrationWarning
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Нэр
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Нэр"
                value={name}
                onChange={(e) => setName(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                И-мэйл хаяг
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="И-мэйл хаяг"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Нууц үг"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Нууц үгээ баталгаажуулах
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Нууц үгээ баталгаажуулах"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                suppressHydrationWarning
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              suppressHydrationWarning
            >
              {isLoading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Бүртгэлтэй юу?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Нэвтрэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Shirt, ArrowLeft } from "lucide-react";
import { employeeAuthService } from "@/services/employeeAuth.service";

export default function EmployeeForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await employeeAuthService.forgotPassword(email);
      setMessage(result.message);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <Shirt className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary tracking-tight">FreshPress</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan email Anda untuk menerima link reset password.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {message ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg" role="alert">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@freshpress.id"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/employee/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </div>
      </div>
    </main>
  );
}

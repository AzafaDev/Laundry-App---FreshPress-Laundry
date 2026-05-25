// app/employee/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, EyeOff, Eye, ArrowRight, Shirt } from "lucide-react";
import { useEmployeeAuth } from "@/hooks/useEmployeeAuth";

export default function EmployeeLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useEmployeeAuth();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    login({ email, password });
  };

  const errorMessage = loginError
    ? (loginError as any)?.response?.data?.message ||
      "Login gagal. Periksa email dan password Anda."
    : null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <Shirt className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary tracking-tight">
              FreshPress
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Portal Staff</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk ke akun karyawan Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
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

            {/* Password field */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isLoggingIn ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Masuk <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Catatan kecil */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} FreshPress Laundry. Hak akses karyawan.
        </p>
      </div>
    </main>
  );
}

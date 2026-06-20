"use client";

import { Eye, EyeOff, LogIn, Shirt, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAdminAuth();

  const { _hasHydrated, user } = useEmployeeAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  let errorMessage: string | null = null;
  if (loginError) {
    errorMessage =
      (loginError as any)?.response?.data?.message ||
      "Login gagal. Periksa email dan password Anda.";
  }

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-lg mb-4">
            <Shirt className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            FreshPress Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Portal manajemen internal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Card header stripe */}
          <div className="bg-primary px-6 py-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-white/80" />
            <span className="text-white font-semibold text-sm tracking-wide">
              Admin Access
            </span>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {errorMessage && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2"
                  role="alert"
                >
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="admin@freshpress.id"
                    autoComplete="username"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all placeholder:text-gray-400"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 pr-11 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2 shadow-sm"
              >
                {isLoggingIn ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Role info footer */}
          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              Hanya untuk <span className="font-medium text-gray-500">Super Admin</span> &amp; <span className="font-medium text-gray-500">Outlet Admin</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} FreshPress Laundry · Internal Use Only
        </p>
      </div>
    </main>
  );
}

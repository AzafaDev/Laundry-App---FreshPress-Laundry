"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, EyeOff, Eye, ArrowRight, Shirt } from "lucide-react";
import { useEmployeeAuth } from "@/hooks/useEmployeeAuth";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useRouter } from "next/navigation";

const SAFE_LOGIN_ERRORS = new Set([
  "Email atau password salah.",
  "Akun tidak ditemukan.",
  "Akun Anda tidak aktif.",
  "Terlalu banyak percobaan login. Coba lagi nanti.",
]);

function getSafeLoginError(err: unknown): string {
  const msg = (err as any)?.response?.data?.message;
  if (msg && SAFE_LOGIN_ERRORS.has(msg)) return msg;
  return "Login gagal. Periksa email dan password Anda.";
}

export default function EmployeeLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [throttled, setThrottled] = useState(false);
  const { login, isLoggingIn, loginError } = useEmployeeAuth();
  const { accessToken, user, _hasHydrated } = useEmployeeAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated || !accessToken || !user) return;
    const paths: Record<string, string> = {
      super_admin: "/dashboard/admin",
      outlet_admin: "/dashboard/outlet-admin",
      driver: "/dashboard/driver",
      washing_worker: "/dashboard/worker",
      ironing_worker: "/dashboard/worker",
      packing_worker: "/dashboard/worker",
    };
    router.replace(paths[user.role] ?? "/dashboard/admin");
  }, [_hasHydrated, accessToken, user, router]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password || throttled || isLoggingIn) return;
    setThrottled(true);
    setTimeout(() => setThrottled(false), 1000);
    login({ email, password });
  };

  const errorMessage = loginError ? getSafeLoginError(loginError) : null;

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #00685f 0%, #00534b 55%, #003d38 100%)",
      }}
    >
      {/* Soft radial highlight top-right */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #89f5e7 0%, transparent 70%)",
        }}
      />

      <style>{`@keyframes card-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="w-full max-w-100 relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <Shirt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            FreshPress
          </h1>
          <p className="text-white/60 mt-2 text-sm font-medium tracking-wide uppercase">
            Portal Staff
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "card-enter 0.4s ease-out" }}
        >
          {/* Teal accent bar */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, #00685f 0%, #89f5e7 60%, #00685f 100%)",
            }}
          />

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Selamat datang 👋
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Masuk untuk melanjutkan ke dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div
                  className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-gray-500 uppercase tracking-wider block"
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
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm placeholder:text-gray-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-gray-500 uppercase tracking-wider block"
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
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm placeholder:text-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

              <div className="flex justify-end -mt-1">
                <Link
                  href="/employee/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || throttled}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
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
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          © {new Date().getFullYear()} FreshPress Laundry. Hak akses karyawan.
        </p>
      </div>
    </main>
  );
}

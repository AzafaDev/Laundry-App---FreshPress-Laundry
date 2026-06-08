"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, EyeOff, Eye, Shirt } from "lucide-react";
import { employeeAuthService } from "@/services/employeeAuth.service";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/employee/forgot-password");
  }, [token, router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await employeeAuthService.resetPassword(token!, newPassword);
      router.push("/employee/login");
    } catch (err: unknown) {
      const status = (err as any)?.response?.status;
      if (status === 400 || status === 410 || status === 404) {
        setTokenInvalid(true);
        setError("Token tidak valid atau sudah kadaluarsa.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "card-enter 0.4s ease-out" }}
    >
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, #00685f 0%, #89f5e7 60%, #00685f 100%)",
        }}
      />

      <div className="p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Buat Password Baru
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan password baru Anda di bawah.
        </p>

        {tokenInvalid ? (
          <div className="space-y-4">
            <div
              className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
              role="alert"
            >
              {error}
            </div>
            <a
              href="/employee/forgot-password"
              className="block w-full text-center py-3 bg-primary text-white font-bold rounded-xl text-sm hover:brightness-105 transition-all"
            >
              Minta Link Reset Baru
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="text-xs font-bold text-gray-500 uppercase tracking-wider block"
              >
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm placeholder:text-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-gray-500 uppercase tracking-wider block"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm placeholder:text-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Simpan Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function EmployeeResetPasswordPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #00685f 0%, #00534b 55%, #003d38 100%)",
      }}
    >
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

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}>
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #00685f 0%, #89f5e7 60%, #00685f 100%)" }} />
              <div className="p-8 animate-pulse h-64" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-xs text-white/30 mt-6">
          © {new Date().getFullYear()} FreshPress Laundry. Hak akses karyawan.
        </p>
      </div>
    </main>
  );
}

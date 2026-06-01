"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Shirt, ArrowLeft } from "lucide-react";
import { employeeAuthService } from "@/services/employeeAuth.service";

export default function EmployeeForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [throttled, setThrottled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || throttled) return;
    setThrottled(true);
    setTimeout(() => setThrottled(false), 1000);
    setIsLoading(true);
    setError(null);
    try {
      await employeeAuthService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Card */}
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
              Lupa Password?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Masukkan email Anda dan kami akan mengirim link reset.
            </p>

            {sent ? (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-4 rounded-xl">
                Jika email terdaftar, link reset akan dikirimkan. Silakan cek
                inbox Anda.
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

                <button
                  type="submit"
                  disabled={isLoading || throttled}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
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
        </div>

        <div className="text-center mt-5">
          <Link
            href="/employee/login"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </div>
      </div>
    </main>
  );
}

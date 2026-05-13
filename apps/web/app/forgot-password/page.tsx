"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Shirt, Mail, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // TODO: integrate actual API call
      // await axiosInstance.post('/auth/forgot-password', { email });
      console.log("Forgot password request:", { email });
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Auth Shell: no TopBar/Navigation for transactional focus */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-2xl">
        <div className="max-w-[440px] w-full flex flex-col items-center">
          {/* Brand Anchor */}
          <div className="mb-xl flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center mb-md shadow-sm">
              <Shirt className="text-on-primary-container w-8 h-8" />
            </div>
            <h1 className="text-headline-md font-headline-md text-primary tracking-tight">
              FreshPress Laundry
            </h1>
          </div>

          {/* Content Card */}
          <div className="w-full bg-surface border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm">
            {submitted ? (
              /* Success State */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-container rounded-full flex items-center justify-center">
                  <Mail className="text-on-primary-container w-8 h-8" />
                </div>
                <h2 className="text-headline-md font-headline-md text-on-surface">
                  Cek Email Anda
                </h2>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  Kami telah mengirimkan instruksi pemulihan kata sandi ke{" "}
                  <span className="font-semibold text-primary">{email}</span>.
                  Tautan ini berlaku selama 60 menit.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="text-label-md font-label-md text-primary hover:text-primary-container transition-colors"
                >
                  Kirim ke email lain
                </button>
              </div>
            ) : (
              /* Form State */
              <>
                <div className="text-center mb-lg">
                  <h2 className="text-headline-md font-headline-md text-on-surface mb-sm">
                    Lupa Kata Sandi?
                  </h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">
                    Masukkan email Anda yang terdaftar untuk menerima instruksi
                    pemulihan kata sandi.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-lg">
                  <div className="space-y-xs">
                    <label
                      htmlFor="email"
                      className="text-label-md font-label-md text-on-surface-variant block ml-1"
                    >
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        className="block w-full pl-11 pr-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-bold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Kirim Instruksi
                        <ArrowRight className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col items-center">
                  <Link
                    href="/login"
                    className="group flex items-center gap-xs text-label-md font-label-md text-primary hover:text-primary-container transition-colors"
                  >
                    <ArrowLeft className="w-[18px] h-[18px] group-hover:-translate-x-0.5 transition-transform" />
                    Kembali ke Halaman Login
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Visual Support Element (desktop) */}
          <div className="mt-2xl hidden md:block opacity-40 pointer-events-none">
            <div className="flex gap-md">
              <div className="w-24 h-1 bg-outline-variant rounded-full" />
              <div className="w-12 h-1 bg-primary rounded-full" />
              <div className="w-24 h-1 bg-outline-variant rounded-full" />
            </div>
          </div>
        </div>
      </main>

      {/* Contextual Footer */}
      <footer className="py-lg px-margin-mobile text-center">
        <p className="text-label-sm font-label-sm text-outline">
          © 2024 FreshPress Laundry. Layanan Kebersihan Profesional.
        </p>
      </footer>

      {/* Decorative Desktop Side Panel */}
      <aside className="hidden lg:block fixed right-0 top-0 bottom-0 w-1/3 bg-surface-container-low overflow-hidden">
        <div className="h-full w-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <img
            alt="Modern laundry interior"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcKijLWiR5tzSoaYaMvzjuyRIu23MSF9fAfYnkjpFFwDrQY6fJ1SNBt3ZdzeTr77Jc71EAGI-lq0Fvtssc7_5SuIj33RgsMZmpQt75OIi9GhRvDgCv1sczlJtJxMWQ58rIaVjUKP_oqQKwXNSyIikutGbIru-tXZyobepDLjfGQWeVL5iZwES0UDo_lVBLlqcMfENOmL_4oeJVxnIiSHqMUCQ4__ZjTcyaE03crnzfxl_aBRCJoUKExGgxv6pzZf8L5ZBrZJjBHD8"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
          <div className="absolute bottom-16 left-12 right-12">
            <div className="bg-white/90 backdrop-blur-md p-lg rounded-xl border border-white/20 shadow-lg">
              <ShieldCheck className="text-primary w-6 h-6 mb-sm" />
              <h3 className="text-headline-sm font-headline-sm text-on-surface mb-xs">
                Keamanan Akun Anda
              </h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Kami menjaga privasi Anda dengan serius. Tautan pemulihan ini
                hanya akan berlaku selama 60 menit demi keamanan akun Anda.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

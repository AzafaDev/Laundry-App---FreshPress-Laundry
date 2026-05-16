"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shirt,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Info,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";

/* ------------------------------------------------------------------ */
/*  Tipe                                                               */
/* ------------------------------------------------------------------ */

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  server?: string;
  email?: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  /* ---- password form state ---- */
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ---- resend form state ---- */
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const passwordCriteria = {
    minLength: password.length >= 8,
    hasLetterAndNumber: /[a-zA-Z]/.test(password) && /\d/.test(password),
  };

  /* ---- submit verify ---- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {};
    if (password.length < 8) errs.password = "Password minimal 8 karakter.";
    else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
      errs.password = "Password harus mengandung huruf dan angka.";
    if (password !== confirmPassword)
      errs.confirmPassword = "Konfirmasi password tidak cocok.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await axiosInstance.post("/v1/customer/auth/verify", { token, password });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Verifikasi gagal. Token mungkin sudah kadaluarsa.";
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ---- resend verification ---- */
  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setErrors({ email: "Email wajib diisi." });
      return;
    }
    setResendLoading(true);
    try {
      await axiosInstance.post("/v1/customer/auth/resend-verification", {
        email: resendEmail,
      });
      setResendSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengirim ulang. Coba lagi.";
      setErrors({ email: msg });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center justify-center h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shirt className="text-primary w-7 h-7" />
            <span className="text-xl font-bold tracking-tight text-primary">
              FreshPress Laundry
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[520px] w-full">
          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-[2rem] p-6 md:p-8 shadow-sm">

            {/* SUCCESS STATE */}
            {success && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-primary">Verifikasi Berhasil!</h2>
                <p className="text-on-surface-variant">Akun Anda telah aktif. Selamat bergabung dengan FreshPress!</p>
                <Link href="/login" className="inline-block mt-4 bg-primary text-on-primary py-3 px-8 rounded-2xl font-bold hover:opacity-90 transition-all">
                  Masuk Sekarang
                </Link>
              </div>
            )}

            {/* TOKEN PRESENT: Password form */}
            {!success && token && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary-container rounded-full flex items-center justify-center">
                    <Lock className="w-7 h-7 text-on-primary-container" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">Buat Password</h2>
                  <p className="text-sm text-on-surface-variant">Atur password untuk melengkapi pendaftaran akun Anda.</p>
                </div>

                {errors.server && (
                  <div className="flex items-start gap-2 bg-error-container/30 border border-error/30 text-error text-sm px-4 py-3 rounded-xl mb-4" role="alert">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      {errors.server}
                      {errors.server.includes("kadaluarsa") && (
                        <p className="mt-1">
                          <Link href="/verify" className="underline font-medium">Minta link verifikasi baru</Link>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-on-surface-variant block">Password Baru</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                      <input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                        className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-2xl bg-surface transition-all outline-none text-base ${errors.password ? "border-error" : "border-outline-variant"} focus:border-primary focus:ring-4 focus:ring-primary/10`}
                      />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                        {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-error ml-1" role="alert">{errors.password}</p>}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-on-surface-variant block">Konfirmasi Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Ulangi password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                        className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-2xl bg-surface transition-all outline-none text-base ${errors.confirmPassword ? "border-error" : "border-outline-variant"} focus:border-primary focus:ring-4 focus:ring-primary/10`}
                      />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-error ml-1" role="alert">{errors.confirmPassword}</p>}
                  </div>

                  <div className="bg-surface-container p-4 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                      <Info className="w-4 h-4" />Kriteria Password:
                    </p>
                    <ul className="space-y-1">
                      <li className={`flex items-center gap-2 text-xs ${passwordCriteria.minLength ? "text-primary" : "text-on-surface-variant opacity-70"}`}>
                        {passwordCriteria.minLength ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                        Minimal 8 karakter
                      </li>
                      <li className={`flex items-center gap-2 text-xs ${passwordCriteria.hasLetterAndNumber ? "text-primary" : "text-on-surface-variant opacity-70"}`}>
                        {passwordCriteria.hasLetterAndNumber ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                        Kombinasi huruf &amp; angka
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Verifikasi &amp; Aktifkan Akun <ArrowRight className="w-5 h-5" /></>)}
                  </button>
                </form>
              </>
            )}

            {/* NO TOKEN: Resend form */}
            {!success && !token && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary-container rounded-full flex items-center justify-center">
                    <Mail className="w-7 h-7 text-on-primary-container" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Verifikasi Email</h2>
                  <p className="text-sm text-on-surface-variant">
                    Masukkan email terdaftar Anda untuk mendapatkan link verifikasi baru. Link berlaku <strong>1 jam</strong>.
                  </p>
                </div>

                {resendSent ? (
                  <div className="text-center py-4 space-y-3">
                    <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                    <p className="font-semibold text-on-surface">Email verifikasi telah dikirim!</p>
                    <p className="text-sm text-on-surface-variant">Silakan cek inbox atau folder spam Anda.</p>
                    <button onClick={() => { setResendSent(false); setResendEmail(""); }} className="text-sm text-primary font-medium hover:underline flex items-center gap-1 mx-auto">
                      <RefreshCw className="w-4 h-4" /> Kirim ke email lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="resendEmail" className="text-sm font-medium text-on-surface-variant block">Alamat Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                        <input
                          id="resendEmail"
                          type="email"
                          placeholder="nama@email.com"
                          value={resendEmail}
                          onChange={(e) => { setResendEmail(e.target.value); setErrors({}); }}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl bg-surface transition-all outline-none text-base ${errors.email ? "border-error" : "border-outline-variant"} focus:border-primary`}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-error ml-1" role="alert">{errors.email}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {resendLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Kirim Link Verifikasi <ArrowRight className="w-5 h-5" /></>)}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            Sudah terverifikasi?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Masuk sekarang</Link>
          </p>
        </div>
      </div>

      <footer className="mt-auto border-t border-outline-variant bg-surface-container-low py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-medium text-on-surface-variant">FreshPress Security Guaranteed</span>
          </div>
          <Link href="#" className="font-medium text-on-surface-variant hover:text-primary transition-colors">Butuh Bantuan?</Link>
        </div>
      </footer>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}

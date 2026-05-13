"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Shirt,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
  ArrowLeft,
  Droplets,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Password strength calculation (matching the UI bar and label) ---
  const evaluateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score; // 0..3
  };

  const strengthScore = evaluateStrength(password);
  const strengthLabel =
    strengthScore === 0
      ? "Lemah"
      : strengthScore === 1
        ? "Cukup"
        : strengthScore === 2
          ? "Kuat"
          : "Sangat Kuat";
  const strengthColor =
    strengthScore <= 1
      ? "bg-error"
      : strengthScore === 2
        ? "bg-tertiary"
        : "bg-primary";

  const strengthBars = Array(3)
    .fill(null)
    .map((_, i) => (i < strengthScore ? strengthColor : "bg-outline-variant"));

  const minLengthMet = password.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /\d/.test(password);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: integrate actual API call
    console.log("Password reset:", { password, confirmPassword });
    setLoading(true);
    // Simulate async action
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-gutter">
      {/* Brand Header */}
      <header className="mb-xl flex flex-col items-center text-center">
        <div className="mb-md flex items-center justify-center w-16 h-16 rounded-xl bg-primary shadow-sm">
          <Shirt className="text-on-primary w-8 h-8" />
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">
          FreshPress Laundry
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant mt-2">
          Kebersihan terjamin, waktu Anda berharga.
        </p>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg md:p-xl">
        <div className="mb-xl">
          <h2 className="text-headline-md font-headline-md text-on-surface">
            Buat Kata Sandi Baru
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-sm">
            Demi keamanan akun Anda, silakan buat kata sandi baru yang kuat dan
            unik.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* New Password */}
          <div className="space-y-sm">
            <label
              htmlFor="new-password"
              className="text-label-md font-label-md text-on-surface-variant"
            >
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-md pr-12 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md font-body-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Toggle visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="pt-sm">
                <div className="flex gap-1 h-1.5 w-full">
                  {strengthBars.map((colorClass, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full h-full ${colorClass}`}
                    />
                  ))}
                </div>
                <p
                  className={`text-label-sm font-label-sm mt-1.5 flex items-center gap-1 ${
                    strengthScore >= 2
                      ? "text-primary"
                      : "text-on-surface-variant"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {strengthLabel}
                </p>
              </div>
            )}

            {/* Requirements checklist */}
            <ul className="mt-md space-y-2">
              <li className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
                {minLengthMet ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-outline" />
                )}
                Minimal 8 karakter
              </li>
              <li className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
                {hasLetterAndNumber ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-outline" />
                )}
                Kombinasi huruf dan angka
              </li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="space-y-sm">
            <label
              htmlFor="confirm-password"
              className="text-label-md font-label-md text-on-surface-variant"
            >
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-md pr-12 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md font-body-md"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Toggle visibility"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-bold rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan & Masuk"}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <footer className="mt-lg">
        <Link
          href="/login"
          className="text-label-md font-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Batal dan kembali ke Login
        </Link>
      </footer>

      {/* Decorative top accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-container to-secondary opacity-20 pointer-events-none" />

      {/* Decorative water drop (hidden on mobile) */}
      <div className="fixed bottom-0 right-0 p-xl opacity-5 pointer-events-none hidden md:block">
        <Droplets className="text-primary w-[120px] h-[120px]" />
      </div>
    </main>
  );
}

"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shirt, Mail, Lock, EyeOff, Eye, ArrowRight } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { User as UserType } from "@/types/user.types";

/* ------------------------------------------------------------------ */
/*  Data & Tipe                                                       */
/* ------------------------------------------------------------------ */

interface LoginErrors {
  email?: string;
  password?: string;
  server?: string;
}

/* ------------------------------------------------------------------ */
/*  Komponen Pembantu                                                 */
/* ------------------------------------------------------------------ */

/** Input dengan ikon kiri, toggle kanan untuk password, & pesan error */
const InputField = ({
  label,
  icon: Icon,
  type,
  placeholder,
  id,
  value,
  onChange,
  error,
  rightIcon,
  onRightIconClick,
}: {
  label: string;
  icon: React.ElementType;
  type: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-on-surface-variant">
      {label}
    </label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full pl-12 pr-12 py-3.5 bg-surface border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base placeholder:text-outline-variant ${
          error ? "border-error" : "border-outline-variant"
        }`}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
          aria-label="Toggle visibility"
        >
          {rightIcon}
        </button>
      )}
    </div>
    {error && (
      <p id={`${id}-error`} className="text-xs text-error ml-1" role="alert">
        {error}
      </p>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Halaman Login                                                      */
/* ------------------------------------------------------------------ */

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  /* ---------- validasi ---------- */
  const validate = (): boolean => {
    const errs: LoginErrors = {};
    if (!email.trim()) {
      errs.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Format email tidak valid.";
    }
    if (!password) {
      errs.password = "Password wajib diisi.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const { data } = await axiosInstance.post<{
        accessToken: string;
        user: UserType;
      }>("/v1/customer/auth/login", { email, password });

      setAuth(data.user, data.accessToken);

      const redirectTo = searchParams.get("redirect") ?? getDashboardPath(data.user.role);
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login gagal. Periksa kembali email dan password Anda.";
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (role: string): string => {
    if (role === "super_admin" || role === "outlet_admin") return "/dashboard/admin";
    if (role === "driver") return "/dashboard/driver";
    if (role === "worker") return "/dashboard/worker";
    return "/dashboard";
  };

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        

        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <Shirt className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-primary">FreshPress</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Portal Staff</h1>
            <p className="text-sm text-gray-500 mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>
          {/* Card */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.server && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg" role="alert">
                {errors.server}
              </div>
            )}

            <InputField
              label="Email"
              icon={Mail}
              type="email"
              placeholder="nama@freshpress.id"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-on-surface-variant">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <InputField
                label=""
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightIcon={
                  showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                }
                onRightIconClick={() => setShowPassword((v) => !v)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Belum terdaftar?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

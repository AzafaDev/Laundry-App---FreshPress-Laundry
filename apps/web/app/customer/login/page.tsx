"use client";

import { useState, type FormEvent, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Shirt } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { User as UserType } from "@/types/user.types";
import { LoginBrandingPanel } from "@/components/customer/LoginBrandingPanel";
import { useTranslation } from "@/i18n/useTranslation";
import { DemoAccountPicker } from "@/components/ui/DemoAccountPicker";
import { getCustomerAccountGroups } from "@/lib/demoAccounts";

interface LoginErrors {
  email?: string;
  password?: string;
  server?: string;
}

const InputField = ({ label, icon: Icon, type, placeholder, id, value, onChange, error, rightIcon, onRightIconClick }: {
  label: string; icon: React.ElementType; type: string; placeholder: string; id: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; rightIcon?: React.ReactNode; onRightIconClick?: () => void;
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-on-surface-variant">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
      <input
        suppressHydrationWarning
        id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full pl-12 pr-12 py-3.5 bg-surface border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base placeholder:text-outline-variant ${error ? "border-error" : "border-outline-variant"}`}
      />
      {rightIcon && (
        <button suppressHydrationWarning type="button" onClick={onRightIconClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" aria-label="Toggle visibility">
          {rightIcon}
        </button>
      )}
    </div>
    {error && <p id={`${id}-error`} className="text-xs text-error ml-1" role="alert">{error}</p>}
  </div>
);

function CustomerLoginContent() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, user, _hasHydrated } = useAuthStore();
  const googleError = searchParams.get("error");

  useEffect(() => {
    if (_hasHydrated && user) router.replace("/");
  }, [_hasHydrated, user, router]);

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_URL ?? "http://localhost:8080/api";
    window.location.href = `${apiBase}/v1/customer/auth/google`;
  };

  const validate = (): boolean => {
    const errs: LoginErrors = {};
    if (!email.trim()) errs.email = t("auth.login.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("auth.login.emailInvalid");
    if (!password) errs.password = t("auth.login.passwordRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setErrors({});
    try {
      const { data } = await axiosInstance.post<{ user: UserType }>("/v1/customer/auth/login", { email, password });
      setAuth(data.user);
      router.push(searchParams.get("redirect") ?? "/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t("auth.login.loginFailed");
      setErrors({ server: msg });
    } finally { setLoading(false); }
  };

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />

      <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <LoginBrandingPanel />

        <div className="w-full max-w-[480px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            {t("auth.backHome")}
          </Link>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="bg-primary p-2 rounded-lg mb-2"><Shirt className="text-white w-7 h-7" /></div>
              <span className="text-2xl font-bold text-primary">FreshPress Laundry</span>
            </div>
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">{t("auth.login.welcomeBack")}</h2>
              <p className="text-base text-on-surface-variant">{t("auth.login.subtitle")}</p>
            </div>

            <DemoAccountPicker
              groups={getCustomerAccountGroups(t)}
              onPick={(demoEmail, demoPassword) => {
                setEmail(demoEmail);
                setPassword(demoPassword);
                setErrors({});
              }}
              className="mb-5"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
              {(errors.server || googleError) && (
                <div className="bg-error-container/30 border border-error/30 text-error text-sm px-4 py-3 rounded-xl" role="alert">
                  {errors.server ?? googleError}
                </div>
              )}
              <InputField label={t("auth.login.emailLabel")} icon={Mail} type="email" placeholder={t("auth.login.emailPlaceholder")} id="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-on-surface-variant">{t("auth.login.passwordLabel")}</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("auth.login.forgotPassword")}</Link>
                </div>
                <InputField label="" icon={Lock} type={showPassword ? "text" : "password"} placeholder="••••••••" id="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password}
                  rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} onRightIconClick={() => setShowPassword((v) => !v)}
                />
              </div>
              <button suppressHydrationWarning type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-2xl shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><span>{t("auth.login.submit")}</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-outline-variant" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-surface-container-lowest px-4 text-on-surface-variant uppercase tracking-wider">{t("auth.login.or")}</span></div>
            </div>

            <button suppressHydrationWarning type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-low transition-colors active:scale-[0.99]">
              <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEUHcRjMiZMYyWApcSyqelA5YhcZ-9fYsEKP5vvCO6UDSiYPLdbadxZi2j0QhsTUhkRTXmuHVWNhNw75wcbMYBne0uGtSbcFqtsQni7ctuZ_eGv-gHs3ik7nQBRbkZYlPdvHhfozKMyrnrcYVCIlGCJAiesFspfVVpalhyqj_aEZoIsvx7K5NbYKxAlvvA1JcPrkG0Fzt5j6zwLsYTXj4jASJuhBBcqmiAnB37Qtu0SyYOGfhRZSIpSG4RAl0aN6nSCrXS0pBbrm8" />
              <span className="text-sm font-bold text-on-surface">{t("auth.login.continueWithGoogle")}</span>
            </button>

            <p className="text-center mt-6 text-base text-on-surface-variant">
              {t("auth.login.noAccount")} <Link href="/customer/register" className="text-primary font-bold hover:underline">{t("auth.login.registerHere")}</Link>
            </p>
            <p className="text-center text-sm text-on-surface-variant mt-2">
              {t("auth.login.employeeLogin")} <Link href="/employee/login" className="text-primary font-bold hover:underline">{t("auth.login.clickHere")}</Link>
            </p>
          </div>
          <div className="mt-4 flex justify-center items-center gap-6 text-outline opacity-60">
            <div className="flex items-center gap-1"><Shirt className="w-4 h-4" /><span className="text-xs">{t("auth.login.secureData")}</span></div>
            <div className="flex items-center gap-1"><Shirt className="w-4 h-4" /><span className="text-xs">{t("auth.login.support247")}</span></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 -z-20 w-full h-32 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,160C672,128,768,96,864,106.7C960,117,1056,171,1152,181.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#008378" />
        </svg>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <CustomerLoginContent />
    </Suspense>
  );
}

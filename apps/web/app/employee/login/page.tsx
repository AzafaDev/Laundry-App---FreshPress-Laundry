"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, EyeOff, Eye, ArrowRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEmployeeAuth, getSafeLoginError } from "@/hooks/useEmployeeAuth";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useRouter } from "next/navigation";
import { getDashboardPath } from "@/utils/employeeRoutes";
import { AuthPageShell } from "@/components/employee/AuthPageShell";
import { AuthCard } from "@/components/employee/AuthCard";
import { AuthErrorAlert } from "@/components/employee/AuthErrorAlert";
import { AuthFormField } from "@/components/employee/AuthFormField";
import { AuthInput } from "@/components/employee/AuthInput";
import { AuthSubmitButton } from "@/components/employee/AuthSubmitButton";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").max(64, "Password maksimal 64 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function EmployeeLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useEmployeeAuth();
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!_hasHydrated || !user) return;
    router.replace(getDashboardPath(user.role));
  }, [_hasHydrated, user, router]);

  const onSubmit = (data: LoginFormData) => {
    if (isLoggingIn) return;
    login(data);
  };

  const errorMessage = loginError ? getSafeLoginError(loginError) : null;

  return (
    <AuthPageShell>
      <AuthCard>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Selamat datang 👋</h2>
        <p className="text-sm text-gray-500 mb-6">Masuk untuk melanjutkan ke dashboard.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && <AuthErrorAlert message={errorMessage} />}

          <AuthFormField label="Email" htmlFor="email" error={errors.email?.message}>
            <AuthInput
              id="email"
              type="email"
              placeholder="nama@freshpress.id"
              icon={<Mail className="w-4 h-4" />}
              registration={register("email")}
            />
          </AuthFormField>

          <AuthFormField label="Password" htmlFor="password" error={errors.password?.message}>
            <AuthInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              registration={register("password")}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </AuthFormField>

          <div className="flex justify-end -mt-1">
            <Link href="/employee/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Lupa Password?
            </Link>
          </div>

          <AuthSubmitButton isLoading={isLoggingIn}>
            Masuk <ArrowRight className="w-4 h-4" />
          </AuthSubmitButton>
        </form>
      </AuthCard>

      <div className="text-center mt-5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login Pelanggan
        </Link>
      </div>
    </AuthPageShell>
  );
}

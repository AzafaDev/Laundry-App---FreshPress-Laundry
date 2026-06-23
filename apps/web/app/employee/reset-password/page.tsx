"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, EyeOff, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPassword } from "@/hooks/useEmployeeAuth";
import { AuthPageShell } from "@/components/employee/AuthPageShell";
import { AuthCard } from "@/components/employee/AuthCard";
import { AuthErrorAlert } from "@/components/employee/AuthErrorAlert";
import { AuthFormField } from "@/components/employee/AuthFormField";
import { AuthInput } from "@/components/employee/AuthInput";
import { AuthSubmitButton } from "@/components/employee/AuthSubmitButton";

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const { mutate, isPending } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) router.replace("/employee/forgot-password");
  }, [token, router]);

  const onSubmit = (data: ResetFormData) => {
    setError(null);
    mutate({ token: token!, newPassword: data.newPassword }, {
      onError: (err: unknown) => {
        const status = (err as any)?.response?.status;
        if (status === 400 || status === 410 || status === 404) {
          setTokenInvalid(true);
          setError("Token tidak valid atau sudah kadaluarsa.");
        } else {
          setError("Terjadi kesalahan. Silakan coba lagi.");
        }
      },
    });
  };

  if (!token) return null;

  return (
    <AuthCard>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Buat Password Baru</h2>
      <p className="text-sm text-gray-500 mb-6">
        Masukkan password baru Anda untuk mengaktifkan akun.
      </p>

      {tokenInvalid ? (
        <div className="space-y-4">
          {error && <AuthErrorAlert message={error} />}
          <a
            href="/employee/forgot-password"
            className="block w-full text-center py-3 bg-primary text-white font-bold rounded-xl text-sm hover:brightness-105 transition-all"
          >
            Minta Link Reset Baru
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <AuthErrorAlert message={error} />}

          <AuthFormField label="Password Baru" htmlFor="newPassword" error={errors.newPassword?.message}>
            <AuthInput
              id="newPassword"
              type={showNew ? "text" : "password"}
              placeholder="Min. 8 karakter"
              icon={<Lock className="w-4 h-4" />}
              registration={register("newPassword")}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </AuthFormField>

          <AuthFormField label="Konfirmasi Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <AuthInput
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Ulangi password baru"
              icon={<Lock className="w-4 h-4" />}
              registration={register("confirmPassword")}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </AuthFormField>

          <AuthSubmitButton isLoading={isPending}>
            Simpan & Masuk
          </AuthSubmitButton>
        </form>
      )}
    </AuthCard>
  );
}

export default function EmployeeResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <AuthCard>
            <div className="animate-pulse h-64" />
          </AuthCard>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}

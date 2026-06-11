"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeAuthService } from "@/services/employeeAuth.service";
import { AuthPageShell } from "@/components/employee/AuthPageShell";
import { AuthCard } from "@/components/employee/AuthCard";
import { AuthErrorAlert } from "@/components/employee/AuthErrorAlert";
import { AuthFormField } from "@/components/employee/AuthFormField";
import { AuthInput } from "@/components/employee/AuthInput";
import { AuthSubmitButton } from "@/components/employee/AuthSubmitButton";

const forgotSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function EmployeeForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await employeeAuthService.forgotPassword(data.email);
      setSent(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Lupa Password?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan email Anda dan kami akan mengirim link reset.
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-4 rounded-xl">
            Jika email terdaftar, link reset akan dikirimkan. Silakan cek inbox Anda.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <AuthErrorAlert message={error} />}

            <AuthFormField label="Email" htmlFor="email" error={errors.email?.message}>
              <AuthInput
                id="email"
                type="email"
                placeholder="nama@freshpress.id"
                icon={<Mail className="w-4 h-4" />}
                registration={register("email")}
              />
            </AuthFormField>

            <AuthSubmitButton isLoading={isLoading}>
              Kirim Link Reset
            </AuthSubmitButton>
          </form>
        )}
      </AuthCard>

      <div className="text-center mt-5">
        <Link
          href="/employee/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </Link>
      </div>
    </AuthPageShell>
  );
}

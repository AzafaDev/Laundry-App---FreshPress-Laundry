"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { User, Mail, Phone, ArrowRight } from "lucide-react";

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const updateField = <K extends keyof RegisterForm>(
    field: K,
    value: RegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) {
      next.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Format email tidak valid.";
    }
    if (form.phone && !/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) {
      next.phone = "Nomor telepon tidak valid (8-15 digit).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: ganti dengan panggilan API nyata
      // await axiosInstance.post('/auth/register', form);
      console.log("Registrasi:", form);
      setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 md:p-8">
        <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />
        <div className="w-full max-w-[480px] bg-white rounded-[2rem] shadow-2xl shadow-primary/5 border border-white p-lg md:p-xl flex flex-col items-center text-center gap-lg">
          <div className="bg-primary/10 p-sm rounded-xl">
            <div className="text-primary text-4xl font-bold">📧</div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Cek Email Anda
            </h1>
            <p className="text-base text-on-surface-variant mt-1 px-4">
              Kami telah mengirimkan link verifikasi ke{" "}
              <strong>{form.email}</strong>. Silakan cek inbox atau folder spam
              Anda.
            </p>
          </div>
          <Link
            href="/verify"
            className="inline-block mt-4 bg-primary text-white py-3 px-8 rounded-2xl font-bold hover:opacity-90 transition-all"
          >
            Buka Halaman Verifikasi
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 md:p-8">
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />

      <div className="w-full max-w-[480px] bg-white rounded-[2rem] shadow-2xl shadow-primary/5 border border-white p-lg md:p-xl flex flex-col gap-lg">
        <header className="flex flex-col items-center text-center gap-md">
          <div className="bg-primary/10 p-sm rounded-xl">
            <div className="text-primary text-4xl font-bold">🧺</div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Buat Akun Baru
            </h1>
            <p className="text-base text-on-surface-variant mt-1 px-4">
              Bergabunglah dengan layanan laundry premium FreshPress hari ini.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Nama Lengkap */}
          <div className="group">
            <label
              htmlFor="name"
              className="text-sm font-bold text-on-surface/80 ml-1 mb-1.5 block"
            >
              Nama Lengkap
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base placeholder:text-outline-variant"
              />
            </div>
            {errors.name && (
              <p className="mt-1 ml-1 text-xs text-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="group">
            <label
              htmlFor="email"
              className="text-sm font-bold text-on-surface/80 ml-1 mb-1.5 block"
            >
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
              <input
                id="email"
                type="email"
                placeholder="email@anda.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base placeholder:text-outline-variant"
              />
            </div>
            {errors.email && (
              <p className="mt-1 ml-1 text-xs text-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Telepon (opsional) */}
          <div className="group">
            <label
              htmlFor="phone"
              className="text-sm font-bold text-on-surface/80 ml-1 mb-1.5 block"
            >
              Telepon{" "}
              <span className="text-on-surface-variant font-normal">
                (opsional)
              </span>
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
              <input
                id="phone"
                type="tel"
                placeholder="0812..."
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base placeholder:text-outline-variant"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 ml-1 text-xs text-error" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-sm bg-primary hover:bg-primary-container text-on-primary py-lg rounded-2xl font-bold text-base transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                Kirim Verifikasi
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center gap-md py-sm">
          <div className="flex-grow h-[1px] bg-outline-variant"></div>
          <span className="text-xs font-bold text-outline uppercase tracking-[0.1em]">
            Atau
          </span>
          <div className="flex-grow h-[1px] bg-outline-variant"></div>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-md bg-white border-2 border-outline-variant py-md rounded-2xl hover:bg-surface-container-low transition-all hover:border-outline group"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-bold text-on-surface">
            Lanjutkan dengan Google
          </span>
        </button>

        <p className="text-center text-base text-on-surface-variant">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}

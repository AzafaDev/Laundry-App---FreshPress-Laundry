"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { User, Mail, Phone, ArrowRight, Truck, Shirt, ShieldCheck } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

const roles = [
  { icon: ShieldCheck, label: "Admin", value: "outlet_admin", desc: "Admin outlet" },
  { icon: Truck, label: "Driver", value: "driver", desc: "Kurir antar-jemput" },
  { icon: Shirt, label: "Worker", value: "worker", desc: "Petugas laundry" },
] as const;

type RoleValue = (typeof roles)[number]["value"];

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  role: RoleValue;
};

type FormErrors = Partial<Record<keyof RegisterForm | "server", string>>;

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    role: "outlet_admin",
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
      await axiosInstance.post("/v1/customer/auth/register", {
        full_name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
      });
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registrasi gagal. Coba lagi.";
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Cek Email Anda</h1>
          <p className="text-sm text-gray-500 mb-6">
            Link verifikasi telah dikirim ke <strong>{form.email}</strong>.
            Cek inbox atau folder spam Anda.
          </p>
          <Link
            href="/verify"
            className="inline-block bg-primary text-white py-2 px-6 rounded-lg font-semibold text-sm hover:brightness-105 transition-all"
          >
            Buka Halaman Verifikasi
          </Link>
        </div>
      </main>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Daftar Akun Staff</h1>
            <p className="text-sm text-gray-500 mt-1">Buat akun untuk Admin, Driver, atau Worker</p>
          </div>
          {/* Card */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.server && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg" role="alert">
                {errors.server}
              </div>
            )}

            {/* Pilih Peran */}
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2 block">
                Daftar Sebagai
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ icon: Icon, label, value, desc }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={form.role === value}
                    onClick={() => updateField("role", value)}
                    suppressHydrationWarning
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors text-center focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      form.role === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="text-[10px] leading-tight opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-400"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500" role="alert">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="email@anda.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-400"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500" role="alert">{errors.email}</p>}
            </div>

            {/* Telepon */}
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">
                Telepon <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="0812..."
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-400"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500" role="alert">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Kirim Verifikasi <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}

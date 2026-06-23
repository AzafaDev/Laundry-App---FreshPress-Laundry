"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, Phone, Shirt, User } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { RegisterBrandingPanel } from "@/components/customer/RegisterBrandingPanel";

type RegisterForm = { name: string; email: string; phone: string };
type FormErrors = Partial<Record<keyof RegisterForm | "server", string>>;

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && user) router.replace("/");
  }, [_hasHydrated, user, router]);

  const [form, setForm] = useState<RegisterForm>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const updateField = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) next.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Format email tidak valid.";
    if (!form.phone.trim()) next.phone = "Nomor telepon wajib diisi.";
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) next.phone = "Nomor telepon tidak valid (8-15 digit).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axiosInstance.post("/v1/customer/auth/register", { full_name: form.name, email: form.email, phone: form.phone.trim(), role: "customer" });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Registrasi gagal. Coba lagi.";
      setErrors({ server: msg });
    } finally { setLoading(false); }
  };

  const handleGoogleRegister = () => {
    const apiBase = process.env.NEXT_PUBLIC_URL ?? "http://localhost:8080/api";
    window.location.href = `${apiBase}/v1/customer/auth/google`;
  };

  if (sent) {
    return (
      <main className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
        <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />
        <div className="w-full max-w-[520px] bg-white rounded-[2rem] shadow-2xl shadow-primary/5 border border-white p-8 md:p-10 flex flex-col items-center text-center gap-6">
          <div className="bg-primary/10 p-4 rounded-2xl"><div className="text-5xl">📧</div></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Cek Email Anda!</h1>
            <p className="text-base text-on-surface-variant mt-2 px-4">
              Kami telah mengirimkan link verifikasi ke <strong className="text-on-surface">{form.email}</strong>. Silakan cek inbox atau folder spam Anda.
            </p>
          </div>
          <div className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-on-surface-variant">
            Tidak menerima email? Periksa folder spam atau tunggu beberapa menit.
          </div>
          <Link href="/verify" className="inline-flex items-center gap-2 bg-primary text-white py-3 px-8 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
            Buka Halaman Verifikasi<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />

      <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <RegisterBrandingPanel />

        <div className="w-full max-w-[480px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="lg:hidden flex flex-col items-center mb-6">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30 mb-2"><Shirt className="text-white w-7 h-7" /></div>
            <span className="text-xl font-bold text-primary">FreshPress Laundry</span>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Buat Akun Gratis</h2>
              <p className="text-on-surface-variant text-sm mt-1">Daftar sekarang dan nikmati layanan laundry premium.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.server && <div className="bg-error-container/30 border border-error/30 text-error text-sm px-4 py-3 rounded-xl" role="alert">{errors.server}</div>}

              {[
                { id: "name", label: "Nama Lengkap", icon: User, type: "text", placeholder: "John Doe", field: "name" as const },
                { id: "email", label: "Email", icon: Mail, type: "email", placeholder: "email@anda.com", field: "email" as const },
              ].map(({ id, label, icon: Icon, type, placeholder, field }) => (
                <div key={id} className="group">
                  <label htmlFor={id} className="text-sm font-bold text-on-surface/80 ml-1 mb-1.5 block">{label}</label>
                  <div className="relative flex items-center">
                    <Icon className="absolute left-4 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input id={id} type={type} placeholder={placeholder} value={form[field]} onChange={(e) => updateField(field, e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base placeholder:text-outline-variant" />
                  </div>
                  {errors[field] && <p className="mt-1 ml-1 text-xs text-error" role="alert">{errors[field]}</p>}
                </div>
              ))}

              <div className="group">
                <label htmlFor="phone" className="text-sm font-bold text-on-surface/80 ml-1 mb-1.5 block">Telepon</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input id="phone" type="tel" placeholder="0812..." value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base placeholder:text-outline-variant" />
                </div>
                {errors.phone && <p className="mt-1 ml-1 text-xs text-error" role="alert">{errors.phone}</p>}
              </div>

              <button type="submit" disabled={loading} suppressHydrationWarning className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-2xl shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <>Daftar Sekarang <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-outline-variant" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-on-surface-variant uppercase tracking-wider">Atau</span></div>
            </div>

            <button type="button" onClick={handleGoogleRegister} suppressHydrationWarning className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl bg-white hover:bg-surface-container-low transition-colors active:scale-[0.99]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-bold text-on-surface">Daftar dengan Google</span>
            </button>

            <p className="text-center mt-5 text-sm text-on-surface-variant">
              Sudah punya akun? <Link href="/customer/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

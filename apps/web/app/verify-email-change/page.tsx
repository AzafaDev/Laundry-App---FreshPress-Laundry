"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shirt,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Token tidak ditemukan. Pastikan Anda membuka link dari email.");
      return;
    }

    axiosInstance
      .post("/v1/customer/profile/verify-email-change", { token })
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Token tidak valid atau sudah kadaluarsa.";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, [token]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center justify-center h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shirt className="text-primary w-7 h-7" />
            <span className="text-xl font-bold tracking-tight text-primary">FreshPress Laundry</span>
          </Link>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[520px] w-full">
          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-[2rem] p-6 md:p-8 shadow-sm">

            {/* LOADING */}
            {status === "loading" && (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="w-14 h-14 text-primary mx-auto animate-spin" />
                <p className="text-on-surface-variant font-medium">Memverifikasi perubahan email…</p>
              </div>
            )}

            {/* SUCCESS */}
            {status === "success" && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-on-surface">Email Berhasil Diubah!</h2>
                <p className="text-on-surface-variant text-sm">
                  Alamat email akun Anda telah berhasil diperbarui. Silakan masuk menggunakan email baru Anda.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 mt-4 bg-primary text-on-primary py-3 px-8 rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  Masuk Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* ERROR */}
            {status === "error" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-error-container rounded-full flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-error" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Verifikasi Gagal</h2>
                  <p className="text-sm text-on-surface-variant">{errorMsg}</p>
                </div>

                <div className="bg-surface-container rounded-2xl p-4 text-sm text-on-surface-variant space-y-2">
                  <p className="font-semibold text-on-surface flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Apa yang bisa dilakukan?
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>
                      Kembali ke{" "}
                      <Link href="/profile" className="text-primary font-medium underline">
                        halaman profil
                      </Link>{" "}
                      dan ulangi permintaan ganti email.
                    </li>
                    <li>Link perubahan email berlaku <strong>1 jam</strong> sejak dikirim.</li>
                    <li>Pastikan Anda membuka link terbaru dari inbox email baru Anda.</li>
                  </ul>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  Kembali ke Profil <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            Butuh bantuan?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Hubungi kami
            </Link>
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

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}

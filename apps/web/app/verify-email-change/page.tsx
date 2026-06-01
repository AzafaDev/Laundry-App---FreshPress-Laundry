"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shirt, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token tidak ditemukan. Pastikan link yang Anda klik benar.");
      return;
    }

    axiosInstance
      .post("/v1/customer/profile/verify-email-change", { token })
      .then((res) => {
        setMessage(res.data?.message ?? "Email berhasil diubah.");
        setStatus("success");
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ??
          "Konfirmasi gagal. Token mungkin sudah kadaluarsa atau tidak valid.";
        setMessage(msg);
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 rounded-full p-4">
            <Shirt className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          FreshPress Laundry
        </h1>

        {status === "loading" && (
          <div className="mt-6 flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p>Mengkonfirmasi perubahan email…</p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckCircle className="w-14 h-14 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Email Berhasil Diubah!
            </h2>
            <p className="text-gray-600">{message}</p>
            <Link
              href="/login"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Login dengan Email Baru
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <AlertCircle className="w-14 h-14 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Konfirmasi Gagal
            </h2>
            <p className="text-gray-600">{message}</p>
            <Link
              href="/profile"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Kembali ke Profil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <VerifyEmailChangeContent />
    </Suspense>
  );
}

"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import Link from "next/link";
import {
  Shirt,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  Info,
  ShieldCheck,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tipe                                                               */
/* ------------------------------------------------------------------ */

interface FormErrors {
  otp?: string;
  password?: string;
  confirmPassword?: string;
}

/* ------------------------------------------------------------------ */
/*  Komponen Utama                                                      */
/* ------------------------------------------------------------------ */

export default function VerifyPage() {
  /* ---------- state ---------- */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // countdown 2 menit
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  /* ---------- helper: focus next OTP ---------- */
  const focusNext = (index: number) => {
    if (index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  /* ---------- OTP change ---------- */
  const handleOtpChange = (index: number, value: string) => {
    // hanya digit
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));

    if (value !== "") {
      focusNext(index);
    }
  };

  /* ---------- OTP keydown (backspace) ---------- */
  const handleOtpKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "") {
      focusPrev(index);
    }
  };

  /* ---------- OTP paste (handle 6-digit paste) ---------- */
  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      digits.forEach((_, i) => {
        if (otpRefs.current[i]) otpRefs.current[i]!.value = digits[i];
      });
      otpRefs.current[5]?.focus();
    }
  };

  /* ---------- resend OTP ---------- */
  const handleResend = () => {
    if (!canResend) return;
    // TODO: panggil API resend OTP
    setOtp(["", "", "", "", "", ""]);
    setCountdown(120);
    setCanResend(false);
    otpRefs.current[0]?.focus();
  };

  /* ---------- validasi ---------- */
  const validate = (): boolean => {
    const errs: FormErrors = {};
    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      errs.otp = "Masukkan 6 digit kode OTP.";
    }
    if (!password) {
      errs.password = "Password wajib diisi.";
    } else if (password.length < 8) {
      errs.password = "Password minimal 8 karakter.";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Konfirmasi password tidak cocok.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: panggil API verifikasi
      // await axiosInstance.post('/auth/verify', { otp: otp.join(''), password });
      console.log("Verifikasi:", { otp: otp.join(""), password });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      // tampilkan error server jika ada
    } finally {
      setLoading(false);
    }
  };

  /* ---------- cek kriteria password (real-time) ---------- */
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasLetterAndNumber: /[a-zA-Z]/.test(password) && /\d/.test(password),
  };

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header sederhana */}
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center justify-center h-16 px-4">
          <div className="flex items-center gap-2">
            <Shirt className="text-primary w-7 h-7" />
            <span className="text-xl font-bold tracking-tight text-primary">
              FreshPress Laundry
            </span>
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[672px] w-full flex flex-col items-center">
          {/* Hero Visual */}
          <div className="relative w-full max-w-[320px] mb-8 flex flex-col items-center">
            <div className="relative z-10 w-full aspect-[4/3] bg-surface-container-highest/30 rounded-3xl flex items-center justify-center p-6 overflow-hidden border border-outline-variant/20">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl opacity-50" />
              <Mail className="relative z-20 text-primary w-24 h-24" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">
                Selangkah lagi menuju kesegaran
              </h3>
              <p className="text-base text-on-surface-variant">
                Verifikasi ini memastikan hanya Anda yang memiliki akses ke
                layanan premium FreshPress.
              </p>
            </div>
          </div>

          {/* Card Verifikasi */}
          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-[2rem] p-6 md:p-8 shadow-sm">
            {success ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-primary">
                  Verifikasi Berhasil!
                </h2>
                <p className="text-on-surface-variant">
                  Akun Anda telah aktif. Selamat bergabung dengan FreshPress!
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-4 bg-primary text-white py-3 px-8 rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  Masuk Sekarang
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">
                    Verifikasi Akun
                  </h2>
                  <p className="text-base text-on-surface-variant">
                    Kami telah mengirimkan kode OTP ke email Anda. Silakan
                    masukkan kode dan atur password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-on-surface-variant">
                        Kode Verifikasi (OTP)
                      </label>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend}
                        className={`text-xs font-bold transition-colors ${
                          canResend
                            ? "text-primary hover:underline"
                            : "text-on-surface-variant/50 cursor-not-allowed"
                        }`}
                      >
                        {canResend
                          ? "Kirim ulang"
                          : `Kirim ulang (${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")})`}
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          aria-label={`Digit ${index + 1}`}
                          className={`w-full aspect-square text-center text-xl md:text-2xl font-bold border-2 rounded-xl bg-surface transition-all outline-none ${
                            errors.otp
                              ? "border-error"
                              : "border-outline-variant"
                          } focus:border-primary focus:ring-4 focus:ring-primary/10`}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <p className="text-xs text-error ml-1" role="alert">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  {/* Password Setup */}
                  <div className="space-y-4 pt-6 border-t border-outline-variant/50">
                    {/* Password Baru */}
                    <div className="space-y-1">
                      <label
                        htmlFor="password"
                        className="text-sm font-bold text-on-surface-variant block"
                      >
                        Password Baru
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                        <input
                          id="password"
                          type="password"
                          placeholder="Minimal 8 karakter"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password)
                              setErrors((prev) => ({
                                ...prev,
                                password: undefined,
                              }));
                          }}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl bg-surface transition-all outline-none text-base ${
                            errors.password
                              ? "border-error"
                              : "border-outline-variant"
                          } focus:border-primary focus:ring-4 focus:ring-primary/10`}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-error ml-1" role="alert">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="space-y-1">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-bold text-on-surface-variant block"
                      >
                        Konfirmasi Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                        <input
                          id="confirmPassword"
                          type="password"
                          placeholder="Ulangi password baru"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirm(e.target.value);
                            if (errors.confirmPassword)
                              setErrors((prev) => ({
                                ...prev,
                                confirmPassword: undefined,
                              }));
                          }}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl bg-surface transition-all outline-none text-base ${
                            errors.confirmPassword
                              ? "border-error"
                              : "border-outline-variant"
                          } focus:border-primary focus:ring-4 focus:ring-primary/10`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-error ml-1" role="alert">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Kriteria Password */}
                    <div className="bg-surface-container p-4 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Kriteria Password:
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <li
                          className={`flex items-center gap-2 text-xs ${passwordCriteria.minLength ? "text-primary" : "text-on-surface-variant opacity-70"}`}
                        >
                          {passwordCriteria.minLength ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-current" />
                          )}
                          Minimal 8 karakter
                        </li>
                        <li
                          className={`flex items-center gap-2 text-xs ${passwordCriteria.hasLetterAndNumber ? "text-primary" : "text-on-surface-variant opacity-70"}`}
                        >
                          {passwordCriteria.hasLetterAndNumber ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-current" />
                          )}
                          Kombinasi Huruf &amp; Angka
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tombol Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-lg hover:bg-primary-container hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Verifikasi &amp; Masuk
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant bg-surface-container-low py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-medium text-on-surface-variant">
              FreshPress Security Guaranteed
            </span>
          </div>
          <div className="flex gap-6">
            <Link
              href="#"
              className="font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Butuh Bantuan?
            </Link>
            <Link
              href="#"
              className="font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

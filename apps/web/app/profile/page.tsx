"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  LogOut,
  X,
  KeyRound,
} from "lucide-react";
import { z } from "zod";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";

const profileSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter."),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, "Nomor telepon tidak valid (8-15 digit).")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Format email tidak valid."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
      .regex(/\d/, "Password harus mengandung angka."),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirm"],
  });

const MAX_SIZE = 1 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!user) router.replace("/login?redirect=/profile");
  }, [user, router]);

  // Fetch profil terbaru dari server agar has_google_login selalu akurat
  useEffect(() => {
    if (!user) return;
    axiosInstance.get("/v1/customer/profile")
      .then(({ data }) => updateUser(data))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendEmailChangeLoading, setResendEmailChangeLoading] = useState(false);
  const [resendEmailChangeSent, setResendEmailChangeSent] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ full_name: user.full_name ?? "", phone: user.phone ?? "", email: user.email ?? "" });
    }
  }, [user]);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePwdModal(); };
    if (pwdModalOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pwdModalOpen]);

  const openPwdModal = () => {
    setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
    setShowPwd({ current: false, new: false, confirm: false });
    setPwdError("");
    setPwdSuccess("");
    setPwdModalOpen(true);
  };

  const closePwdModal = () => {
    if (pwdLoading) return;
    setPwdModalOpen(false);
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");

    const result = profileSchema.safeParse({
      full_name: profileForm.full_name,
      phone: profileForm.phone || undefined,
      email: profileForm.email,
    });
    if (!result.success) {
      setProfileError(result.error.issues[0].message);
      return;
    }

    setProfileLoading(true);
    try {
      const payload: Record<string, string | undefined> = {
        full_name: profileForm.full_name,
        phone: profileForm.phone || undefined,
      };
      if (profileForm.email !== user?.email) {
        payload.new_email = profileForm.email;
      }
      const { data } = await axiosInstance.patch(
        "/v1/customer/profile",
        payload,
      );
      updateUser(data.user ?? data);
      if (payload.new_email) {
        setPendingEmail(payload.new_email as string);
        setResendEmailChangeSent(false);
      } else {
        setProfileSuccess(data.message ?? "Profil berhasil diperbarui.");
      }
    } catch (err: unknown) {
      setProfileError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Gagal memperbarui profil.");
    } finally { setProfileLoading(false); }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError(""); setPwdSuccess("");

    const result = passwordSchema.safeParse(pwdForm);
    if (!result.success) {
      setPwdError(result.error.issues[0].message);
      return;
    }

    setPwdLoading(true);
    try {
      await axiosInstance.patch("/v1/customer/profile/password", { current_password: pwdForm.currentPassword, new_password: pwdForm.newPassword });
      setPwdSuccess("Password berhasil diubah.");
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: unknown) {
      setPwdError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Gagal mengubah password.");
    } finally { setPwdLoading(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    if (!ALLOWED_TYPES.includes(file.type)) { setAvatarError("Format file harus JPG, JPEG, PNG, atau GIF."); return; }
    if (file.size > MAX_SIZE) { setAvatarError("Ukuran file maksimal 1 MB."); return; }
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await axiosInstance.post("/v1/customer/profile/avatar", formData);
      const avatarUrl: string | undefined = data?.avatar_url ?? data?.user?.avatar_url;
      if (avatarUrl) {
        updateUser({ avatar_url: avatarUrl });
      }
    } catch (err: unknown) {
      setAvatarError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Gagal mengunggah foto.");
    } finally { setAvatarLoading(false); e.target.value = ""; }
  };

  const handleResendEmailChange = async () => {
    if (!pendingEmail) return;
    setResendEmailChangeLoading(true);
    try {
      await axiosInstance.patch("/v1/customer/profile", { new_email: pendingEmail });
      setResendEmailChangeSent(true);
    } catch {
      /* silent — user can retry */
    } finally {
      setResendEmailChangeLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    setResendLoading(true);
    try { await axiosInstance.post("/v1/customer/auth/resend-verification", { email: user.email }); setResendSuccess(true); }
    catch { /* silent */ } finally { setResendLoading(false); }
  };

  const handleLogout = () => { clearAuth(); router.replace("/login"); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Profil Saya</h1>

        {!user.is_verified && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-on-surface">Email belum diverifikasi</p>
              <p className="text-on-surface-variant">Beberapa fitur dibatasi hingga akun Anda terverifikasi.</p>
            </div>
            {resendSuccess ? (
              <span className="text-xs text-primary font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Terkirim</span>
            ) : (
              <button onClick={handleResend} disabled={resendLoading} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 disabled:opacity-60">
                {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Kirim ulang
              </button>
            )}
          </div>
        )}

        {(profileSuccess || profileError || pendingEmail) && (
          <div className="space-y-2">
            {profileSuccess && (
              <div className="flex items-center gap-2 bg-primary-container/30 border border-primary/30 text-primary text-sm px-4 py-3 rounded-2xl">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />{profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="flex items-center gap-2 bg-error-container/30 border border-error/30 text-error text-sm px-4 py-3 rounded-2xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{profileError}
              </div>
            )}
            {pendingEmail && (
              <div className="flex items-start gap-3 bg-primary-container/20 border border-primary/30 rounded-2xl p-4">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-on-surface">Konfirmasi perubahan email</p>
                  <p className="text-on-surface-variant">
                    Link konfirmasi telah dikirim ke <span className="font-medium text-on-surface">{pendingEmail}</span>. Cek inbox atau folder spam.
                  </p>
                </div>
                {resendEmailChangeSent ? (
                  <span className="text-xs text-primary font-medium flex items-center gap-1 shrink-0"><CheckCircle className="w-4 h-4" /> Terkirim</span>
                ) : (
                  <button
                    onClick={handleResendEmailChange}
                    disabled={resendEmailChangeLoading}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 disabled:opacity-60 shrink-0"
                  >
                    {resendEmailChangeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Kirim ulang
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={user.avatar_url} src={user.avatar_url} alt="avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-on-primary-container" />
                )}
              </div>
              {avatarLoading && <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-90 shadow-md" aria-label="Ganti foto">
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-bold text-lg text-on-surface">{user.full_name}</p>
              <p className="text-sm text-on-surface-variant">{user.email}</p>
              {user.is_verified
                ? <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-1"><CheckCircle className="w-3.5 h-3.5" /> Terverifikasi</span>
                : <span className="inline-flex items-center gap-1 text-xs text-error font-semibold mt-1"><AlertCircle className="w-3.5 h-3.5" /> Belum Terverifikasi</span>}
            </div>
          </div>
          {avatarError && <p className="mt-3 text-xs text-error">{avatarError}</p>}
          <p className="mt-3 text-xs text-on-surface-variant">Format: JPG, JPEG, PNG, GIF. Maks: 1 MB.</p>
        </div>

        {/* Edit Profile */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h2 className="text-base font-bold text-on-surface mb-4">Informasi Akun</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="full_name" className="text-sm font-medium text-on-surface-variant block">Nama Lengkap</label>
              <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" /><input id="full_name" type="text" value={profileForm.full_name} onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))} className="w-full pl-10 pr-4 py-3 border-2 border-outline-variant rounded-xl bg-surface outline-none text-sm focus:border-primary transition-colors" /></div>
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium text-on-surface-variant block">Nomor Telepon</label>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" /><input id="phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="08xxxxxxxxxx" className="w-full pl-10 pr-4 py-3 border-2 border-outline-variant rounded-xl bg-surface outline-none text-sm focus:border-primary transition-colors" /></div>
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-on-surface-variant block">Email</label>
              {user.has_google_login ? (
                <div className="flex items-center gap-2 pl-3 pr-4 py-3 border-2 border-outline-variant rounded-xl bg-surface-container-low text-sm text-on-surface-variant">
                  <Mail className="w-4 h-4 text-outline shrink-0" />
                  <span className="flex-1 truncate">{user.email}</span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">Google</span>
                </div>
              ) : (
                <>
                  <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" /><input id="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} className="w-full pl-10 pr-4 py-3 border-2 border-outline-variant rounded-xl bg-surface outline-none text-sm focus:border-primary transition-colors" /></div>
                  {profileForm.email !== user.email && <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Mengubah email membutuhkan verifikasi ulang.</p>}
                </>
              )}
            </div>
            {user.has_google_login && (
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Akun ini terhubung dengan Google. Email dan password dikelola oleh Google.
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <button type="submit" disabled={profileLoading} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60">
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Perubahan
              </button>
              {!user.has_google_login && (
                <button type="button" onClick={openPwdModal} className="flex items-center gap-2 border-2 border-outline-variant text-on-surface-variant px-6 py-2.5 rounded-xl font-semibold text-sm hover:border-primary hover:text-primary transition-all">
                  <KeyRound className="w-4 h-4" /> Ubah Password
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Logout */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left text-error font-semibold py-2 px-2 rounded-xl hover:bg-error-container/20 transition-colors">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </main>
      <BottomNav />

      {/* Change Password Modal */}
      {pwdModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwd-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closePwdModal}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <h2 id="pwd-modal-title" className="text-base font-bold text-on-surface">Ubah Password</h2>
              </div>
              <button
                onClick={closePwdModal}
                disabled={pwdLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {pwdSuccess && (
                <div className="flex items-center gap-2 bg-primary-container/30 border border-primary/30 text-primary text-sm px-4 py-3 rounded-xl">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />{pwdSuccess}
                </div>
              )}
              {pwdError && (
                <div className="flex items-center gap-2 bg-error-container/30 border border-error/30 text-error text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{pwdError}
                </div>
              )}

              {([
                { id: "currentPassword", label: "Password Saat Ini", key: "current" as const, field: "currentPassword" as const },
                { id: "newPassword", label: "Password Baru", key: "new" as const, field: "newPassword" as const },
                { id: "confirmPassword", label: "Konfirmasi Password Baru", key: "confirm" as const, field: "confirm" as const },
              ] as const).map(({ id, label, key, field }) => (
                <div key={id} className="space-y-1">
                  <label htmlFor={`modal-${id}`} className="text-sm font-medium text-on-surface-variant block">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id={`modal-${id}`}
                      type={showPwd[key] ? "text" : "password"}
                      value={pwdForm[field]}
                      onChange={(e) => setPwdForm((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 border-2 border-outline-variant rounded-xl bg-surface outline-none text-sm focus:border-primary transition-colors"
                    />
                    <button type="button" onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                      {showPwd[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closePwdModal}
                  disabled={pwdLoading}
                  className="flex-1 border-2 border-outline-variant text-on-surface-variant py-2.5 rounded-xl font-semibold text-sm hover:border-outline transition-all disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

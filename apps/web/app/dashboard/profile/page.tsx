"use client";

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  User, Phone, Lock, EyeOff, Eye, Camera,
  Mail, MapPin, Shield, CheckCircle2,
  XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { z } from "zod";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { employeeProfileService } from "@/services/employeeProfile.service";
import { useChangePassword } from "@/hooks/useEmployeeAuth";
import type { EmployeeRole } from "@/types/employee.types";

const employeeProfileSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter."),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, "Nomor telepon tidak valid.")
    .optional()
    .or(z.literal("")),
});

const employeePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
      .regex(/\d/, "Password harus mengandung angka."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

const ROLE_LABEL: Record<EmployeeRole, string> = {
  super_admin: "Super Admin",
  outlet_admin: "Admin Outlet",
  washing_worker: "Petugas Cuci",
  ironing_worker: "Petugas Setrika",
  packing_worker: "Petugas Packing",
  driver: "Driver",
};

const ROLE_COLOR: Record<EmployeeRole, string> = {
  super_admin: "bg-violet-100 text-violet-700",
  outlet_admin: "bg-blue-100 text-blue-700",
  washing_worker: "bg-cyan-100 text-cyan-700",
  ironing_worker: "bg-orange-100 text-orange-700",
  packing_worker: "bg-amber-100 text-amber-700",
  driver: "bg-emerald-100 text-emerald-700",
};

function Spinner() {
  return <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />;
}

function FeedbackMsg({ msg }: { msg: { type: "success" | "error"; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
      {msg.type === "success"
        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
      {msg.text}
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { user, updateUser, _hasHydrated } = useEmployeeAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const changePasswordMutation = useChangePassword();

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const result = employeeProfileSchema.safeParse({ full_name: fullName, phone: phone || undefined });
    if (!result.success) {
      setProfileMsg({ type: "error", text: result.error.issues[0].message });
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await employeeProfileService.updateProfile({ full_name: fullName, phone });
      updateUser({ full_name: updated.full_name, phone: updated.phone });
      setProfileMsg({ type: "success", text: "Profil berhasil diperbarui." });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err?.response?.data?.message || "Gagal memperbarui profil." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setAvatarMsg(null);
    try {
      const updated = await employeeProfileService.updateAvatar(file);
      updateUser({ avatar_url: updated.avatar_url });
      setAvatarMsg({ type: "success", text: "Foto berhasil diperbarui." });
    } catch (err: any) {
      setAvatarMsg({ type: "error", text: err?.response?.data?.message || "Gagal mengupload foto." });
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const result = employeePasswordSchema.safeParse({ oldPassword, newPassword, confirmPassword });
    if (!result.success) {
      setPasswordMsg({ type: "error", text: result.error.issues[0].message });
      return;
    }

    changePasswordMutation.mutate({ oldPassword, newPassword }, {
      onSuccess: (data) => {
        setPasswordMsg({ type: "success", text: data.message });
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      },
      onError: (err: any) => {
        setPasswordMsg({ type: "error", text: err?.response?.data?.message || "Gagal mengganti password." });
      },
    });
  };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat profil...</p>
        </div>
      </div>
    );
  }

  const roleLabel = user?.role ? ROLE_LABEL[user.role] : "-";
  const roleBadgeClass = user?.role ? ROLE_COLOR[user.role] : "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-primary pb-16 pt-10 px-5">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white/5" />

        {/* Avatar + identity */}
        <div className="relative flex flex-col items-center gap-3 max-w-md mx-auto">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-xl bg-white/20">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-11 h-11 text-white/70" />
                </div>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-60"
              aria-label="Ganti foto"
            >
              <Camera className="w-4 h-4 text-primary" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif" className="hidden" onChange={handleAvatarChange} />

          {/* Name & role */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              {user?.full_name || "—"}
            </h1>
            <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>

          {/* Status chips */}
          <div className="flex gap-2 mt-0.5">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${user?.is_active ? "bg-white/15 text-white" : "bg-white/10 text-white/50"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user?.is_active ? "bg-green-400" : "bg-gray-400"}`} />
              {user?.is_active ? "Aktif" : "Nonaktif"}
            </div>
            {user?.is_occupied && (
              <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Sedang Bertugas
              </div>
            )}
          </div>

          {avatarMsg && (
            <p className={`text-xs mt-1 ${avatarMsg.type === "success" ? "text-green-300" : "text-red-300"}`}>
              {avatarMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="relative -mt-8 max-w-md mx-auto px-4 pb-28 space-y-4">

        {/* Info Pekerjaan */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Info Pekerjaan</p>
          </div>
          <div className="divide-y divide-gray-50">
            <InfoRow icon={<Shield className="w-4 h-4" />} label="Role" value={roleLabel} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Outlet" value={user?.outlet_name ?? "—"} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user?.email ?? "—"} note="Hanya dapat diubah Super Admin" />
          </div>
        </div>

        {/* Edit Profil */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Edit Profil</p>
          </div>
          <form onSubmit={handleProfileSubmit} className="px-5 pt-4 pb-5 space-y-4">
            <FormField
              id="fullName"
              label="Nama Lengkap"
              icon={<User className="w-4 h-4" />}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <FormField
              id="phone"
              label="No. Telepon"
              icon={<Phone className="w-4 h-4" />}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <FeedbackMsg msg={profileMsg} />
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {profileLoading ? <Spinner /> : "Simpan Perubahan"}
            </button>
          </form>
        </div>

        {/* Ganti Password */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => { setPasswordOpen((v) => !v); setPasswordMsg(null); }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Ganti Password</span>
            </div>
            {passwordOpen
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {passwordOpen && (
            <form onSubmit={handlePasswordSubmit} className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
              {[
                { id: "oldPassword", label: "Password Lama", value: oldPassword, setter: setOldPassword, show: showOld, toggle: () => setShowOld((v) => !v) },
                { id: "newPassword", label: "Password Baru", value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v), hint: "Min. 8 karakter" },
                { id: "confirmPassword", label: "Konfirmasi Password Baru", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
              ].map(({ id, label, value, setter, show, toggle, hint }) => (
                <div key={id} className="space-y-1.5">
                  <label htmlFor={id} className="text-xs font-semibold text-gray-500 block">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      id={id}
                      type={show ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      required
                      minLength={id !== "oldPassword" ? 8 : 1}
                      placeholder={hint || "••••••••"}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-300 transition-colors"
                    />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <FeedbackMsg msg={passwordMsg} />
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {changePasswordMutation.isPending ? <Spinner /> : "Ganti Password"}
              </button>
            </form>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function InfoRow({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
        {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

function FormField({
  id, label, icon, type, value, onChange, required, hint
}: {
  id: string; label: string; icon: React.ReactNode;
  type: string; value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-500 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={hint}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary text-sm transition-colors"
        />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import { User, Phone, Lock, EyeOff, Eye, Camera } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { employeeProfileService } from "@/services/employeeProfile.service";
import { employeeAuthService } from "@/services/employeeAuth.service";

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
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
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
      setAvatarMsg({ type: "success", text: "Foto profil berhasil diperbarui." });
    } catch (err: any) {
      setAvatarMsg({ type: "error", text: err?.response?.data?.message || "Gagal mengupload foto." });
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const result = await employeeAuthService.changePassword(oldPassword, newPassword);
      setPasswordMsg({ type: "success", text: result.message });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err?.response?.data?.message || "Gagal mengganti password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>

        {/* Avatar Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Foto Profil</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
              {avatarLoading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="inline-flex items-center gap-2 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" /> Ganti Foto
              </button>
              <p className="text-xs text-gray-400 mt-1">jpg, jpeg, png, gif — maks. 1 MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif" className="hidden" onChange={handleAvatarChange} />
          </div>
          {avatarMsg && (
            <p className={`text-sm ${avatarMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{avatarMsg.text}</p>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Informasi Profil</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Email</label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400">Email hanya dapat diubah oleh Super Admin.</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 block">No. Telepon</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{profileMsg.text}</p>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {profileLoading ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Simpan Perubahan"}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Ganti Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { id: "oldPassword", label: "Password Lama", value: oldPassword, setter: setOldPassword, show: showOld, toggle: () => setShowOld((v) => !v) },
              { id: "newPassword", label: "Password Baru", value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
              { id: "confirmPassword", label: "Konfirmasi Password Baru", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
            ].map(({ id, label, value, setter, show, toggle }) => (
              <div key={id} className="space-y-1">
                <label htmlFor={id} className="text-sm font-medium text-gray-700 block">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    required
                    minLength={id !== "oldPassword" ? 8 : 1}
                    placeholder={id !== "oldPassword" ? "Min. 8 karakter" : "••••••••"}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary text-sm placeholder:text-gray-400"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle visibility">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{passwordMsg.text}</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {passwordLoading ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Ganti Password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import {
  Shirt,
  Camera,
  BadgeCheck,
  History,
  Wallet,
  ChevronRight,
  LogOut,
  UserCog,
  ShieldCheck,
  Home,
  Truck,
  User,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BarChart3,
  Settings,
  Check,
} from "lucide-react";
import { VerificationStatusBadge } from "@/components/ui/VerificationStatusBadge";
import { BottomNav } from "@/components/layout/BottomNav";

// Profile-specific bottom navigation (active Profile tab)
const ProfileBottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-sm px-md pb-safe border-t border-outline-variant shadow-[0_-1px_3px_0_rgba(0,0,0,0.1)] rounded-t-xl">
    <NavTab icon={Home} label="Home" />
    <NavTab icon={Shirt} label="Orders" />
    <NavTab icon={Truck} label="Pickup" />
    <NavTab icon={User} label="Profile" active />
  </nav>
);

const NavTab = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={`flex flex-col items-center justify-center ${
      active ? "text-primary font-bold" : "text-on-surface-variant"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px]">{label}</span>
  </a>
);

// Sidebar for desktop (right side mockup)
const ProfileSidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
    <div className="flex items-center gap-2 mb-6 px-2">
      <Shirt className="text-primary w-7 h-7" />
      <span className="text-xl font-bold text-primary">FreshPress</span>
    </div>
    <nav className="flex-1 flex flex-col gap-1">
      <SidebarLink icon={LayoutDashboard} label="Dashboard" />
      <SidebarLink icon={ReceiptText} label="Orders" />
      <SidebarLink icon={Package} label="Inventory" />
      <SidebarLink icon={Store} label="Outlets" />
      <SidebarLink icon={User} label="Profile" active />
      <SidebarLink icon={BarChart3} label="Reports" />
    </nav>
    <div className="mt-auto pt-4 border-t border-outline-variant px-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYovqy8Uf8pIvgZ91R4iiwvXKtVCcAmaw6lduRJ-LUWVuts7pAKcTFtxEDjkF0BJGKE7MmBp6jmsoiG3_QlgzY58C3YC3V3mhE-2G52nk2YZ8zI5KtAPgM2ilzEQllnZF2ElLNK_mSbdkZITi5zLyHPIEvdQSZVmgKZsSHRbLdJl6QamTE-DRTlzEYYdb5b1QK3AFAZWpL4Mf6sR1ZLfc6mC9bdFX8by2RMtAWOCeI_72hYL9r_3vgylx-1ZB4X8hAdbAjR4-mqR4"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">Budi Santoso</p>
          <p className="text-xs text-on-surface-variant truncate">
            Member Silver
          </p>
        </div>
        <Settings className="w-5 h-5 text-on-surface-variant" />
      </div>
    </div>
  </aside>
);

const SidebarLink = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </a>
);

export default function ProfilePage() {
  const [name, setName] = useState("Budi Santoso");
  const [email, setEmail] = useState("budi.santoso@email.com");
  const [phone, setPhone] = useState("81234567890");
  const [birthdate, setBirthdate] = useState("1990-05-15");
  const [address, setAddress] = useState(
    "Jl. Melati No. 45, Komplek Perumahan Indah, Jakarta Selatan, 12345",
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSave = () => {
    // TODO: integrate API call
    console.log("Saving profile...", {
      name,
      email,
      phone,
      birthdate,
      address,
    });
    alert("Profil berhasil disimpan! (simulasi)");
  };

  const handleDeleteAccount = () => {
    // TODO: integrate API
    console.log("Deleting account");
    setShowDeleteModal(false);
    alert("Akun akan dihapus (simulasi).");
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-headline-md font-bold text-primary">
            FreshPress Laundry
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiaCmM0wsJ4VBymhfbBCO0foaOQQqg9oW0CgbNZjuvgf9abDdTKzbODPOihrgOqoRkQneene6H1l_S2IQIlOwmnCsb6-Dp7Ptx770rYzoztAj3FiigCMp7GW_YsrST9-BVna8cj6LODGkHLlvAHNy8bCvQSqu53q1lSyqz8rMq8yUb0pY3cjUN9nAEKIgFj6UN8Hjaw9KbdS_mtreg6xoHyWXTQgMbUviKI-fxFPVcIXM65FSn1CyToxY5OYNSqx5b64DBBKl504w"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <ProfileSidebar />

      {/* Main content with sidebar spacer */}
      <div className="lg:pl-72">
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - Profile summary & quick actions */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-primary/10 overflow-hidden bg-surface-container">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIhyiZXUE-t-mPqZeFmBdBr7IMqIG-066POQ4-5FWypj7QOmFzX6QhZLhFarniKr8zB2jaLEXVUV28k6wTyAKbnVY--G7SyiThCn0D9UUP1HAfczsDqDM43ms3y9-HHMlSdbfJrHFT7goGhdg4d2KtT82vHQqd4MbQubGZzHV-8OO5Mgm83pkZArenS9xi0ejvjmAZjK9QxJlShoc6s37HSOyfhM70j-yESW7D_Jf7J9-h4oJFBfaZUB6aKU4x7uDj8ovWBM3YV_Q"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-1 rounded-full shadow-lg hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-1">
                      <h2 className="text-headline-md font-bold">
                        Budi Santoso
                      </h2>
                      <BadgeCheck className="text-primary w-5 h-5" />
                    </div>
                    <p className="text-on-surface-variant text-body-md">
                      Member Silver • Sejak 2023
                    </p>
                  </div>
                  <div className="mt-6 w-full pt-6 border-t border-outline-variant grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-label-sm text-on-surface-variant">
                        Total Pesanan
                      </p>
                      <p className="text-xl font-bold text-secondary">24</p>
                    </div>
                    <div className="text-center">
                      <p className="text-label-sm text-on-surface-variant">
                        Poin Fresh
                      </p>
                      <p className="text-xl font-bold text-primary">1,250</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant">
                  <div className="flex items-center gap-4">
                    <History className="text-primary w-5 h-5" />
                    <span className="text-body-md font-medium">
                      Riwayat Pesanan
                    </span>
                  </div>
                  <ChevronRight className="text-outline w-5 h-5" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant">
                  <div className="flex items-center gap-4">
                    <Wallet className="text-primary w-5 h-5" />
                    <span className="text-body-md font-medium">
                      Metode Pembayaran
                    </span>
                  </div>
                  <ChevronRight className="text-outline w-5 h-5" />
                </button>
                <button
                  onClick={() => console.log("Logout")}
                  className="w-full flex items-center justify-between p-4 hover:bg-error/10 text-error transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <LogOut className="w-5 h-5" />
                    <span className="text-body-md font-medium">
                      Keluar Akun
                    </span>
                  </div>
                </button>
              </div>
            </aside>

            {/* Right column - Forms */}
            <div className="lg:col-span-8 space-y-6">
              {/* Profile Information Form */}
              <section className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <UserCog className="text-primary w-5 h-5" />
                  <h3 className="text-headline-sm font-bold">
                    Informasi Profil
                  </h3>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-md font-semibold text-on-surface-variant">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-label-md font-semibold text-on-surface-variant">
                          Email
                        </label>
                        <VerificationStatusBadge
                          verified={isVerified}
                          loading={resendLoading}
                          onResend={() => {
                            setResendLoading(true);
                            setTimeout(() => setResendLoading(false), 2000);
                          }}
                        />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-md font-semibold text-on-surface-variant">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          +62
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-14 pr-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-md font-semibold text-on-surface-variant">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-label-md font-semibold text-on-surface-variant">
                      Alamat Default
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="bg-primary text-on-primary px-8 py-2 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </section>

              {/* Security Section */}
              <section className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="text-primary w-5 h-5" />
                  <h3 className="text-headline-sm font-bold">Keamanan</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div>
                      <p className="text-body-md font-bold">Kata Sandi</p>
                      <p className="text-label-md text-on-surface-variant">
                        Terakhir diubah 3 bulan yang lalu
                      </p>
                    </div>
                    <button
                      onClick={() => console.log("Navigate to change password")}
                      className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg text-label-md font-bold hover:bg-secondary hover:text-on-secondary transition-colors"
                    >
                      Ganti Kata Sandi
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div>
                      <p className="text-body-md font-bold">
                        Verifikasi 2 Langkah
                      </p>
                      <p className="text-label-md text-on-surface-variant">
                        Amankan akun Anda dengan kode OTP
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>
              </section>

              {/* Delete Account */}
              <div className="pt-4 text-center">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-error text-label-md font-medium hover:underline"
                >
                  Hapus akun secara permanen
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <ProfileBottomNav />

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-on-surface mb-4">
              Hapus Akun?
            </h2>
            <p className="text-on-surface-variant mb-6">
              Semua data pesanan, poin, dan informasi Anda akan hilang secara
              permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 text-sm font-bold bg-error text-on-error rounded-lg hover:opacity-90"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

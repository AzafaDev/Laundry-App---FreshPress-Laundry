"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Mail, AlertTriangle, Send, ShieldOff } from "lucide-react";
import { z } from "zod";
import { useCreateUser, useUpdateUser, useResendInvite } from "@/hooks/useUsers";
import { useOutlets } from "@/hooks/useOutlets";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserRole,
} from "@/types/user.types";

const userFormSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi.")
    .regex(/^[0-9+\-\s]{8,15}$/, "Nomor telepon tidak valid."),
});

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: "super_admin", label: "Super Admin" },
  { value: "outlet_admin", label: "Outlet Admin" },
  { value: "washing_worker", label: "Washing Worker" },
  { value: "ironing_worker", label: "Ironing Worker" },
  { value: "packing_worker", label: "Packing Worker" },
  { value: "driver", label: "Driver" },
];

// Roles that must be assigned to an outlet
const OUTLET_REQUIRED_ROLES: UserRole[] = [
  "outlet_admin",
  "washing_worker",
  "ironing_worker",
  "packing_worker",
  "driver",
];

interface Props {
  user: User | null;
  onClose: () => void;
}

export function UserFormModal({ user, onClose }: Props) {
  const isEdit = !!user;
  const create = useCreateUser();
  const update = useUpdateUser();
  const resendInvite = useResendInvite();

  // Fetch all active outlets for the dropdown
  const { data: outletsData } = useOutlets({ limit: 100, is_active: true });
  const outlets = outletsData?.items ?? [];

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "outlet_admin" as UserRole,
    outlet_id: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        outlet_id: user.outlet_id ?? "",
        password: "",
      });
    }
  }, [user]);

  // Reset outlet_id when switching to super_admin
  useEffect(() => {
    if (form.role === "super_admin") {
      setForm((prev) => ({ ...prev, outlet_id: "" }));
    }
  }, [form.role]);

  const needsOutlet = OUTLET_REQUIRED_ROLES.includes(form.role);
  const pending = create.isPending || update.isPending;
  const isInactive = isEdit && user?.is_active === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = userFormSchema.safeParse({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    if (needsOutlet && !form.outlet_id) {
      setError("Pilih outlet untuk role ini.");
      return;
    }

    try {
      if (isEdit && user) {
        const payload: UpdateUserPayload = {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          outlet_id: form.outlet_id || undefined,
          ...(form.password ? { password: form.password } : {}),
        };
        await update.mutateAsync({ id: user.id, payload });
        onClose();
      } else {
        const payload: CreateUserPayload = {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          outlet_id: form.outlet_id || undefined,
          // is_active not sent — account activates automatically after email verification
        };
        await create.mutateAsync(payload);
        onClose();
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Terjadi kesalahan.";
      setError(msg);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    if (!confirm(`Nonaktifkan akun ${user.full_name}? User tidak bisa login sampai verifikasi ulang.`)) return;
    try {
      await update.mutateAsync({ id: user.id, payload: { is_active: false } });
      onClose();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Gagal menonaktifkan.";
      setError(msg);
    }
  };

  const handleResendInvite = async () => {
    if (!user) return;
    try {
      await resendInvite.mutateAsync(user.id);
      setInviteSent(true);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Gagal mengirim email.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
        {/* Header */}
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">
              {isEdit ? "Edit User" : "Tambah User"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Invite info banner — only shown on create */}
          {!isEdit && (
            <div className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-primary/90 leading-snug">
                Email undangan akan dikirim ke karyawan untuk membuat password. Setelah password dibuat, mereka langsung diarahkan ke dashboard masing-masing.
              </p>
            </div>
          )}

          <Field label="Nama Lengkap">
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Nomor Telepon">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className={inputClass}
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className={inputClass}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Outlet assignment — shown for all roles except super_admin */}
          {needsOutlet && (
            <Field label={`Outlet${isEdit ? "" : " *"}`}>
              <select
                value={form.outlet_id}
                onChange={(e) => setForm({ ...form, outlet_id: e.target.value })}
                required
                className={inputClass}
              >
                <option value="">— Pilih outlet —</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              {outlets.length === 0 && (
                <p className="text-xs text-on-surface-variant mt-1 ml-1">
                  Belum ada outlet aktif. Buat outlet terlebih dahulu.
                </p>
              )}
            </Field>
          )}

          {/* Status section — only in edit mode */}
          {isEdit && (
            <div className="rounded-xl border border-outline-variant overflow-hidden">
              <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status Akun</p>
              </div>

              {isInactive ? (
                /* ── User INACTIVE ── */
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Akun Nonaktif</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        User tidak dapat login. Kirim email verifikasi agar user dapat membuat password baru dan akun aktif kembali secara otomatis.
                      </p>
                    </div>
                  </div>

                  {inviteSent ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary-container/40 border border-secondary/20 rounded-lg text-sm text-on-secondary-container">
                      <Mail className="w-4 h-4 shrink-0" />
                      Email verifikasi berhasil dikirim ke <strong>{user?.email}</strong>.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendInvite}
                      disabled={resendInvite.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      {resendInvite.isPending ? "Mengirim..." : "Kirim Email Verifikasi"}
                    </button>
                  )}
                </div>
              ) : (
                /* ── User ACTIVE ── */
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <p className="text-sm text-on-surface">Akun <span className="font-semibold">Aktif</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    disabled={update.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-error text-error rounded-lg text-xs font-semibold hover:bg-error-container/30 disabled:opacity-60 transition-all"
                  >
                    <ShieldOff className="w-3.5 h-3.5" />
                    Nonaktifkan
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="py-3 px-6 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
            >
              {pending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan"
                  : "Buat & Kirim Undangan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

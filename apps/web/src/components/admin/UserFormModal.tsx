"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Mail } from "lucide-react";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserRole,
} from "@/types/user.types";

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: "super_admin", label: "Super Admin" },
  { value: "outlet_admin", label: "Outlet Admin" },
  { value: "worker", label: "Worker" },
  { value: "driver", label: "Driver" },
  { value: "customer", label: "Customer" },
];

interface Props {
  user: User | null;
  onClose: () => void;
}

// Local form shape: password is always optional on the client; we send it
// only when the admin actually typed something.
type FormState = Omit<CreateUserPayload, "password"> & { password: string };

export function UserFormModal({ user, onClose }: Props) {
  const isEdit = !!user;
  const create = useCreateUser();
  const update = useUpdateUser();

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    role: "outlet_admin",
    password: "",
    is_verified: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [successInvite, setSuccessInvite] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        password: "",
        is_verified: user.is_verified,
      });
    }
  }, [user]);

  const pending = create.isPending || update.isPending;
  // Create-mode only: if password is blank, this submission becomes an invite.
  const willInvite = !isEdit && form.password.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInvite(null);
    try {
      if (isEdit && user) {
        const payload: UpdateUserPayload = {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          is_verified: form.is_verified,
          ...(form.password ? { password: form.password } : {}),
        };
        await update.mutateAsync({ id: user.id, payload });
        onClose();
      } else {
        const payload: CreateUserPayload = {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          // Only attach password when admin actually typed one — leaving it
          // off triggers the server-side invite/verification flow.
          ...(form.password ? { password: form.password } : {}),
          // is_verified only matters in direct-create mode; the server forces
          // false when inviting.
          is_verified: willInvite ? false : form.is_verified,
        };
        const result = await create.mutateAsync(payload);
        if (willInvite) {
          setSuccessInvite(
            `Email verifikasi telah dikirim ke ${result.email}. Link berlaku 24 jam.`,
          );
          // keep the modal open briefly so the admin sees the confirmation,
          // then close
          setTimeout(onClose, 1800);
        } else {
          onClose();
        }
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Terjadi kesalahan.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
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

          <Field
            label={
              isEdit
                ? "Password Baru (opsional)"
                : "Password (opsional — kosongkan untuk kirim email invite)"
            }
          >
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={
                isEdit
                  ? "Kosongkan jika tidak diubah"
                  : "Kosongkan agar user atur sendiri lewat email"
              }
              className={inputClass}
            />
          </Field>

          {/* Invite hint shown only in create-mode when password is empty */}
          {willInvite && (
            <div className="flex items-start gap-2 text-sm text-on-surface-variant bg-primary/5 border border-primary/20 px-3 py-2 rounded-md">
              <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>
                Mode invite aktif. Sistem akan mengirim email verifikasi ke{" "}
                <strong>{form.email || "alamat email"}</strong>; user akan klik
                link & membuat password-nya sendiri.
              </span>
            </div>
          )}

          {/* "Mark verified" only applies when admin sets the password directly */}
          {!willInvite && !isEdit && (
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                checked={!!form.is_verified}
                onChange={(e) =>
                  setForm({ ...form, is_verified: e.target.checked })
                }
              />
              Tandai akun sudah terverifikasi
            </label>
          )}
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                checked={!!form.is_verified}
                onChange={(e) =>
                  setForm({ ...form, is_verified: e.target.checked })
                }
              />
              Akun terverifikasi
            </label>
          )}

          {error && (
            <p className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          {successInvite && (
            <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
              {successInvite}
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
                : willInvite
                  ? "Kirim Invite"
                  : "Simpan"}
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

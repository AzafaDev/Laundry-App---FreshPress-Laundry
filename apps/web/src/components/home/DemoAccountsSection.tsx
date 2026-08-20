import Link from "next/link";
import {
  Clock,
  Droplets,
  KeyRound,
  Package,
  Shirt,
  ShieldCheck,
  Store,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  DEMO_OUTLETS,
  DEMO_PASSWORD,
  DEMO_WORKER_ROLES,
  SHIFT_WINDOWS,
} from "@/lib/demoAccounts";

const WORKER_ICONS: Record<string, LucideIcon> = {
  driver: Truck,
  washing_worker: Droplets,
  ironing_worker: Shirt,
  packing_worker: Package,
};

type Role = {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  meta: string;
};

const ROLES: Role[] = [
  {
    title: "Customer",
    desc: "Buat order, pilih alamat, bayar, lalu lacak statusnya sampai diantar kembali.",
    icon: User,
    href: "/customer/login",
    meta: "1 akun · tanpa shift",
  },
  {
    title: "Super Admin",
    desc: "Akses seluruh outlet: pegawai, item laundry, laporan penjualan, dan bypass request.",
    icon: ShieldCheck,
    href: "/employee/login",
    meta: "1 akun · tanpa shift",
  },
  {
    title: "Outlet Admin",
    desc: "Kelola satu outlet saja — pegawai, jadwal shift, dan order yang masuk ke outlet itu.",
    icon: Store,
    href: "/employee/login",
    meta: `${DEMO_OUTLETS.length} akun · tanpa shift`,
  },
  ...DEMO_WORKER_ROLES.map((role) => ({
    title: role.label,
    desc: role.desc,
    icon: WORKER_ICONS[role.key] ?? Package,
    href: "/employee/login",
    meta: `${DEMO_OUTLETS.length * 2} akun · shift Pagi & Siang`,
  })),
];

export const DemoAccountsSection = ({ id }: { id?: string }) => (
  <section id={id} className="bg-white px-4 py-20 md:px-8">
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Akun Demo
        </span>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
          Coba setiap peran tanpa perlu daftar.
        </h2>
        <p className="mt-3 text-gray-500">
          Aplikasi ini punya tujuh peran dengan hak akses dan tampilan yang berbeda-beda. Pilih
          salah satu di bawah — daftar akunnya sudah menunggu di halaman login, tinggal tekan{" "}
          <span className="font-semibold text-gray-700">&ldquo;Isi otomatis dengan akun demo&rdquo;</span>.
        </p>

        <div className="mt-5 inline-flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <KeyRound className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="text-sm text-gray-600">
            Password seluruh akun: <code className="font-bold text-gray-900">{DEMO_PASSWORD}</code>
          </span>
        </div>
      </div>

      {/* Kartu peran */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Link
            key={role.title}
            href={role.href}
            className="group rounded-2xl border border-gray-100 p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <role.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900">{role.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{role.desc}</p>
            <p className="mt-3 text-xs font-semibold text-gray-400">{role.meta}</p>
            <span className="mt-4 inline-block text-sm font-bold text-primary group-hover:underline">
              Masuk sebagai {role.title.toLowerCase()} →
            </span>
          </Link>
        ))}
      </div>

      {/* Catatan shift — mencegah penolakan check-in dikira bug */}
      <div className="mt-8 flex gap-3 rounded-2xl bg-surface-container-low px-5 py-4">
        <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">Soal absensi driver &amp; worker:</span>{" "}
          setiap peran punya akun shift Pagi ({SHIFT_WINDOWS.morning.range}) dan Siang (
          {SHIFT_WINDOWS.afternoon.range}). Check-in hanya bisa dilakukan di dalam jam shift
          akun tersebut — di luar itu sistem menolak, dan itu memang aturannya. Halaman login
          menandai akun mana yang sedang bisa absen saat ini.
        </p>
      </div>
    </div>
  </section>
);

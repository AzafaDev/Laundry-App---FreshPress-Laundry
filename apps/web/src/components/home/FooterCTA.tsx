"use client"
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";


export const FooterCTA = () => {
  const user = useAuthStore((s) => s.user);
  const ctaHref = user ? "/customer/pickup" : "/customer/register";

  return (
    <section className="bg-primary py-20 px-4 md:px-8 text-center">
      <div className="max-w-[48rem] mx-auto">
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
          Mulai Sekarang
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Pakaian bersih hanya satu klik.
        </h2>
        <p className="text-white/80 text-base mb-8">
          Bergabunglah dengan ribuan pelanggan yang sudah mempercayakan laundry
          mereka kepada FreshPress.
        </p>
        <Link
          href={ctaHref}
          className="inline-block bg-white text-primary px-10 py-4 rounded-xl font-bold text-base shadow-md hover:bg-gray-100 transition-colors"
        >
          Jadwalkan Penjemputan
        </Link>
      </div>
    </section>
  );
};

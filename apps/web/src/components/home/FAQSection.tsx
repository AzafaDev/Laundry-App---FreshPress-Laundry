"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Bagaimana cara memesan layanan FreshPress?",
    a: "Cukup daftar akun, pilih layanan yang Anda butuhkan, tentukan waktu penjemputan, dan tim kami akan datang ke lokasi Anda. Prosesnya mudah dan cepat hanya dalam beberapa klik.",
  },
  {
    q: "Berapa lama waktu pengerjaan laundry?",
    a: "Layanan reguler selesai dalam 1–2 hari kerja. Kami juga menyediakan layanan express yang selesai dalam 6 jam untuk kebutuhan mendesak Anda.",
  },
  {
    q: "Apakah ada biaya tambahan untuk penjemputan dan pengiriman?",
    a: "Tidak! Semua layanan kami sudah termasuk jemput dan antar gratis ke seluruh area yang kami layani.",
  },
  {
    q: "Bagaimana jika ada pakaian yang rusak saat proses pencucian?",
    a: "Kami menjamin keamanan setiap pakaian. Jika terjadi kerusakan akibat kelalaian kami, kami akan memberikan kompensasi sesuai ketentuan yang berlaku.",
  },
  {
    q: "Apakah bisa melacak status pesanan secara real-time?",
    a: "Ya! Setelah memesan, Anda dapat melacak status pesanan secara real-time melalui dashboard akun Anda — mulai dari penjemputan, proses cuci, hingga pengiriman.",
  },
  {
    q: "Daerah mana saja yang dilayani FreshPress?",
    a: "Saat ini kami melayani area Jakarta, Bandung, Surabaya, dan terus berkembang. Masukkan alamat Anda saat pemesanan untuk mengecek ketersediaan di area Anda.",
  },
];

export const FAQSection = ({ id }: { id?: string }) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id={id} className="bg-white py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: header */}
          <div>
            <div className="mb-8">
              <span className="text-primary font-bold uppercase tracking-widest text-xs">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                Ada pertanyaan? Kami siap membantu.
              </h2>
              <p className="text-gray-500 mt-3">
                Tidak menemukan jawaban? Hubungi tim support kami yang siap 24/7.
              </p>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Bagaimana alur pemesanan laundry di FreshPress?",
    a: "Daftar akun → verifikasi email → simpan alamat pickup → buat order dan pilih tanggal penjemputan (maks. 7 hari ke depan) → driver menjemput laundry Anda → laundry diproses di outlet (cuci, setrika, packing) → Anda mendapat tagihan dan melakukan pembayaran → driver mengantarkan kembali ke rumah Anda.",
  },
  {
    q: "Kapan saya membayar dan bagaimana cara pembayarannya?",
    a: "Pembayaran dilakukan setelah laundry selesai diproses di outlet dan total biaya sudah dihitung berdasarkan berat atau jumlah item aktual. Anda akan mendapat notifikasi untuk melakukan pembayaran melalui Midtrans — mendukung transfer bank, kartu kredit, dan dompet digital.",
  },
  {
    q: "Apakah ada biaya penjemputan dan pengiriman?",
    a: "Gratis untuk alamat yang berada dalam radius 5 km dari outlet terdekat. Di luar radius tersebut dikenakan biaya pengiriman flat. Estimasi biaya pengiriman bisa Anda lihat sebelum konfirmasi order berdasarkan alamat yang dipilih.",
  },
  {
    q: "Bagaimana outlet dipilihkan untuk pesanan saya?",
    a: "Sistem secara otomatis memilih outlet aktif terdekat berdasarkan koordinat alamat pickup Anda. Anda tidak perlu memilih outlet secara manual — sistem yang menentukan agar proses lebih efisien.",
  },
  {
    q: "Bagaimana cara melacak status pesanan saya?",
    a: "Setiap perubahan status dapat Anda pantau secara real-time di halaman 'Pesanan'. Status meliputi: Menunggu Driver Pickup → Driver Menjemput → Tiba di Outlet → Sedang Dicuci → Sedang Disetrika → Sedang Dipacking → Menunggu Pembayaran → Siap Diantar → Sedang Dikirim → Diterima. Setiap tahap disertai notifikasi.",
  },
  {
    q: "Bagaimana jika saya tidak puas dengan hasil laundry?",
    a: "Anda dapat mengajukan komplain saat status pesanan 'Diterima Customer'. Tersedia tipe komplain: item hilang, item rusak, item tertukar, pengantaran terlambat, atau kualitas kurang baik. Unggah foto bukti untuk mempercepat proses. Tim kami akan merespons dan memberikan solusi — termasuk cuci ulang atau refund sesuai ketentuan.",
  },
  {
    q: "Apakah akun harus diverifikasi sebelum bisa memesan?",
    a: "Ya, verifikasi email diperlukan sebelum Anda bisa membuat order. Setelah mendaftar, cek inbox untuk link verifikasi. Anda juga bisa mendaftar dan masuk menggunakan akun Google tanpa perlu verifikasi manual.",
  },
  {
    q: "Bisakah saya menyimpan lebih dari satu alamat pickup?",
    a: "Tentu. Anda dapat menyimpan beberapa alamat (Rumah, Kantor, Apartemen, dll.) di halaman 'Alamat Saya'. Satu alamat dapat dijadikan sebagai alamat utama yang otomatis terpilih saat membuat order baru.",
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

// apps/web/src/components/home/ProcessSection.tsx
import Image from "next/image";

export const ProcessSection = () => (
  <section className="bg-surface-container py-16 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Gambar */}
        <div className="relative h-64 sm:h-80 lg:h-96">
          <Image
            className="rounded-3xl shadow-xl object-cover"
            src="/images/laundry-process.jpg"
            alt="Petugas laundry melipat pakaian"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Teks Langkah */}
        <div className="space-y-6">
          <span className="text-primary font-bold uppercase tracking-widest text-xs">
            Bagaimana Kami Bekerja
          </span>
          <h2 className="text-3xl font-bold text-on-surface">
            Tanpa Repot, <br />
            Tanpa Menunggu.
          </h2>
          <p className="text-base text-on-surface-variant">
            Kami mengintegrasikan teknologi logistik modern dengan keahlian
            perawatan kain kelas dunia untuk memastikan pakaian Anda selalu
            dalam kondisi terbaik.
          </p>

          <div className="space-y-4 pt-4">
            {[
              {
                step: 1,
                title: "Pesan & Jadwal",
                desc: "Tentukan waktu penjemputan lewat aplikasi.",
              },
              {
                step: 2,
                title: "Penjemputan Cepat",
                desc: "Kurir kami akan menjemput pakaian Anda dalam 30 menit.",
              },
              {
                step: 3,
                title: "Pantau Real-time",
                desc: "Lihat status cucian Anda langsung dari genggaman.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {item.step}
                </span>
                <div>
                  <h4 className="font-bold text-on-surface">{item.title}</h4>
                  <p className="text-on-surface-variant text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

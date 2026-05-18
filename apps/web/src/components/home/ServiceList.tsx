// apps/web/src/components/home/ServiceList.tsx
import Link from "next/link";

const services = [
  {
    emoji: "🧺",
    title: "Wash & Fold",
    desc: "Cuci bersih dan lipat rapi. Ideal untuk pakaian harian.",
    tag: "Terpopuler",
    tagColor: "bg-primary text-white",
    price: "Rp 10.000",
    unit: "/kg",
  },
  {
    emoji: "👔",
    title: "Wash & Setrika",
    desc: "Cuci plus penyetrikaan uap profesional untuk hasil licin.",
    tag: "Esensial",
    tagColor: "bg-surface-container-high text-on-surface-variant",
    price: "Rp 15.000",
    unit: "/kg",
  },
  {
    emoji: "✨",
    title: "Dry Cleaning",
    desc: "Perawatan khusus untuk jas, gaun, dan kain halus.",
    tag: "Premium",
    tagColor: "bg-tertiary-container text-on-tertiary-container",
    price: "Rp 25.000",
    unit: "/pcs",
  },
  {
    emoji: "⚡",
    title: "Express 6 Jam",
    desc: "Laundry kilat selesai dalam 6 jam untuk kebutuhan mendesak.",
    tag: "Kilat",
    tagColor: "bg-secondary/10 text-secondary",
    price: "Rp 20.000",
    unit: "/kg",
  },
];

export const ServiceList = ({ id }: { id?: string }) => (
  <section id={id} className="bg-surface-container-low py-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <span className="text-primary font-bold uppercase tracking-widest text-xs">
          Harga & Layanan
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
          Harga transparan, hasil memuaskan.
        </h2>
        <p className="text-gray-500 mt-3">
          Semua harga sudah termasuk jemput & antar gratis. Tidak ada biaya
          tersembunyi.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((svc) => (
          <div
            key={svc.title}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
          >
            <span className="text-4xl mb-4 block">{svc.emoji}</span>
            <span
              className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 ${svc.tagColor}`}
            >
              {svc.tag}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{svc.title}</h3>
            <p className="text-sm text-gray-500 flex-1 mb-5">{svc.desc}</p>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-2xl font-extrabold text-primary">{svc.price}</span>
              <span className="text-sm text-gray-400">{svc.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/register"
          className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md"
        >
          Pesan Sekarang
        </Link>
      </div>
    </div>
  </section>
);

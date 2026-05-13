// apps/web/src/components/home/ServiceList.tsx

import { WashingMachine, Shirt, TowelRack } from "lucide-react";

const services = [
  {
    icon: WashingMachine,
    title: "Wash & Fold",
    desc: "Cuci bersih dan lipat rapi. Ideal untuk pakaian harian dan handuk.",
    tag: "Best Seller",
    tagColor: "bg-primary-fixed text-on-primary-fixed",
    price: "Rp 10.000/kg",
  },
  {
    icon: Shirt,
    title: "Ironing Only",
    desc: "Penyetrikaan profesional dengan uap untuk hasil yang licin sempurna.",
    tag: "Essential",
    tagColor: "bg-surface-container-high text-on-surface-variant",
    price: "Rp 7.000/kg",
  },
  {
    icon: TowelRack,
    title: "Dry Cleaning",
    desc: "Perawatan khusus untuk jas, gaun, dan kain halus Anda.",
    tag: "Urgent Ready",
    tagColor: "bg-tertiary-fixed text-on-tertiary-fixed",
    price: "Rp 25.000/pc",
  },
];

export const ServiceList = () => (
  <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-on-surface">Layanan Kami</h2>
      <p className="text-sm text-on-surface-variant mt-2">
        Pilih paket yang sesuai dengan kebutuhan Anda
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((svc, idx) => {
        const Icon = svc.icon;
        return (
          <div
            key={idx}
            className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
          >
            <div className="bg-surface-container-low w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
              <Icon className="text-primary w-8 h-8 group-hover:text-on-primary-container" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              {svc.title}
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">{svc.desc}</p>
            <div className="mt-auto flex justify-between items-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${svc.tagColor}`}
              >
                {svc.tag}
              </span>
              <span className="text-primary font-bold">{svc.price}</span>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

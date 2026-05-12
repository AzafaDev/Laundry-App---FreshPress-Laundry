import { Shirt, TowelRack, WashingMachine } from "lucide-react";

interface CardProps {
  icon: any;
  title: string;
  desc: string;
  tag: string;
  price: string;
  urgent?: boolean;
}

const ServiceCard = ({ icon, title, desc, tag, price, urgent }: CardProps) => (
  <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
    <div className="bg-surface-container-low w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors text-primary text-3xl group-hover:text-on-primary-container">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
    <p className="text-sm text-on-surface-variant mb-6">{desc}</p>
    <div className="flex justify-between items-center">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          urgent
            ? "bg-tertiary-fixed text-on-tertiary-fixed"
            : "bg-surface-container-high text-on-surface-variant"
        }`}
      >
        {tag}
      </span>
      <span className="text-primary font-bold">{price}</span>
    </div>
  </div>
);

export const ServiceList = () => (
  <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-on-surface">Layanan Kami</h2>
      <p className="text-sm text-on-surface-variant">
        Pilih paket yang sesuai dengan kebutuhan Anda
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ServiceCard
        icon={<Shirt />}
        title="Wash & Fold"
        desc="Cuci bersih dan lipat rapi. Ideal untuk pakaian harian dan handuk."
        tag="Best Seller"
        price="Rp 10.000/kg"
      />
      <ServiceCard
        icon={<WashingMachine />}
        title="Ironing Only"
        desc="Penyetrikaan profesional dengan uap untuk hasil yang licin sempurna."
        tag="Essential"
        price="Rp 7.000/kg"
      />
      <ServiceCard
        icon={<TowelRack />}
        title="Dry Cleaning"
        desc="Perawatan khusus untuk jas, gaun, dan kain halus Anda."
        tag="Urgent Ready"
        price="Rp 25.000/pc"
        urgent
      />
    </div>
  </section>
);

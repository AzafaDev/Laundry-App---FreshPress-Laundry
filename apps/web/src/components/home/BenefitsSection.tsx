import Image from "next/image";
import { ShieldCheck, Clock, RefreshCw, Leaf } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Penanganan Aman & Terpercaya",
    desc: "Setiap pakaian ditangani dengan teliti oleh tim profesional bersertifikat kami.",
  },
  {
    icon: Clock,
    title: "Pengalaman 10 Tahun",
    desc: "Kami telah melayani ribuan pelanggan dengan reputasi keandalan dan konsistensi.",
  },
  {
    icon: RefreshCw,
    title: "Perawatan Premium Setiap Saat",
    desc: "Setiap pakaian mendapat perlakuan terbaik sesuai jenis kain dan kebutuhannya.",
  },
  {
    icon: Leaf,
    title: "Ramah Lingkungan",
    desc: "Penggunaan deterjen eco-friendly dan efisiensi air untuk masa depan yang lebih hijau.",
  },
];

export const BenefitsSection = () => (
  <section className="bg-white py-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-14">
        {/* Left: image */}
        <div className="flex-1 w-full">
          <div className="relative h-80 lg:h-[460px] w-full">
            <Image
              src="/images/laundry-process.jpg"
              alt="Tim FreshPress bekerja"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover rounded-3xl shadow-xl"
            />
          </div>
        </div>

        {/* Right: benefits list */}
        <div className="flex-1">
          <span className="text-primary font-bold uppercase tracking-widest text-xs">
            Mengapa FreshPress?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-8">
            Kepercayaan Anda adalah prioritas utama kami.
          </h2>
          <div className="space-y-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

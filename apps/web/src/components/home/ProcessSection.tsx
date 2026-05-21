// apps/web/src/components/home/ProcessSection.tsx

const steps = [
  {
    number: "01",
    title: "Pesan & Kemas",
    desc: "Kemas pakaian Anda dan pilih waktu penjemputan yang sesuai melalui aplikasi atau website kami.",
    color: "bg-primary/10 text-primary",
  },
  {
    number: "02",
    title: "Dijemput & Dicuci",
    desc: "Kurir kami menjemput pakaian Anda dan membawanya ke fasilitas cuci profesional terdekat.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    number: "03",
    title: "Bersih & Diantar",
    desc: "Pakaian Anda yang bersih dikemas rapi dan diantarkan kembali ke depan pintu Anda.",
    color: "bg-tertiary/10 text-tertiary",
  },
];

export const ProcessSection = () => (
  <section id="how-it-works" className="bg-white py-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-14">
        <span className="text-primary font-bold uppercase tracking-widest text-xs">
          Cara Kerja
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
          Serahkan urusan laundry pada kami.
        </h2>
        <p className="text-gray-500 mt-3">
          Cukup tiga langkah mudah — pakaian Anda kembali bersih tanpa harus keluar rumah.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-start">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl font-extrabold ${step.color}`}
            >
              {step.number}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);




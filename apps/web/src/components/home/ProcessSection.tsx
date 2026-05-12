export const ProcessSection = () => (
  <section className="bg-surface-container py-12 md:py-16 px-4 md:px-8 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Gambar kiri (desktop), di atas pada mobile */}
        <div className="order-2 lg:order-1 relative">
          <img
            className="rounded-3xl shadow-xl w-full"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5dfWx8Hn-ue-ljKH15q_g8iIjqjCR7fRxI9dtyHpTND7k5JG-4W6Wi08poCl-FZknyaOkGyNk4ArRTg-cJJOfZbUTmwClGkV-NaiXkSXogS2BxALp2c2O-x6nhUFJzLmSlIMlK3SEEVjr5MPjX9V37dSJEzO2AyCnXv1qddzc0wt9SfOUSALgLieCdrCg6BdlzNgnpk5CqupOLi2tBwJUa7GtUpsCCSclhUbE-SZWrGUsmxDxu8fSG8SHWfWNDBI9j1c4mvs_9JM"
            alt="Petugas laundry melipat pakaian"
          />
          {/* Floating status card (muncul di layar besar) */}
          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 hidden xl:block">
            <div className="bg-surface p-6 rounded-2xl shadow-2xl space-y-4 border border-outline-variant max-w-xs">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container w-2 h-2 rounded-full" />
                <p className="text-sm font-medium">Order Received</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container w-2 h-2 rounded-full" />
                <p className="text-sm font-medium">Washing in Progress</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary w-2 h-2 rounded-full ring-4 ring-primary-fixed" />
                <p className="text-sm font-bold text-primary">
                  Drying & Folding
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-outline-variant w-2 h-2 rounded-full" />
                <p className="text-sm text-outline">Ready for Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teks kanan */}
        <div className="order-1 lg:order-2 space-y-6">
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
            <div className="flex gap-4 items-start">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </span>
              <div>
                <h4 className="font-bold text-on-surface">Pesan & Jadwal</h4>
                <p className="text-on-surface-variant text-sm">
                  Tentukan waktu penjemputan lewat aplikasi.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </span>
              <div>
                <h4 className="font-bold text-on-surface">Penjemputan Cepat</h4>
                <p className="text-on-surface-variant text-sm">
                  Kurir kami akan menjemput pakaian Anda dalam 30 menit.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </span>
              <div>
                <h4 className="font-bold text-on-surface">Pantau Real-time</h4>
                <p className="text-on-surface-variant text-sm">
                  Lihat status cucian Anda langsung dari genggaman.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

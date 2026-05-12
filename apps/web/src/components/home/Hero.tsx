import { MapPin, BadgeCheck } from "lucide-react";

export const Hero = () => (
  <section className="relative bg-surface-container-low py-12 md:py-16 px-4 md:px-8 overflow-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <HeroContent />
      <HeroImageSection />
    </div>
  </section>
);

const HeroContent = () => (
  <div className="z-10 text-center lg:text-left">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-4">
      Laundry Hari Ini, <br />
      <span className="text-primary">Bersih Esok Pagi.</span>
    </h1>
    <p className="text-lg text-on-surface-variant mb-8 max-w-xl mx-auto lg:mx-0">
      Nikmati kemudahan layanan cuci premium langsung dari pintu rumah Anda.
      Cepat, higienis, dan terpercaya.
    </p>
    <SearchBar />
    <button className="bg-primary text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform">
      Pesan Sekarang
    </button>
  </div>
);

const SearchBar = () => (
  <div
    role="search"
    aria-label="Cari outlet laundry terdekat"
    className="bg-surface shadow-sm border border-outline-variant rounded-xl p-1 flex items-center mb-8 max-w-md mx-auto lg:mx-0"
  >
    <MapPin className="ml-2 text-outline w-5 h-5" aria-hidden="true" />
    <label htmlFor="outlet-search" className="sr-only">
      Cari outlet
    </label>
    <input
      id="outlet-search"
      className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-3 text-base"
      placeholder="Cari outlet terdekat..."
    />
    <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium">
      Cari
    </button>
  </div>
);

const HeroImageSection = () => (
  <div className="relative hidden lg:block">
    <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-surface bg-surface-container-high">
      <img
        className="w-full h-full object-cover"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW_6uxG6NVxTRRBmmciRFNZ1qMOWFLme8_50_-ame8pz98HPgrCetFRic7johkqbhZUZ1VAaNqw1cxFKPh9GrTssrSFZWJZf1GwDvkSViaJvHgPPx5hGG3ksixD4T0gYuLq_mJZykZybR015HIa6U40RQ9Lox2J6XP0ofCXIMAUl5jfdX5cXqjpSmtUlxPR-XFkdCrz_j6R6lvJ1jMFAXu0syHajnmaWD0eBWLSgweN1pPwwlc2B8kEglIE5jTBKHKEaM2fZhMPik"
        alt="Interior laundry modern"
      />
    </div>
    <FloatingBadge />
  </div>
);

const FloatingBadge = () => (
  <div className="absolute -bottom-6 -left-6 bg-surface p-4 rounded-xl shadow-lg border border-outline-variant flex items-center gap-3">
    <div className="bg-primary-container p-2 rounded-full text-on-primary-container">
      <BadgeCheck className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-bold text-on-surface">Terjamin Higienis</p>
      <p className="text-xs text-on-surface-variant">Standard Pro</p>
    </div>
  </div>
);

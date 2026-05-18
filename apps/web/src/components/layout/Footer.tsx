import Link from "next/link";
import { Shirt } from "lucide-react";

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 py-14 px-4 md:px-8">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      {/* Brand */}
      <div className="space-y-4">
        <Link href="/" className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <span className="text-lg font-bold text-primary">FreshPress</span>
        </Link>
        <p className="text-sm text-gray-500 leading-relaxed">
          Layanan laundry premium terbaik di kota Anda. Bersih, cepat, dan
          terpercaya.
        </p>
        <div className="flex gap-3 pt-1">
          {[
            { icon: <FacebookIcon />, label: "Facebook" },
            { icon: <InstagramIcon />, label: "Instagram" },
            { icon: <TwitterIcon />, label: "Twitter" },
          ].map(({ icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>

      {/* Jelajahi */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Jelajahi</h4>
        <ul className="space-y-2.5">
          {[
            { label: "Cara Kerja", href: "/#how-it-works" },
            { label: "Harga & Layanan", href: "/#services" },
            { label: "Ulasan Pelanggan", href: "/#testimonials" },
            { label: "FAQ", href: "/#faq" },
          ].map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="text-sm text-gray-500 hover:text-primary transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Layanan */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Layanan</h4>
        <ul className="space-y-2.5">
          {["Wash & Fold", "Wash & Setrika", "Dry Cleaning", "Express 6 Jam"].map((item) => (
            <li key={item}>
              <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Perusahaan */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Perusahaan</h4>
        <ul className="space-y-2.5">
          {["Tentang Kami", "Karir", "Blog", "Kontak"].map((item) => (
            <li key={item}>
              <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
      <p>© 2024 FreshPress Laundry. Seluruh hak cipta dilindungi.</p>
      <div className="flex gap-4">
        <a href="#" className="hover:text-primary transition-colors">Privasi</a>
        <a href="#" className="hover:text-primary transition-colors">Ketentuan</a>
        <a href="#" className="hover:text-primary transition-colors">Cookie</a>
      </div>
    </div>
  </footer>
);


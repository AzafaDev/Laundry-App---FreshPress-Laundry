import { Shirt, MapPin, Phone, Mail } from "lucide-react";

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer = () => (
  <footer className="bg-inverse-surface text-inverse-on-surface py-12 px-4 md:px-8">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shirt className="text-inverse-primary w-7 h-7" />
          <span className="text-xl font-bold text-inverse-primary">
            FreshPress
          </span>
        </div>
        <p className="text-sm opacity-80">
          Layanan laundry premium terbaik di kota Anda. Bersih, cepat, dan
          terpercaya sejak 2015.
        </p>
        <div className="flex gap-3">
          <a
            href="#"
            aria-label="Facebook"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-inverse-primary hover:text-on-primary transition-colors"
          >
                        <FacebookIcon />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-inverse-primary hover:text-on-primary transition-colors"
          >
                        <InstagramIcon />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-inverse-primary hover:text-on-primary transition-colors"
          >
                        <TwitterIcon />
          </a>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4 text-white">Tentang Kami</h4>
        <ul className="space-y-2 opacity-80 text-sm">
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Visi & Misi
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Tim Kami
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Karir
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Testimoni
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4 text-white">Layanan</h4>
        <ul className="space-y-2 opacity-80 text-sm">
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Cuci & Lipat
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Setrika Saja
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Dry Cleaning
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-inverse-primary">
              Express 6 Jam
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4 text-white">Kontak</h4>
        <ul className="space-y-3 opacity-80 text-sm">
          <li className="flex items-start gap-2">
            <MapPin className="text-inverse-primary w-5 h-5 shrink-0 mt-0.5" />
            <span>Jl. Kebersihan No. 123, Jakarta Selatan</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="text-inverse-primary w-5 h-5 shrink-0" />
            <span>(021) 555-0123</span>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="text-inverse-primary w-5 h-5 shrink-0" />
            <span>halo@freshpress.id</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center opacity-60 text-xs">
      <p>© 2024 FreshPress Laundry. Seluruh hak cipta dilindungi.</p>
    </div>
  </footer>
);

import { Shirt, Locate } from "lucide-react";

export const OutletMap = () => (
  <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-sm border border-outline-variant bg-surface-container">
    <img
      alt="Map"
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGEeM-mHan54X3FWausRULdv_xernDumFe5TliYdLZTUKIxYAQUbw3P9H6Sj4IZqXZmjxA4okksiMSUJhQh8ygLvP9t-9pAicOLIZIkbmrUZIjGsk51YllYlm7hJ-34eUqy7lXt-ML8ubHG4KKCP6dZdi0j28py0XljFCLoU_pzQgN6SxbBBDHTTBnDgtOy1Y3kxzaN-UdozH7BoC8Ti5BzjDt3HnYxATsQZgW6HrtrbopGfkBx0bxxhwDL2CgaHjWEfWaveuNWq0"
      className="w-full h-full object-cover"
    />
    <div className="absolute top-1/4 left-1/3 group">
      <div className="bg-primary text-on-primary p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
        <Shirt className="w-4 h-4" />
      </div>
    </div>
    <div className="absolute top-1/2 right-1/4 group">
      <div className="bg-primary text-on-primary p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
        <Shirt className="w-4 h-4" />
      </div>
    </div>
    <div className="absolute bottom-1/4 left-1/2 group">
      <div className="bg-primary-container text-on-primary-container p-3 rounded-full shadow-xl animate-bounce">
        <Locate className="w-5 h-5" />
      </div>
    </div>
  </div>
);

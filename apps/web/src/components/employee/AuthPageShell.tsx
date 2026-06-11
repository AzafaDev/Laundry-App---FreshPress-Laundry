import { Shirt } from "lucide-react";
import type { ReactNode } from "react";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #00685f 0%, #00534b 55%, #003d38 100%)" }}
    >
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #89f5e7 0%, transparent 70%)" }}
      />

      <style>{`@keyframes card-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="w-full max-w-100 relative">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
          >
            <Shirt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">FreshPress</h1>
          <p className="text-white/60 mt-2 text-sm font-medium tracking-wide uppercase">Portal Staff</p>
        </div>

        {children}

        <p className="text-center text-xs text-white/30 mt-6">
          © {new Date().getFullYear()} FreshPress Laundry. Hak akses karyawan.
        </p>
      </div>
    </main>
  );
}

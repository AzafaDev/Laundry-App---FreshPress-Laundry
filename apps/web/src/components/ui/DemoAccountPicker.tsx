"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { DEMO_PASSWORD, type DemoAccount } from "@/lib/demoAccounts";

type Props = {
  accounts: DemoAccount[];
  onPick: (email: string, password: string) => void;
  /** `dark` untuk dipakai di atas latar gelap (halaman login pegawai). */
  tone?: "light" | "dark";
  className?: string;
};

export const DemoAccountPicker = ({ accounts, onPick, tone = "light", className = "" }: Props) => {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const isDark = tone === "dark";

  const handlePick = (account: DemoAccount) => {
    onPick(account.email, DEMO_PASSWORD);
    setPicked(account.email);
    setOpen(false);
  };

  return (
    <div
      className={`rounded-2xl border ${
        isDark ? "border-white/15 bg-white/5" : "border-primary/20 bg-primary/5"
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold ${
          isDark ? "text-white/90" : "text-gray-800"
        }`}
      >
        <Sparkles className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-white/70" : "text-primary"}`} />
        <span className="flex-1">Isi otomatis dengan akun demo</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-1.5 px-3 pb-3">
          {accounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handlePick(account)}
              className={`block w-full rounded-xl px-3 py-2 text-left transition ${
                isDark
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-white hover:bg-primary/10"
              }`}
            >
              <span
                className={`block text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {account.label}
              </span>
              <span
                className={`block truncate text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
              >
                {account.email}
              </span>
              <span
                className={`mt-0.5 block text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {account.desc}
              </span>
            </button>
          ))}
        </div>
      )}

      {picked && !open && (
        <p
          className={`px-4 pb-3 text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}
          role="status"
        >
          Terisi sebagai <span className="font-semibold">{picked}</span> — tinggal tekan masuk.
        </p>
      )}
    </div>
  );
};

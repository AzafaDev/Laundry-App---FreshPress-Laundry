"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, Sparkles } from "lucide-react";
import {
  DEMO_PASSWORD,
  SHIFT_WINDOWS,
  anyShiftOpen,
  formatWibClock,
  isShiftOpen,
  wibMinutesNow,
  type DemoAccount,
  type DemoAccountGroup,
} from "@/lib/demoAccounts";
import { useTranslation } from "@/i18n/useTranslation";

type Props = {
  groups: DemoAccountGroup[];
  onPick: (email: string, password: string) => void;
  /** `dark` untuk dipakai di atas latar gelap. */
  tone?: "light" | "dark";
  className?: string;
};

const REFRESH_MS = 60_000;

/** Jam WIB, dihitung setelah mount supaya tidak bentrok dengan hasil render server. */
const useWibMinutes = () => {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMinutes(wibMinutesNow());
    tick();
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return minutes;
};

export const DemoAccountPicker = ({ groups, onPick, tone = "light", className = "" }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<DemoAccount | null>(null);
  const wibMinutes = useWibMinutes();
  const isDark = tone === "dark";

  const hasShiftAccounts = groups.some((g) => g.accounts.some((a) => a.shift));
  const outsideHours = wibMinutes !== null && hasShiftAccounts && !anyShiftOpen(wibMinutes);

  const handlePick = (account: DemoAccount) => {
    onPick(account.email, DEMO_PASSWORD);
    setPicked(account);
    setOpen(false);
  };

  const shiftBadge = (account: DemoAccount) => {
    if (!account.shift || wibMinutes === null) return null;
    const openNow = isShiftOpen(account.shift, wibMinutes);
    return (
      <span
        className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
          openNow
            ? "bg-primary text-white"
            : isDark
              ? "bg-white/10 text-white/50"
              : "bg-gray-200 text-gray-500"
        }`}
      >
        {openNow ? t("demoAccounts.picker.canCheckInNow") : t("demoAccounts.picker.outsideShiftHours")}
      </span>
    );
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
        <span className="flex-1">{t("demoAccounts.picker.autofill")}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Peringatan di luar jam operasional — mencegah penolakan check-in dikira bug */}
      {outsideHours && (
        <div
          className={`mx-3 mb-3 flex gap-2 rounded-xl px-3 py-2.5 text-xs ${
            isDark ? "bg-white/10 text-white/70" : "bg-amber-50 text-amber-900"
          }`}
          role="status"
        >
          <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {t("demoAccounts.picker.outsideHoursWarning", {
              time: formatWibClock(wibMinutes),
              morning: SHIFT_WINDOWS.morning.range,
              afternoon: SHIFT_WINDOWS.afternoon.range,
            })}
          </span>
        </div>
      )}

      {open && (
        <div className="max-h-80 space-y-3 overflow-y-auto px-3 pb-3">
          {groups.map((group) => (
            <div key={group.title}>
              <p
                className={`px-1 pb-1 text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                {group.title}
              </p>
              {group.hint && (
                <p className={`px-1 pb-1.5 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  {group.hint}
                </p>
              )}

              <div className="space-y-1.5">
                {group.accounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handlePick(account)}
                    className={`block w-full rounded-xl px-3 py-2 text-left transition ${
                      isDark ? "bg-white/5 hover:bg-white/10" : "bg-white hover:bg-primary/10"
                    }`}
                  >
                    <span
                      className={`block truncate text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
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
                    {shiftBadge(account)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {picked && !open && (
        <p
          className={`px-4 pb-3 text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}
          role="status"
        >
          {t("demoAccounts.picker.filledAs", { email: picked.email })}
        </p>
      )}
    </div>
  );
};

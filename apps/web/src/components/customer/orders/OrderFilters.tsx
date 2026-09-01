"use client";

import { Search, X } from "lucide-react";
import type { CustomerOrderStatus } from "@/services/order.service";
import { ORDER_PROGRESS_STATUS_KEYS } from "./orderConstants";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  searchInput: string;
  status: CustomerOrderStatus | "";
  dateFrom: string;
  dateTo: string;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CustomerOrderStatus | "") => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export function OrderFilters({
  searchInput,
  status,
  dateFrom,
  dateTo,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder={t("orders.filters.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CustomerOrderStatus | "")}
          className="sm:w-52 py-2.5 px-3 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
        >
          <option value="">{t("orders.filterStatus.all")}</option>
          {ORDER_PROGRESS_STATUS_KEYS.map((key) => (
            <option key={key} value={key}>{t(`orders.filterStatus.${key}`)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <label className="text-xs text-on-surface-variant shrink-0">{t("orders.filters.from")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="flex-1 min-w-0 py-2 px-3 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
          />
          <label className="text-xs text-on-surface-variant shrink-0">{t("orders.filters.to")}</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
            className="flex-1 min-w-0 py-2 px-3 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>
        {hasFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-error hover:underline shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t("orders.filters.clear")}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { Search, CalendarDays, Filter, Store } from "lucide-react";
import type { OrderListQuery, OrderStatus } from "@/types/order.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_LIST } from "@/types/order.types";
import { useOutlets } from "@/hooks/useOutlets";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

interface Props {
  query: OrderListQuery;
  onChange: (q: Partial<OrderListQuery>) => void;
}

export const OrderFilters = ({ query, onChange }: Props) => {
  const role = useEmployeeAuthStore((s) => s.user?.role);
  const isSuperAdmin = role === "super_admin";

  const { data: outletsData } = useOutlets(
    isSuperAdmin ? { limit: 100, is_active: true } : {},
  );
  const outlets = outletsData?.items ?? [];

  return (
    <div className="bg-surface border border-outline-variant rounded-t-xl p-4 flex flex-col gap-3">
      {/* Row 1: status + outlet (super_admin only) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
          <select
            value={query.status ?? ""}
            onChange={(e) =>
              onChange({ status: (e.target.value as OrderStatus | "") || undefined })
            }
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
          >
            <option value="">Semua Status</option>
            {ORDER_STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {isSuperAdmin && (
          <div className="relative flex-1">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
            <select
              value={query.outlet_id ?? ""}
              onChange={(e) =>
                onChange({ outlet_id: e.target.value || undefined })
              }
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              <option value="">Semua Outlet</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Row 2: date range + sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 flex-1">
          <CalendarDays className="w-4 h-4 text-on-surface-variant shrink-0" />
          <input
            type="date"
            value={query.date_from ?? ""}
            onChange={(e) => onChange({ date_from: e.target.value || undefined })}
            className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <span className="text-on-surface-variant text-sm">–</span>
          <input
            type="date"
            value={query.date_to ?? ""}
            onChange={(e) => onChange({ date_to: e.target.value || undefined })}
            className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <select
          value={`${query.sort_by ?? "created_at"}:${query.sort_dir ?? "desc"}`}
          onChange={(e) => {
            const [sort_by, sort_dir] = e.target.value.split(":") as [
              "created_at" | "updated_at",
              "asc" | "desc",
            ];
            onChange({ sort_by, sort_dir });
          }}
          className="px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="created_at:desc">Terbaru Dibuat</option>
          <option value="created_at:asc">Terlama Dibuat</option>
          <option value="updated_at:desc">Terbaru Diupdate</option>
          <option value="updated_at:asc">Terlama Diupdate</option>
        </select>
      </div>
    </div>
  );
};

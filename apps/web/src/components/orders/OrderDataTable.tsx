"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { OrderFilters } from "./OrderFilters";
import type { OrderListQuery, OrderStatus } from "@/types/order.types";
import { ORDER_STATUS_LABELS } from "@/types/order.types";

const STATUS_STYLE: Partial<Record<OrderStatus, string>> = {
  waiting_pickup_driver: "bg-surface-container-highest text-on-surface-variant",
  laundry_to_outlet: "bg-secondary-container text-on-secondary-container",
  laundry_arrived_outlet: "bg-secondary-container text-on-secondary-container",
  washing: "bg-primary-container text-on-primary-container",
  ironing: "bg-primary-container text-on-primary-container",
  packing: "bg-primary-container text-on-primary-container",
  waiting_payment: "bg-tertiary-container text-on-tertiary-container",
  ready_for_delivery: "bg-secondary-container text-on-secondary-container",
  delivery_to_customer: "bg-secondary-container text-on-secondary-container",
  received_by_customer: "bg-secondary-container text-on-secondary-container",
  completed: "bg-surface-container-highest text-on-surface-variant",
};

const fmtPrice = (v: string | number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(v));

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const OrderDataTable = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<OrderListQuery>({
    sort_by: "created_at",
    sort_dir: "desc",
  });

  const updateQuery = (partial: Partial<OrderListQuery>) => {
    setQuery((q) => ({ ...q, ...partial }));
    setPage(1);
  };

  const { data, isFetching, isError } = useOrders({ ...query, page, limit: 10 });


  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <OrderFilters query={query} onChange={updateQuery} />

      <div className="bg-surface border-x border-b border-outline-variant rounded-b-xl overflow-hidden shadow-sm">
        {isError && (
          <p className="p-4 text-sm text-error">Gagal memuat data. Coba lagi.</p>
        )}

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-sm font-bold">Invoice</th>
                <th className="p-4 text-sm font-bold">Customer</th>
                <th className="p-4 text-sm font-bold">Outlet</th>
                <th className="p-4 text-sm font-bold">Status</th>
                <th className="p-4 text-sm font-bold">Tanggal</th>
                <th className="p-4 text-sm font-bold">Total</th>
                <th className="p-4 text-sm font-bold text-right">Detail</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-outline-variant ${isFetching ? "opacity-60" : ""}`}
            >
              {items.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-sm text-on-surface-variant"
                  >
                    Tidak ada order ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="p-4 font-bold text-primary text-sm">
                      {order.invoice_number}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-sm">{order.customer.full_name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {order.customer.email}
                      </p>
                    </td>
                    <td className="p-4 text-sm">{order.outlet.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLE[order.status] ??
                          "bg-surface-container-highest text-on-surface-variant"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{fmtDate(order.created_at)}</td>
                    <td className="p-4 text-sm font-medium">
                      {fmtPrice(order.total_price)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/admin/orders/${order.id}`}
                        className="p-1.5 inline-flex hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                        title="Lihat detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant">
          {items.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/admin/orders/${order.id}`}
              className="block p-4 hover:bg-surface-container-lowest transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-primary text-sm">
                  {order.invoice_number}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_STYLE[order.status] ??
                    "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-sm font-medium">{order.customer.full_name}</p>
              <div className="flex justify-between items-end mt-1">
                <p className="text-xs text-on-surface-variant">
                  {order.outlet.name} · {fmtDate(order.created_at)}
                </p>
                <p className="text-sm font-bold">{fmtPrice(order.total_price)}</p>
              </div>
            </Link>
          ))}
          {items.length === 0 && !isFetching && (
            <p className="p-8 text-center text-sm text-on-surface-variant">
              Tidak ada order ditemukan.
            </p>
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="bg-surface-container-low p-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              {pagination.total === 0
                ? "Tidak ada hasil"
                : `Menampilkan ${Math.min((page - 1) * 10 + 1, pagination.total)}–${Math.min(
                    page * 10,
                    pagination.total,
                  )} dari ${pagination.total} order`}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    page === p
                      ? "bg-primary text-on-primary"
                      : "bg-surface border border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

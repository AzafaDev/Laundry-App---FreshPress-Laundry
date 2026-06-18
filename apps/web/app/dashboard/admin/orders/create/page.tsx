"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { ProcessOrderModal } from "@/components/orders/ProcessOrderModal";
import type { OrderSummary } from "@/types/order.types";

const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PendingOrdersPage() {
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState<OrderSummary | null>(null);

  const { data, isFetching, refetch } = useOrders({
    status: "laundry_arrived_outlet",
    sort_by: "created_at",
    sort_dir: "asc",
    page,
    limit: 10,
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Proses Order Masuk</h2>
        <p className="text-base text-on-surface-variant">
          Order yang telah tiba di outlet dan menunggu input berat serta item.
        </p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-sm font-bold">Invoice</th>
                <th className="p-4 text-sm font-bold">Customer</th>
                <th className="p-4 text-sm font-bold">Jadwal Pickup</th>
                <th className="p-4 text-sm font-bold">Tiba di Outlet</th>
                <th className="p-4 text-sm font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-outline-variant ${isFetching ? "opacity-60" : ""}`}>
              {orders.length === 0 && !isFetching ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-on-surface-variant">
                    Tidak ada order yang menunggu diproses. 🎉
                  </td>
                </tr>
              ) : (
                orders.map((order: OrderSummary) => (
                  <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-bold text-primary text-sm">{order.invoice_number}</td>
                    <td className="p-4">
                      <p className="font-medium text-sm">{order.customer.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{order.customer.phone ?? order.customer.email}</p>
                    </td>
                    <td className="p-4 text-sm">{fmtDateTime(order.pickup_schedule)}</td>
                    <td className="p-4 text-sm">{fmtDateTime(order.updated_at)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/orders/${order.id}`}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setProcessing(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:opacity-90"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Proses
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant">
          {orders.map((order: OrderSummary) => (
            <div key={order.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-bold text-primary text-sm">{order.invoice_number}</p>
                <span className="text-xs text-on-surface-variant">{fmtDateTime(order.updated_at)}</span>
              </div>
              <p className="font-medium text-sm">{order.customer.full_name}</p>
              <p className="text-xs text-on-surface-variant">Pickup: {fmtDateTime(order.pickup_schedule)}</p>
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/dashboard/admin/orders/${order.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg text-xs hover:bg-surface-container-high"
                >
                  <Eye className="w-3 h-3" /> Detail
                </Link>
                <button
                  onClick={() => setProcessing(order)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:opacity-90"
                >
                  <PlayCircle className="w-3 h-3" /> Proses
                </button>
              </div>
            </div>
          ))}
          {orders.length === 0 && !isFetching && (
            <p className="p-8 text-center text-sm text-on-surface-variant">
              Tidak ada order yang menunggu diproses.
            </p>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-surface-container-low p-4 flex items-center justify-between border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              {pagination.total} order menunggu
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
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

      {processing && (
        <ProcessOrderModal
          orderId={processing.id}
          invoiceNumber={processing.invoice_number}
          deliveryFee={processing.delivery_fee}
          onClose={() => setProcessing(null)}
          onSuccess={() => { refetch(); setProcessing(null); }}
        />
      )}
    </>
  );
}

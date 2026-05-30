"use client";

import { useState, useEffect } from "react";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2, Package, Shirt, Wheat, CheckCircle } from "lucide-react";
import { StationModal } from "@/components/worker/StationModal";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const stationLabels = {
  washing: { title: "Stasiun Cuci", icon: Shirt, color: "primary" },
  ironing: { title: "Stasiun Setrika", icon: Wheat, color: "secondary" },
  packing: { title: "Stasiun Packing", icon: Package, color: "tertiary" },
};

export default function WorkerStationPage() {
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  let station: "washing" | "ironing" | "packing" | null = null;
  if (user?.role === "washing_worker") station = "washing";
  else if (user?.role === "ironing_worker") station = "ironing";
  else if (user?.role === "packing_worker") station = "packing";

  const { checkedIn } = useAttendance();
  const { stationOrders, isLoading, completeStation, isCompleting, refetch } = useWorkerStation();
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!station) return;
    const unsubNewOrder = on("station:new-order", (data: { station: string }) => {
      if (data.station === station) {
        toast.success(`Order baru masuk ke ${station} station`);
        queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
      }
    });
    return () => {
      unsubNewOrder();
    };
  }, [on, queryClient, station]);

  if (_hasHydrated && !station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-error">Akses ditolak. Anda bukan worker yang valid.</p>
      </div>
    );
  }

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stationInfo = stationLabels[station!];
  const Icon = stationInfo.icon;

  const handleProcessClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleComplete = async (orderId: string, receivedQuantities: Record<string, number>) => {
    const order = stationOrders.find(o => o.id === orderId);
    if (!order) return;

    let hasMismatch = false;
    for (const item of order.order_items) {
      const expected = item.quantity;
      const received = receivedQuantities[item.id] ?? expected;
      if (received !== expected) {
        hasMismatch = true;
        break;
      }
    }

    if (hasMismatch) {
      const confirm = window.confirm(
        "Terjadi ketidaksesuaian jumlah item. Lanjutkan proses? (Bypass akan diimplementasikan di sprint berikutnya)"
      );
      if (!confirm) return;
    }

    try {
      await completeStation({ orderId, stationType: station! });
      toast.success(`Order ${order.invoice_number} selesai diproses`);
      setModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Gagal menyelesaikan station");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl bg-${stationInfo.color}/10`}>
              <Icon className={`w-6 h-6 text-${stationInfo.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{stationInfo.title}</h1>
              <p className="text-sm text-on-surface-variant">Proses laundry yang masuk ke stasiun Anda</p>
            </div>
          </div>

          {!checkedIn ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <p className="text-amber-700 font-semibold">Silakan check-in terlebih dahulu</p>
              <p className="text-sm text-amber-600 mt-1">Anda harus check-in sebelum dapat memproses order.</p>
            </div>
          ) : stationOrders.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl p-8 text-center text-on-surface-variant">
              Tidak ada order yang perlu diproses saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stationOrders.map((order) => (
                <div key={order.id} className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      #{order.invoice_number}
                    </span>
                    <span className="text-xs text-on-surface-variant">{order.status}</span>
                  </div>
                  <h3 className="text-lg font-bold mt-1">{order.customer.full_name}</h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    {order.order_items.length} item{order.total_weight_kg ? ` • ${order.total_weight_kg} kg` : ""}
                  </p>
                  <button
                    onClick={() => handleProcessClick(order.id)}
                    className="w-full py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Proses
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />

      {modalOpen && selectedOrderId && (
        <StationModal
          orderId={selectedOrderId}
          orders={stationOrders}
          onClose={() => setModalOpen(false)}
          onConfirm={handleComplete}
          isProcessing={isCompleting}
        />
      )}
    </div>
  );
}
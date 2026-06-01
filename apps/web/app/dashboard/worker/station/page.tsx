"use client";

import { useState, useEffect } from "react";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2, Package, Shirt, Blend, CheckCircle, Clock, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { StationModal } from "@/components/worker/StationModal";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { StationOrder } from "@/services/workerStation.service";

const stationConfig = {
  washing: {
    title: "Stasiun Cuci",
    subtitle: "Proses cucian yang masuk",
    Icon: Shirt,
    accentClass: "bg-blue-50 border-blue-100",
    iconClass: "text-blue-500 bg-blue-100",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  ironing: {
    title: "Stasiun Setrika",
    subtitle: "Proses setrika yang masuk",
    Icon: Blend,
    accentClass: "bg-orange-50 border-orange-100",
    iconClass: "text-orange-500 bg-orange-100",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  packing: {
    title: "Stasiun Packing",
    subtitle: "Proses packing yang masuk",
    Icon: Package,
    accentClass: "bg-emerald-50 border-emerald-100",
    iconClass: "text-emerald-600 bg-emerald-100",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
};

const statusLabel: Record<string, string> = {
  washing_in_progress: "Sedang dicuci",
  ironing_in_progress: "Sedang disetrika",
  packing_in_progress: "Sedang dipacking",
  ready_for_washing: "Antri cuci",
  ready_for_ironing: "Antri setrika",
  ready_for_packing: "Antri packing",
};

function computeWaiting(createdAt: string): { label: string; urgent: boolean } {
  const diffMin = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diffMin < 30) return { label: `${diffMin} mnt lalu`, urgent: false };
  if (diffMin < 60) return { label: `${diffMin} mnt lalu`, urgent: true };
  const hours = Math.floor(diffMin / 60);
  return { label: `${hours} jam lalu`, urgent: true };
}

function OrderCard({
  order,
  onProcess,
  isProcessing,
}: {
  order: StationOrder;
  onProcess: (id: string) => void;
  isProcessing: boolean;
}) {
  const [waiting, setWaiting] = useState<{ label: string; urgent: boolean }>({ label: "", urgent: false });
  useEffect(() => {
    setWaiting(computeWaiting(order.created_at));
    const timer = setInterval(() => setWaiting(computeWaiting(order.created_at)), 60000);
    return () => clearInterval(timer);
  }, [order.created_at]);

  const rawStatus = statusLabel[order.status] ?? order.status;

  return (
    <div
      className={`bg-surface border rounded-xl p-4 shadow-sm transition-all ${
        waiting.urgent ? "border-amber-200 bg-amber-50/30" : "border-outline-variant"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            #{order.invoice_number}
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full border border-outline-variant">
            {rawStatus}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium shrink-0 ${
            waiting.urgent ? "text-amber-600" : "text-on-surface-variant"
          }`}
        >
          {waiting.urgent && <AlertCircle className="w-3 h-3" />}
          <Clock className="w-3 h-3" />
          {waiting.label}
        </div>
      </div>

      {/* Customer */}
      <h3 className="text-base font-bold text-on-surface">{order.customer.full_name}</h3>
      <p className="text-sm text-on-surface-variant mt-0.5 mb-4">
        {order.order_items.length} jenis item
        {order.total_weight_kg ? ` • ${order.total_weight_kg} kg` : ""}
      </p>

      {/* Items preview */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {order.order_items.slice(0, 3).map((item) => (
          <span
            key={item.id}
            className="text-xs bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-md border border-outline-variant"
          >
            {item.laundry_item.name} ×{item.quantity}
          </span>
        ))}
        {order.order_items.length > 3 && (
          <span className="text-xs text-on-surface-variant px-1">
            +{order.order_items.length - 3} lagi
          </span>
        )}
      </div>

      <button
        onClick={() => onProcess(order.id)}
        disabled={isProcessing}
        className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        {isProcessing ? "Memproses..." : "Tandai Selesai"}
      </button>
    </div>
  );
}

export default function WorkerStationPage() {
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

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
        toast.success(`Order baru masuk ke ${stationConfig[station].title}`);
        queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
      }
    });
    const unsubConnect = on("connect", () => setIsConnected(true));
    const unsubDisconnect = on("disconnect", () => setIsConnected(false));
    return () => {
      unsubNewOrder();
      unsubConnect();
      unsubDisconnect();
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
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <WorkerSidebar />
        <WorkerTopBar />
        <main className="lg:pl-72 p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-outline-variant" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-outline-variant rounded" />
                  <div className="h-3 w-24 bg-outline-variant rounded" />
                </div>
              </div>
              <div className="h-6 w-24 bg-outline-variant rounded-full" />
            </div>
            {/* Card skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-28 bg-outline-variant rounded-full" />
                    <div className="h-4 w-16 bg-outline-variant rounded" />
                  </div>
                  <div className="h-5 w-40 bg-outline-variant rounded" />
                  <div className="h-3 w-24 bg-outline-variant rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-outline-variant rounded-md" />
                    <div className="h-6 w-20 bg-outline-variant rounded-md" />
                  </div>
                  <div className="h-10 w-full bg-outline-variant rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const cfg = stationConfig[station!];
  const { Icon } = cfg;

  const handleProcessClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleComplete = async (orderId: string, receivedQuantities: Record<string, number>) => {
    const order = stationOrders.find((o) => o.id === orderId);
    if (!order) return;

    let hasMismatch = false;
    for (const item of order.order_items) {
      const received = receivedQuantities[item.id] ?? item.quantity;
      if (received !== item.quantity) { hasMismatch = true; break; }
    }

    if (hasMismatch) {
      const confirm = window.confirm(
        "Terjadi ketidaksesuaian jumlah item. Lanjutkan proses?"
      );
      if (!confirm) return;
    }

    setProcessingId(orderId);
    try {
      await completeStation({ orderId, stationType: station! });
      toast.success(`Order ${order.invoice_number} selesai diproses`);
      setModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Gagal menyelesaikan station");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Station header */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${cfg.accentClass}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${cfg.iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-on-surface">{cfg.title}</h1>
                <p className="text-sm text-on-surface-variant">{cfg.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badgeClass}`}>
                {stationOrders.length} order menunggu
              </span>
              <span className={`flex items-center gap-1 text-[11px] ${isConnected ? "text-emerald-600" : "text-red-500"}`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          {/* Check-in gate */}
          {!checkedIn ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-1">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-amber-700 font-semibold">Belum check-in</p>
              <p className="text-sm text-amber-600">Lakukan check-in terlebih dahulu sebelum memproses order.</p>
            </div>
          ) : stationOrders.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
              <div className={`p-4 rounded-2xl mb-4 ${cfg.iconClass}`}>
                <Icon className="w-8 h-8" />
              </div>
              <p className="font-semibold text-on-surface">Tidak ada order saat ini</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Order akan muncul otomatis saat masuk ke {cfg.title}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stationOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onProcess={handleProcessClick}
                  isProcessing={processingId === order.id || isCompleting}
                />
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

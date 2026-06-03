"use client";

import { useState, useEffect } from "react";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2, Package, Shirt, Blend, CheckCircle, Clock, AlertCircle, Wifi, WifiOff, Clock3 } from "lucide-react";
import { StationModal } from "@/components/worker/StationModal";
import { WorkerBypassModal } from "@/components/worker/WorkerBypassModal";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { StationOrder, Discrepancy } from "@/services/workerStation.service";
import { workerStationService } from "@/services/workerStation.service";

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
  washing: "Antri cuci",
  ironing: "Antri setrika",
  packing: "Antri packing",
};

function computeWaiting(createdAt: string): { label: string; urgent: boolean } {
  const diffMin = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diffMin < 30) return { label: `${diffMin} mnt lalu`, urgent: false };
  if (diffMin < 60) return { label: `${diffMin} mnt lalu`, urgent: true };
  const hours = Math.floor(diffMin / 60);
  return { label: `${hours} jam lalu`, urgent: true };
}

interface BypassState {
  discrepancies: Discrepancy[];
  actualItems: Array<{ laundry_item_id: string; actual_quantity: number }>;
  submitted: boolean;
}

function PendingBypassBanner() {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 mt-3">
      <Clock3 className="w-4 h-4 text-amber-600 shrink-0" />
      <p className="text-sm text-amber-700 font-medium">Menunggu persetujuan admin</p>
    </div>
  );
}

function OrderCard({
  order,
  onProcess,
  isProcessing,
  bypassState,
}: {
  order: StationOrder;
  onProcess: (id: string) => void;
  isProcessing: boolean;
  bypassState?: BypassState;
}) {
  const [waiting, setWaiting] = useState<{ label: string; urgent: boolean }>({ label: "", urgent: false });
  useEffect(() => {
    setWaiting(computeWaiting(order.created_at));
    const timer = setInterval(() => setWaiting(computeWaiting(order.created_at)), 60000);
    return () => clearInterval(timer);
  }, [order.created_at]);

  const rawStatus = statusLabel[order.status] ?? order.status;
  const isPendingBypass = bypassState?.submitted || order.hasPendingBypass;

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

      {isPendingBypass ? (
        <PendingBypassBanner />
      ) : (
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
          {isProcessing ? "Memproses..." : "Verifikasi Items"}
        </button>
      )}
    </div>
  );
}

export default function WorkerStationPage() {
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [bypassState, setBypassState] = useState<Record<string, BypassState>>({});
  const [bypassModalOpen, setBypassModalOpen] = useState<string | null>(null);

  let station: "washing" | "ironing" | "packing" | null = null;
  if (user?.role === "washing_worker") station = "washing";
  else if (user?.role === "ironing_worker") station = "ironing";
  else if (user?.role === "packing_worker") station = "packing";

  const { checkedIn } = useAttendance();
  const { stationOrders, isLoading } = useWorkerStation();
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

    const unsubApproved = on("bypass:approved", (data: { orderId: string }) => {
      toast.success("Bypass disetujui! Order akan dilanjutkan.");
      setBypassState((prev) => {
        const next = { ...prev };
        delete next[data.orderId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    });

    const unsubRejected = on("bypass:rejected", (data: { orderId: string; admin_notes?: string }) => {
      toast.error(`Bypass ditolak${data.admin_notes ? `: ${data.admin_notes}` : ""}`, { duration: 6000 });
      setBypassState((prev) => {
        if (!prev[data.orderId]) return prev;
        return {
          ...prev,
          [data.orderId]: { ...prev[data.orderId], submitted: false },
        };
      });
    });

    const unsubConnect = on("connect", () => setIsConnected(true));
    const unsubDisconnect = on("disconnect", () => setIsConnected(false));

    return () => {
      unsubNewOrder();
      unsubApproved();
      unsubRejected();
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

  const handleVerify = async (orderId: string, receivedQuantities: Record<string, number>) => {
    const order = stationOrders.find((o) => o.id === orderId);
    if (!order || !station) return;

    const satuanItems = order.order_items.filter((i) => i.laundry_item.unit !== "kg");
    const actual_items = satuanItems.map((item) => ({
      laundry_item_id: item.laundry_item_id,
      actual_quantity: receivedQuantities[item.id] ?? item.quantity,
    }));

    setProcessingId(orderId);
    try {
      const result = await workerStationService.submitItems(station, orderId, actual_items);

      if ("requiresBypass" in result && result.requiresBypass) {
        setBypassState((prev) => ({
          ...prev,
          [orderId]: { discrepancies: result.discrepancies, actualItems: actual_items, submitted: false },
        }));
        setModalOpen(false);
        setBypassModalOpen(orderId);
        return;
      }

      toast.success(`Order #${order.invoice_number} berhasil diverifikasi`);
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
      setBypassState((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; requiresBypass?: boolean; discrepancies?: Discrepancy[] } } };
      const resData = error?.response?.data;
      if (resData?.requiresBypass && resData.discrepancies) {
        setBypassState((prev) => ({
          ...prev,
          [orderId]: { discrepancies: resData.discrepancies!, actualItems: actual_items, submitted: false },
        }));
        setModalOpen(false);
        setBypassModalOpen(orderId);
      } else {
        toast.error(resData?.message ?? "Gagal memverifikasi items");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleBypassSuccess = (orderId: string) => {
    setBypassState((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], submitted: true },
    }));
    setBypassModalOpen(null);
  };

  const bypassOrder = bypassModalOpen ? stationOrders.find((o) => o.id === bypassModalOpen) : null;
  const activeBypassState = bypassModalOpen ? bypassState[bypassModalOpen] : null;

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
                  isProcessing={processingId === order.id}
                  bypassState={bypassState[order.id]}
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
          onConfirm={handleVerify}
          isProcessing={processingId === selectedOrderId}
        />
      )}

      {bypassModalOpen && bypassOrder && activeBypassState && (
        <WorkerBypassModal
          open={true}
          orderId={bypassOrder.id}
          invoiceNumber={bypassOrder.invoice_number}
          discrepancies={activeBypassState.discrepancies}
          actualItems={activeBypassState.actualItems}
          onClose={() => setBypassModalOpen(null)}
          onSuccess={() => handleBypassSuccess(bypassOrder.id)}
        />
      )}
    </div>
  );
}

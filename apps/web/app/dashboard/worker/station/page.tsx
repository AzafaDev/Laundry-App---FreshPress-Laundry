"use client";

import { useState } from "react";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useWorkerStationSocket } from "@/hooks/useWorkerStationSocket";
import { useSocketStatus } from "@/hooks/useSocket";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OrderCard } from "@/components/worker/OrderCard";
import { StationModal } from "@/components/worker/StationModal";
import { WorkerBypassModal } from "@/components/worker/WorkerBypassModal";
import { BypassViewModal } from "@/components/worker/BypassViewModal";
import { VerificationResultModal } from "@/components/worker/VerificationResultModal";
import { stationConfig, type BypassState } from "@/components/worker/stationConfig";
import { Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";
import type { Discrepancy } from "@/services/workerStation.service";

export default function WorkerStationPage() {
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bypassState, setBypassState] = useState<Record<string, BypassState>>({});
  const [bypassModalOpen, setBypassModalOpen] = useState<string | null>(null);
  const [bypassViewId, setBypassViewId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    type: "success" | "mismatch";
    orderId: string;
    invoiceNumber: string;
    discrepancies?: Discrepancy[];
    actualItems?: { breakdown: { clothing_type_id: string; actual_quantity: number }[]; satuan: { laundry_item_id: string; actual_quantity: number }[] };
  } | null>(null);

  let station: "washing" | "ironing" | "packing" | null = null;
  if (user?.role === "washing_worker") station = "washing";
  else if (user?.role === "ironing_worker") station = "ironing";
  else if (user?.role === "packing_worker") station = "packing";

  const { checkedIn } = useAttendance();
  const { stationOrders, isLoading, submitItems } = useWorkerStation();

  const isConnected = useSocketStatus();
  useWorkerStationSocket({ station, setBypassState });

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

  const handleVerify = async (orderId: string, received: { breakdown: Record<string, number>; satuan: Record<string, number> }) => {
    const order = stationOrders.find((o) => o.id === orderId);
    if (!order || !station) return;

    const actual_items = order.order_item_breakdowns.map((item) => ({
      clothing_type_id: item.clothing_type_id,
      actual_quantity: received.breakdown[item.id] ?? 0,
    }));

    const satuanOrderItems = order.order_items.filter((i) => i.laundry_item.unit !== "kg");
    const actual_satuan_items = satuanOrderItems.map((item) => ({
      laundry_item_id: item.laundry_item_id,
      actual_quantity: received.satuan[item.laundry_item_id] ?? 0,
    }));

    const totalQty =
      actual_items.reduce((sum, i) => sum + i.actual_quantity, 0) +
      actual_satuan_items.reduce((sum, i) => sum + i.actual_quantity, 0);
    if (totalQty === 0) {
      toast.error("Minimal satu item harus memiliki quantity lebih dari 0.");
      return;
    }

    setProcessingId(orderId);
    try {
      await submitItems({ stationType: station, orderId, actual_items, actual_satuan_items });

      setModalOpen(false);
      setVerificationResult({ type: "success", orderId, invoiceNumber: order.invoice_number });
      setBypassState((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; requiresBypass?: boolean; discrepancies?: Discrepancy[] } } };
      const resData = error?.response?.data;
      if (resData?.requiresBypass && resData.discrepancies) {
        setModalOpen(false);
        setVerificationResult({
          type: "mismatch",
          orderId,
          invoiceNumber: order.invoice_number,
          discrepancies: resData.discrepancies,
          actualItems: { breakdown: actual_items, satuan: actual_satuan_items },
        });
      } else {
        toast.error(resData?.message ?? "Gagal memverifikasi items");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerificationClose = () => {
    if (verificationResult?.type === "success" && station) {
      toast.success(`Order #${verificationResult.invoiceNumber} berhasil diverifikasi`);
    }
    setVerificationResult(null);
  };

  const handleProceedToBypass = () => {
    if (!verificationResult || verificationResult.type !== "mismatch") return;
    const { orderId, discrepancies, actualItems } = verificationResult;
    setBypassState((prev) => ({
      ...prev,
      [orderId]: { discrepancies: discrepancies!, actualItems: actualItems!, submitted: false },
    }));
    setVerificationResult(null);
    setBypassModalOpen(orderId);
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

          <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${cfg.accentClass}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl shrink-0 ${cfg.iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-on-surface truncate">{cfg.title}</h1>
                <p className="text-sm text-on-surface-variant truncate">{cfg.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.badgeClass}`}>
                {stationOrders.length} order menunggu
              </span>
              <span className={`flex items-center gap-1 text-[11px] ${isConnected ? "text-emerald-600" : "text-red-500"}`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>

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
                  onViewBypass={setBypassViewId}
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

      {verificationResult && (
        <VerificationResultModal
          result={verificationResult.type}
          invoiceNumber={verificationResult.invoiceNumber}
          onClose={handleVerificationClose}
          onBypass={handleProceedToBypass}
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

      {bypassViewId && (
        <BypassViewModal
          open={true}
          orderId={bypassViewId}
          invoiceNumber={stationOrders.find((o) => o.id === bypassViewId)?.invoice_number ?? ""}
          onClose={() => setBypassViewId(null)}
        />
      )}
    </div>
  );
}

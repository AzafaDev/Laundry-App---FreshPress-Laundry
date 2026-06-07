"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { useDriverTasks } from "@/hooks/useDriverTasks";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { BottomNav } from "@/components/layout/BottomNav";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { SkeletonText } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

type CompleteTaskError = {
  response?: { data?: { message?: string } };
  message?: string;
};

export default function TaskDetailPage() {
  const router = useRouter();
  const { _hasHydrated } = useEmployeeAuthStore();
  const { activeTask, isLoadingActive, completeTask, isCompleting, refetch } = useDriverTasks();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isLoadingActive && !activeTask) {
      router.replace("/dashboard/driver");
    }
  }, [activeTask, isLoadingActive, router, _hasHydrated]);

  useEffect(() => {
    if (_hasHydrated && !activeTask && !isLoadingActive) {
      refetch();
    }
  }, [_hasHydrated, activeTask, isLoadingActive, refetch]);

  if (!_hasHydrated || isLoadingActive) {
    return (
      <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
        <DriverSidebar />
        <DriverTopBar />
        <main className="lg:pl-72 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <SkeletonText className="h-8 w-64 mb-2" />
            <SkeletonText className="h-4 w-32" />
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-outline-variant rounded w-3/4 mb-4" />
              <div className="h-4 bg-outline-variant rounded w-full mb-3" />
              <div className="h-4 bg-outline-variant rounded w-5/6 mb-6" />
              <div className="h-12 bg-outline-variant rounded-lg w-full" />
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!activeTask) return null;

  const order = activeTask.order;
  const isPickup = activeTask.task_type === "pickup";
  const address = isPickup
    ? order?.pickup_address?.address
    : order?.delivery_address?.address || order?.pickup_address?.address;
  const customerName = order?.customer?.full_name ?? "Customer";
  const invoiceNumber = order?.invoice_number ?? "#Unknown";
  const hasNotes = order && "notes" in order && (order as any).notes;

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/driver"
              className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </Link>
            <h1 className="text-2xl font-bold text-on-surface">Task Detail</h1>
          </div>

          <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {isPickup ? "PICKUP" : "DELIVERY"}
                </span>
                <h2 className="text-xl font-bold mt-2">{customerName}</h2>
                <p className="text-sm text-on-surface-variant">Invoice: {invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <CheckCircle className="w-4 h-4" /> Active Task
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl mb-4">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-on-surface">Alamat</p>
                <p className="text-sm text-on-surface-variant">{address || "Alamat tidak tersedia"}</p>
              </div>
            </div>

            {order?.customer?.phone && (
              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl mb-4">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Nomor Telepon</p>
                  <p className="text-sm text-on-surface-variant">{order.customer.phone}</p>
                </div>
              </div>
            )}

            {hasNotes && (
              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl mb-4">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Catatan Khusus</p>
                  <p className="text-sm text-on-surface-variant italic">&ldquo;{(order as any).notes}&rdquo;</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-surface-container-low rounded-xl mb-6">
              <p className="text-xs text-on-surface-variant">Detail item laundry tidak tersedia di tampilan driver. Silakan cek dashboard admin untuk informasi lengkap.</p>
            </div>

            <button
              onClick={() => {
                completeTask(activeTask.id, {
                  onSuccess: () => {
                    toast.success("Task selesai! Terima kasih.");
                    router.push("/dashboard/driver");
                  },
                  onError: (err: CompleteTaskError) => {
                    toast.error(err?.response?.data?.message || "Gagal menyelesaikan task");
                  }
                });
              }}
              disabled={isCompleting}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {isCompleting ? "Memproses..." : "Complete Task"}
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
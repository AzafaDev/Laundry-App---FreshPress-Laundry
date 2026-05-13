"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Shirt,
  Eye,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { BypassReviewModal } from "@/components/admin/BypassReviewModal";

interface BypassRequest {
  id: string;
  orderId: string;
  worker: string;
  station: string;
  expected: number;
  actual: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const initialRequests: BypassRequest[] = [
  {
    id: "BYP-001",
    orderId: "#ORD-5521",
    worker: "John Marcus",
    station: "Washing Station 04",
    expected: 5,
    actual: 4,
    reason: "Satu celana jeans rusak saat diterima dari pelanggan.",
    status: "pending",
  },
  {
    id: "BYP-002",
    orderId: "#ORD-4498",
    worker: "Sarah Kong",
    station: "Drying Station 02",
    expected: 10,
    actual: 9,
    reason: "Satu kaos tertinggal di mesin sebelumnya.",
    status: "pending",
  },
  {
    id: "BYP-003",
    orderId: "#ORD-3310",
    worker: "David Miller",
    station: "Ironing Station 01",
    expected: 3,
    actual: 3,
    reason: "Item yang diterima sudah sesuai dengan catatan.",
    status: "approved",
  },
];

export default function BypassRequestsPage() {
  const [requests, setRequests] = useState<BypassRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<BypassRequest | null>(null);
  const [search, setSearch] = useState("");

  const handleApprove = (pin: string, adminNote: string) => {
    console.log("Approved:", { pin, adminNote, requestId: selectedRequest?.id });
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest?.id ? { ...r, status: "approved" as const } : r,
      ),
    );
    setSelectedRequest(null);
  };

  const handleReject = (pin: string, adminNote: string) => {
    console.log("Rejected:", { pin, adminNote, requestId: selectedRequest?.id });
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest?.id ? { ...r, status: "rejected" as const } : r,
      ),
    );
    setSelectedRequest(null);
  };

  const filtered = requests.filter(
    (r) =>
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.worker.toLowerCase().includes(search.toLowerCase()) ||
      r.station.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfGQAXV_8gr2IBXSI2lELU9Lz1_ld3jaU_ujwgH40eYsEprooLolJvjYRTUKUGYQucXmJiNBOCas900do6EJrtkG4y0Fxc_ZyVFNnpWb1NKd5Mconfw7fJjiumdN6E8yS9-vMfBF0CiA_wBJylP5h4pTjSO9PINJNCxkoiLA2CqKnshlpuHw-EWd1CTV8zGXbevb1bd_Gnm1i01-ziuyFd-HU33GM5ncuU3Oe3cKFUdY1hGDWxE9OSinj84usN352w5L4v76WkG00"
            alt="Admin avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-on-secondary-container" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Super Admin</p>
            <p className="text-xs text-on-surface-variant">admin@freshpress.com</p>
          </div>
        </div>
        <nav className="space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" active />
        </nav>
      </aside>

      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-on-surface mb-1">
            Bypass Requests
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Review dan approve/reject permintaan bypass dari worker.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
              <input
                type="text"
                placeholder="Cari order ID, worker, station..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
            <span className="text-xs text-on-surface-variant">
              {filtered.length} request
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold">Order ID</th>
                    <th className="px-6 py-4 text-sm font-bold">Worker</th>
                    <th className="px-6 py-4 text-sm font-bold">Station</th>
                    <th className="px-6 py-4 text-sm font-bold text-center">
                      Mismatch
                    </th>
                    <th className="px-6 py-4 text-sm font-bold">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold">
                        {req.orderId}
                      </td>
                      <td className="px-6 py-4 text-sm">{req.worker}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {req.station}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {req.expected !== req.actual ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-error">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {req.expected - req.actual > 0
                              ? `-${req.expected - req.actual}`
                              : `+${req.actual - req.expected}`}
                          </span>
                        ) : (
                          <span className="text-xs text-on-surface-variant">
                            None
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                          aria-label={`Review bypass ${req.orderId}`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                Tidak ada bypass request ditemukan.
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedRequest && (
        <BypassReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <BottomNav />
    </div>
  );
}

function StatusBadge({ status }: { status: BypassRequest["status"] }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
          Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
  }
}

function SidebarLink({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </a>
  );
}

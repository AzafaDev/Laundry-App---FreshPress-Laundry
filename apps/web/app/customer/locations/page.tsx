"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Plus, ArrowLeft, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService, type CustomerAddress } from "@/services/address.service";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { AddressCard } from "@/components/customer/AddressCard";
import { useTranslation } from "@/i18n/useTranslation";

const LIMIT = 5;

export default function LocationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) router.replace("/login");
  }, [_hasHydrated, user, router]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customer", "addresses", page],
    queryFn: () => addressService.listPaginated(page, LIMIT),
    enabled: _hasHydrated && !!user,
  });

  const addresses: CustomerAddress[] = data?.addresses ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => addressService.setPrimary(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
    onError: () => setActionError(t("locations.setPrimaryError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      setActionError(null);
      // Jika halaman sekarang jadi kosong setelah delete, mundur satu halaman
      if (addresses.length === 1 && page > 1) setPage((p) => p - 1);
      else queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
    onError: () => setActionError(t("locations.deleteError")),
  });

  const handleDelete = (id: string) => {
    if (!confirm(t("locations.confirmDelete"))) return;
    deleteMutation.mutate(id);
  };

  const actionLoadingId = setPrimaryMutation.isPending
    ? setPrimaryMutation.variables
    : deleteMutation.isPending
      ? deleteMutation.variables
      : null;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md md:px-xl h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <Link href="/" className="p-base hover:bg-surface-container-high rounded-full transition-colors">
            <ArrowLeft className="text-primary w-6 h-6" />
          </Link>
          <h1 className="text-headline-md font-headline-md font-bold text-primary">{t("locations.title")}</h1>
        </div>
        <Link href="/customer/locations/add-address" className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">{t("locations.addAddress")}</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-md py-lg">
        {actionError && (
          <div className="mb-md flex items-center gap-sm bg-red-50 text-red-700 text-sm px-md py-sm rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />{actionError}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center py-2xl gap-md text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-body-md">{t("locations.loading")}</p>
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center py-2xl gap-md text-on-surface-variant">
            <AlertCircle className="w-10 h-10 text-error" />
            <p className="text-body-md">{t("locations.loadError")}</p>
            <button onClick={() => void refetch()} className="px-md py-sm bg-primary text-on-primary rounded-lg text-label-md">{t("locations.retry")}</button>
          </div>
        )}

        {!isLoading && !isError && addresses.length === 0 && page === 1 && (
          <div className="flex flex-col items-center py-2xl gap-md text-on-surface-variant">
            <MapPin className="w-14 h-14 text-outline" />
            <p className="text-body-lg font-medium">{t("locations.emptyTitle")}</p>
            <p className="text-body-sm text-center">{t("locations.emptyDesc")}</p>
            <Link href="/customer/locations/add-address" className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-xl text-label-md font-bold hover:bg-primary/90 transition-all">
              <Plus className="w-5 h-5" />{t("locations.addFirstAddress")}
            </Link>
          </div>
        )}

        {!isLoading && !isError && (addresses.length > 0 || page > 1) && (
          <div className="flex flex-col gap-md">
            {/* Info total */}
            {total > 0 && (
              <p className="text-xs text-on-surface-variant">
                {t("locations.showing", { shown: addresses.length, total })}
              </p>
            )}

            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                addr={addr}
                isActioning={actionLoadingId === addr.id}
                onSetPrimary={(id) => setPrimaryMutation.mutate(id)}
                onDelete={handleDelete}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />{t("locations.previous")}
                </button>
                <span className="text-sm text-on-surface-variant px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
                >
                  {t("locations.next")}<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link href="/customer/locations/add-address" className="flex items-center justify-center gap-sm h-14 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <Plus className="w-5 h-5" /><span className="text-label-md font-medium">{t("locations.addNewAddress")}</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

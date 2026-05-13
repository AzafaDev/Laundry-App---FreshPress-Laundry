"use client";

import { useState } from "react";
import { X, Store, MapPin } from "lucide-react";

interface AddOutletModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    address: string;
    maxDistance: string;
  }) => void;
}

export function AddOutletModal({ onClose, onSave }: AddOutletModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [maxDistance, setMaxDistance] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, address, maxDistance });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">Add New Outlet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
              Nama Outlet
            </label>
            <input
              type="text"
              placeholder="Downtown Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
              Alamat
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 w-5 h-5 text-outline" />
              <textarea
                rows={2}
                placeholder="Jl. Bersih No. 124, Metro City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base resize-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
              Max Service Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Jarak layanan maksimal"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

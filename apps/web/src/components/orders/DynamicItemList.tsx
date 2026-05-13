"use client";

import { Plus, Trash2 } from "lucide-react";

export interface DynamicItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
}

interface DynamicItemListProps {
  items: DynamicItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChange: (id: number, field: keyof DynamicItem, value: string | number) => void;
}

export function DynamicItemList({
  items,
  onAdd,
  onRemove,
  onChange,
}: DynamicItemListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-on-surface/80">
          Daftar Item
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-sm text-primary font-bold hover:underline"
        >
          <Plus className="w-4 h-4" />
          Tambah Item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-2 items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant"
          >
            <input
              type="text"
              placeholder="Nama item"
              value={item.name}
              onChange={(e) => onChange(item.id, "name", e.target.value)}
              className="col-span-5 px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => onChange(item.id, "quantity", Number(e.target.value))}
              className="col-span-3 px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder="Harga"
              value={item.price}
              onChange={(e) => onChange(item.id, "price", e.target.value)}
              className="col-span-3 px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={items.length <= 1}
              className="col-span-1 p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Hapus item ${item.name || "baru"}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

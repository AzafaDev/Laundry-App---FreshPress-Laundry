export interface LaundryItem {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  base_price: string | number;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaundryItemListQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: "name" | "base_price";
  sort_dir?: "asc" | "desc";
}

export interface LaundryItemListResponse {
  data: LaundryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLaundryItemPayload {
  name: string;
  description?: string;
  unit?: string;
  base_price: number;
  is_active?: boolean;
}

export type UpdateLaundryItemPayload = Partial<CreateLaundryItemPayload>;

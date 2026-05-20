// Outlet type definitions
export interface Outlet {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  max_service_km: number | null;
  is_active: boolean;
  created_at: string;
}

export interface OutletListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OutletListResponse {
  items: Outlet[];
  pagination: OutletListPagination;
}

export interface OutletListQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateOutletPayload {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  max_service_km: number;
  is_active?: boolean;
}

export type UpdateOutletPayload = Partial<CreateOutletPayload> & {
  re_geocode?: boolean;
};

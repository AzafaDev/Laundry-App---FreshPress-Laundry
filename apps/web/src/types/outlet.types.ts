export interface Outlet {
  id: string;
  name: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code?: string | null;
  phone?: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  service_radius_km: number | string | null;
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
  province: string;
  city: string;
  district: string;
  postal_code?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km: number;
  is_active?: boolean;
}

export type UpdateOutletPayload = Partial<CreateOutletPayload> & {
  re_geocode?: boolean;
};

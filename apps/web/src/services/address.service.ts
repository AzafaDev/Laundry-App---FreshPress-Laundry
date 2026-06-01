import { axiosInstance } from "@/lib/axios";

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string | null;
  latitude: string;
  longitude: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  label: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  is_primary?: boolean;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted: string;
  confidence?: number;
}

export interface OutletDistance {
  outlet_id: string;
  outlet_name: string;
  outlet_address: string;
  outlet_city: string;
  distance_km: number;
  within_service_area: boolean;
  delivery_fee: number;
}

export interface DeliveryEstimate {
  address_id: string;
  customer_address: {
    label: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  nearest_outlet: OutletDistance;
  all_outlets: OutletDistance[];
  base_fee: number;
  rate_per_km: number;
}

type Envelope<T> = { success: true; data: T; message: string };

export const addressService = {
  list: async (): Promise<CustomerAddress[]> => {
    const { data } = await axiosInstance.get<Envelope<CustomerAddress[]>>(
      "/v1/customer/addresses",
    );
    return data.data;
  },

  create: async (payload: CreateAddressPayload): Promise<CustomerAddress> => {
    const { data } = await axiosInstance.post<Envelope<CustomerAddress>>(
      "/v1/customer/addresses",
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: Partial<CreateAddressPayload>,
  ): Promise<CustomerAddress> => {
    const { data } = await axiosInstance.patch<Envelope<CustomerAddress>>(
      `/v1/customer/addresses/${id}`,
      payload,
    );
    return data.data;
  },

  setPrimary: async (id: string): Promise<CustomerAddress> => {
    const { data } = await axiosInstance.patch<Envelope<CustomerAddress>>(
      `/v1/customer/addresses/${id}/primary`,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/customer/addresses/${id}`);
  },

  geocode: async (query: string): Promise<GeocodeResult | null> => {
    const { data } = await axiosInstance.get<Envelope<GeocodeResult | null>>(
      "/v1/customer/geocode",
      { params: { q: query } },
    );
    return data.data;
  },

  estimateDeliveryFee: async (addressId: string): Promise<DeliveryEstimate> => {
    const { data } = await axiosInstance.get<Envelope<DeliveryEstimate>>(
      `/v1/customer/addresses/${addressId}/delivery-estimate`,
    );
    return data.data;
  },
};

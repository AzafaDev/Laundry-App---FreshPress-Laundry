import { axiosInstance } from "@/lib/axios";
import type {
  WorkShift,
  EmployeeShift,
  WorkShiftListQuery,
  WorkShiftListResponse,
  CreateWorkShiftPayload,
  UpdateWorkShiftPayload,
  AssignEmployeeShiftPayload,
} from "@/types/shift.types";

type Envelope<T> = { success: true; data: T };
type PaginatedEnvelope<T> = {
  success: true;
  items: T[];
  pagination: WorkShiftListResponse["pagination"];
};

export const shiftService = {
  // ── WorkShift CRUD ────────────────────────────────────────────────────────

  list: async (
    params: WorkShiftListQuery = {},
  ): Promise<WorkShiftListResponse> => {
    const { data } = await axiosInstance.get<
      PaginatedEnvelope<WorkShift>
    >("/v1/admin/shifts", { params });
    return { items: data.items, pagination: data.pagination };
  },

  getById: async (id: string): Promise<WorkShift> => {
    const { data } = await axiosInstance.get<Envelope<WorkShift>>(
      `/v1/admin/shifts/${id}`,
    );
    return data.data;
  },

  create: async (payload: CreateWorkShiftPayload): Promise<WorkShift> => {
    const { data } = await axiosInstance.post<Envelope<WorkShift>>(
      "/v1/admin/shifts",
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateWorkShiftPayload,
  ): Promise<WorkShift> => {
    const { data } = await axiosInstance.patch<Envelope<WorkShift>>(
      `/v1/admin/shifts/${id}`,
      payload,
    );
    return data.data;
  },

  deactivate: async (id: string): Promise<WorkShift> => {
    const { data } = await axiosInstance.delete<Envelope<WorkShift>>(
      `/v1/admin/shifts/${id}`,
    );
    return data.data;
  },

  // ── EmployeeShift ─────────────────────────────────────────────────────────

  listEmployeeShifts: async (employeeId: string): Promise<EmployeeShift[]> => {
    const { data } = await axiosInstance.get<{
      success: true;
      items: EmployeeShift[];
    }>(`/v1/admin/employees/${employeeId}/shifts`);
    return data.items;
  },

  assignEmployeeShift: async (
    employeeId: string,
    payload: AssignEmployeeShiftPayload,
  ): Promise<EmployeeShift> => {
    const { data } = await axiosInstance.post<Envelope<EmployeeShift>>(
      `/v1/admin/employees/${employeeId}/shifts`,
      payload,
    );
    return data.data;
  },

  removeEmployeeShift: async (
    employeeId: string,
    shiftRecordId: string,
  ): Promise<EmployeeShift> => {
    const { data } = await axiosInstance.delete<Envelope<EmployeeShift>>(
      `/v1/admin/employees/${employeeId}/shifts/${shiftRecordId}`,
    );
    return data.data;
  },
};

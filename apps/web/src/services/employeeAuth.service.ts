import { axiosInstance } from "@/lib/axios";
import { Employee } from "@/types/employee.types";

export interface EmployeeLoginPayload {
  email: string;
  password: string;
}

export interface EmployeeLoginResponse {
  accessToken: string;
  employee: Employee;
}

export interface EmployeeRefreshResponse {
  accessToken: string;
}

export const employeeAuthService = {
  login: async (
    payload: EmployeeLoginPayload,
  ): Promise<EmployeeLoginResponse> => {
    const { data } = await axiosInstance.post<{
      success: true;
      data: EmployeeLoginResponse;
    }>("/v1/employee/auth/login", payload, { withCredentials: true });
    return data.data;
  },

  refresh: async (): Promise<EmployeeRefreshResponse> => {
    const { data } = await axiosInstance.post<{
      success: true;
      data: EmployeeRefreshResponse;
    }>("/v1/employee/auth/refresh", {}, { withCredentials: true });
    return data.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(
      "/v1/employee/auth/logout",
      {},
      { withCredentials: true },
    );
  },
};

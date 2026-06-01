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

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post<{ success: true; data: { message: string } }>(
      "/v1/employee/auth/forgot-password",
      { email },
    );
    return data.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ accessToken: string; employee: { id: string; role: string; email: string; full_name: string; outlet_id: string | null } }> => {
    const { data } = await axiosInstance.post<{ success: true; data: { accessToken: string; employee: { id: string; role: string; email: string; full_name: string; outlet_id: string | null } } }>(
      "/v1/employee/auth/reset-password",
      { token, newPassword },
      { withCredentials: true },
    );
    return data.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post<{ success: true; data: { message: string } }>(
      "/v1/employee/auth/change-password",
      { oldPassword, newPassword },
      { withCredentials: true },
    );
    return data.data;
  },
};

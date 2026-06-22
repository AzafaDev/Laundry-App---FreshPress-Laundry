import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:8080/api",
  withCredentials: true,
});

let inFlightRefresh: Promise<boolean> | null = null;

export function performSilentRefresh(authType: "employee" | "customer"): Promise<boolean> {
  if (inFlightRefresh) return inFlightRefresh;
  const refreshUrl = authType === "employee" ? "/v1/employee/auth/refresh" : "/v1/customer/auth/refresh";
  inFlightRefresh = axios
    .post(`${process.env.NEXT_PUBLIC_URL || "http://localhost:8080/api"}${refreshUrl}`, {}, { withCredentials: true })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      inFlightRefresh = null;
    });
  return inFlightRefresh;
}

const getAuthType = () => {
  const { user: employeeUser } = useEmployeeAuthStore.getState();
  const { user: customerUser } = useAuthStore.getState();

  if (employeeUser) return "employee";
  if (customerUser) return "customer";
  return null;
};

const clearAuthByType = (type: "employee" | "customer") => {
  if (type === "employee") {
    useEmployeeAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") window.location.href = "/employee/login";
  } else {
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
  }
};

const PUBLIC_ENDPOINTS = [
  "/v1/customer/auth/login",
  "/v1/customer/auth/register",
  "/v1/customer/auth/verify",
  "/v1/customer/auth/forgot-password",
  "/v1/customer/auth/reset-password",
  "/v1/customer/auth/refresh",
  "/v1/customer/auth/logout",
  "/v1/employee/auth/login",
  "/v1/employee/auth/refresh",
];

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
      originalRequest.url?.includes(endpoint),
    );

    if (error.response?.status !== 401 || originalRequest._retry || isPublic) {
      return Promise.reject(error);
    }

    const authType = getAuthType();
    if (!authType) return Promise.reject(error);

    originalRequest._retry = true;
    const refreshed = await performSilentRefresh(authType);
    if (refreshed) return axiosInstance(originalRequest);

    clearAuthByType(authType);
    return Promise.reject(error);
  },
);

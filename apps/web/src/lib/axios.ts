import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:8080/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getAuthType = () => {
  const { user: employeeUser } = useEmployeeAuthStore.getState();
  const { accessToken: customerToken } = useAuthStore.getState();

  if (employeeUser) return { type: "employee" as const, token: null };
  if (customerToken) return { type: "customer" as const, token: customerToken };
  return { type: null, token: null };
};

const clearAuthByType = (type: "employee" | "customer") => {
  if (type === "employee") {
    useEmployeeAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/employee/login";
    }
  } else {
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
};

const PUBLIC_ENDPOINTS = [
  "/v1/customer/auth/login",
  "/v1/customer/auth/register",
  "/v1/customer/auth/verify",
  "/v1/customer/auth/forgot-password",
  "/v1/customer/auth/reset-password",
  "/v1/employee/auth/login",
  "/v1/employee/auth/refresh",
];

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    if (isPublic) {
      return config;
    }

    const { token, type } = getAuthType();
    if (type === "employee") {
      if (config.headers) config.headers["X-User-Type"] = "employee";
    } else if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { type } = getAuthType();

    if (type !== "employee" || isPublic) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    isRefreshing = true;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_URL || "http://localhost:8080/api"}/v1/employee/auth/refresh`,
        {},
        { withCredentials: true },
      );

      processQueue(null, null);

      originalRequest._retry = true;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      clearAuthByType("employee");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

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

const getTokens = () => {
  const { accessToken: customerToken } = useAuthStore.getState();
  const { accessToken: employeeToken } = useEmployeeAuthStore.getState();

  if (employeeToken) return { token: employeeToken, type: "employee" };
  if (customerToken) return { token: customerToken, type: "customer" };
  return { token: null, type: null };
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

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, type } = getTokens();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      if (type === "employee") {
        config.headers["X-User-Type"] = "employee";
      }
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

    if (error.response?.status !== 401 || originalRequest._retry) {
      const { type } = getTokens();
      if (error.response?.status === 401 && type === "customer") {
        clearAuthByType("customer");
      }
      return Promise.reject(error);
    }

    const { type } = getTokens();

    if (type !== "employee") {
      clearAuthByType("customer");
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_URL || "http://localhost:8080/api"}/v1/employee/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newAccessToken = data.data?.accessToken;
      if (!newAccessToken) throw new Error("No access token");

      const currentEmployee = useEmployeeAuthStore.getState().user;
      if (currentEmployee) {
        useEmployeeAuthStore
          .getState()
          .setAuth(currentEmployee, newAccessToken);
      }

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);

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

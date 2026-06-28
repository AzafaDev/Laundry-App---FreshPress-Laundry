import { disconnectSocket, getSocket, reconnectSocket } from "@/lib/socket";
import { performSilentRefresh } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useCallback, useEffect } from "react";

type EventHandler = (...args: any[]) => void;

const SILENT_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
let refreshIntervalId: ReturnType<typeof setInterval> | null = null;

export function useSocket() {
  const customerUser = useAuthStore((s) => s.user);
  const employeeUser = useEmployeeAuthStore((s) => s.user);
  const isLoggedIn = !!employeeUser || !!customerUser;

  useEffect(() => {
    if (isLoggedIn) reconnectSocket();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
      }
      return;
    }
   
    if (refreshIntervalId) return;
    const authType: "employee" | "customer" = employeeUser ? "employee" : "customer";
    refreshIntervalId = setInterval(() => {
      performSilentRefresh(authType);
    }, SILENT_REFRESH_INTERVAL_MS);
  }, [isLoggedIn, employeeUser, customerUser]);

  const on = useCallback((event: string, handler: EventHandler) => {
    if (!isLoggedIn) return () => {};
    const socket = getSocket();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [isLoggedIn]);

  const emit = useCallback((event: string, data?: any) => {
    if (!isLoggedIn) return;
    const socket = getSocket();
    socket.emit(event, data);
  }, [isLoggedIn]);

  return { on, emit, disconnect: disconnectSocket };
}

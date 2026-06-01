import { disconnectSocket, getSocket, reconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useCallback, useEffect } from "react";

type EventHandler = (...args: any[]) => void;

export function useSocket() {
  const customerToken = useAuthStore((s) => s.accessToken);
  const employeeToken = useEmployeeAuthStore((s) => s.accessToken);
  // Pilih token prioritas: employee dulu, baru customer
  const token = employeeToken ?? customerToken;

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }
    reconnectSocket();
  }, [token]);

  const on = useCallback((event: string, handler: EventHandler) => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    const socket = getSocket();
    socket.emit(event, data);
  }, []);

  return { on, emit, disconnect: disconnectSocket };
}

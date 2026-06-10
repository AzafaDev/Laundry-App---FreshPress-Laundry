import { disconnectSocket, getSocket, reconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useCallback, useEffect } from "react";

type EventHandler = (...args: any[]) => void;

export function useSocket() {
  const customerUser = useAuthStore((s) => s.user);
  const employeeUser = useEmployeeAuthStore((s) => s.user);
  const isLoggedIn = !!employeeUser || !!customerUser;

  useEffect(() => {
    if (!isLoggedIn) {
      disconnectSocket();
      return;
    }
    reconnectSocket();
  }, [isLoggedIn]);

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

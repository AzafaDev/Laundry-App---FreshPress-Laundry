import { disconnectSocket, getSocket, reconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import {
  useNotificationStore,
  type Notification,
} from "@/stores/notificationStore";
import { useEffect, useRef } from "react";

type EventHandler = (...args: any[]) => void;

export function useSocket() {
  const customerToken = useAuthStore((s) => s.accessToken);
  const employeeToken = useEmployeeAuthStore((s) => s.accessToken);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const connectedRef = useRef(false);

  // Pilih token prioritas: employee dulu, baru customer
  const token = employeeToken ?? customerToken;

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }
    reconnectSocket();
  }, [token]);

  return {
    on: (event: string, handler: EventHandler) => {
      const socket = getSocket();
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    },

    emit: (event: string, data?: any) => {
      const socket = getSocket();
      socket.emit(event, data);
    },

    disconnect: disconnectSocket,
  };
}

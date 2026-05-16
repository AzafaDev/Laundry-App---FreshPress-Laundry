import { disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import {
  useNotificationStore,
  type Notification,
} from "@/stores/notificationStore";
import { useEffect, useRef } from "react";

type EventHandler = (...args: any[]) => void;

export function useSocket() {
  const { accessToken } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket();

    const onConnect = () => {
      connectedRef.current = true;
      console.log("[useSocket] connected");
    };

    const onDisconnect = () => {
      connectedRef.current = false;
      console.log("[useSocket] disconnected");
    };

    const onNotification = (data: Notification) => {
      addNotification(data);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification", onNotification);

    if (socket.connected) {
      connectedRef.current = true;
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification", onNotification);
    };
  }, [accessToken, addNotification]);

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

import { disconnectSocket, getSocket, isSocketConnected, reconnectSocket } from "@/lib/socket";
import { performSilentRefresh } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useCallback, useEffect, useState } from "react";

type EventHandler = (...args: any[]) => void;

// Lebih kecil dari JWT_EXPIRES_IN backend (default 15m), supaya access token
// yang dipakai socket buat reconnect handshake selalu fresh.
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
    // Singleton: useSocket() dipanggil banyak komponen sekaligus, tapi cuma
    // boleh ada 1 interval global. Jangan dikasih cleanup di sini — clear
    // cuma terjadi di cabang !isLoggedIn di atas, saat user benar-benar logout.
    if (refreshIntervalId) return;
    const authType: "employee" | "customer" = employeeUser ? "employee" : "customer";
    refreshIntervalId = setInterval(() => {
      performSilentRefresh(authType);
    }, SILENT_REFRESH_INTERVAL_MS);
  }, [isLoggedIn, employeeUser, customerUser]);

  // Auth-aware reconnect: kalau handshake gagal karena token stale, refresh
  // cookie lalu reconnect — jangan biarkan socket mati senyap. refreshRetries
  // di-reset tiap berhasil connect; kalau refresh tetap gagal, biarkan flow 401
  // axios yang redirect login.
  useEffect(() => {
    if (!isLoggedIn) return;
    const socket = getSocket();
    const authType: "employee" | "customer" = employeeUser ? "employee" : "customer";
    let refreshRetries = 0;

    const onConnect = () => {
      refreshRetries = 0;
    };
    const onConnectError = async (err: Error) => {
      if (!err.message.includes("Unauthorized") || refreshRetries >= 2) return;
      refreshRetries++;
      const ok = await performSilentRefresh(authType);
      if (ok) socket.connect();
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    };
  }, [isLoggedIn, employeeUser]);

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

// Status koneksi socket yang jujur — di-seed dari socket.connected sebenarnya,
// bukan default optimistik. Dipakai badge "Live"/"Offline".
export function useSocketStatus() {
  const [connected, setConnected] = useState(() => isSocketConnected());

  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return connected;
}

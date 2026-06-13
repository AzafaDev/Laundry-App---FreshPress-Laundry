import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

const g = globalThis as typeof globalThis & { __appSocket?: Socket };

export function getSocket(): Socket {
  if (g.__appSocket) return g.__appSocket;

  g.__appSocket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  g.__appSocket.on("connect", () => {
    console.log("[socket] connected:", g.__appSocket?.id);
  });

  g.__appSocket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });

  g.__appSocket.on("connect_error", (err) => {
    console.error("[socket] connection error:", err.message);
  });

  return g.__appSocket;
}

export function disconnectSocket() {
  if (g.__appSocket) {
    g.__appSocket.disconnect();
    g.__appSocket = undefined;
  }
}

export function reconnectSocket() {
  if (g.__appSocket) return g.__appSocket;
  return getSocket();
}

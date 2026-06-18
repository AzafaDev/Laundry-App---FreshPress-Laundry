import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

const g = globalThis as typeof globalThis & { __appSocket?: Socket };

export function getSocket(): Socket {
  if (g.__appSocket) return g.__appSocket;

  if (typeof window === "undefined") {
    throw new Error("getSocket() must be called in the browser");
  }

  g.__appSocket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 10000,
    autoConnect: true,
  });

  g.__appSocket.on("connect", () => {
    console.log("[socket] connected:", g.__appSocket?.id);
  });

  g.__appSocket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });

  let errorCount = 0;
  g.__appSocket.on("connect_error", (err) => {
    errorCount++;
    if (errorCount === 1) {
      console.warn("[socket] connection error:", err.message);
    } else if (errorCount === 5) {
      console.warn("[socket] giving up after 5 attempts. Is the API server running?");
      g.__appSocket?.disconnect();
    }
  });

  g.__appSocket.on("connect", () => {
    errorCount = 0;
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
  if (g.__appSocket?.connected) return g.__appSocket;
  disconnectSocket();
  return getSocket();
}

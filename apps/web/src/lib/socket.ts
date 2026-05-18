import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const raw =
    typeof window !== "undefined"
      ? localStorage.getItem("freshpress-auth")
      : null;
  let token = "";
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed?.state?.accessToken ?? "";
    } catch {}
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });

  socket.on("connection_error", (err) => {
    console.error("[socket] connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

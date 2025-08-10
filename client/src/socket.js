import { io } from "socket.io-client";

// Choose socket URL from env variables
const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_SOCKET_URL
    : import.meta.env.VITE_SOCKET_URL; // Will be replaced by production URL in Vercel

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // fallback to polling
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

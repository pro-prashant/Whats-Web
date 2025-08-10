// src/socket.js
import { io } from "socket.io-client";

// Use Vite env variables for cleaner config
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000" // Local backend
    : import.meta.env.VITE_SOCKET_URL; // From Vercel env

export const socket = io(API_URL, {
  transports: ["websocket", "polling"], // fallback
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

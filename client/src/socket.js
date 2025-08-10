// src/socket.js
import { io } from "socket.io-client";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000" // Local backend
    : "https://your-deployed-backend-url.com"; // Production backend

export const socket = io(API_URL, {
  transports: ["websocket", "polling"], // fallback to polling if websocket fails
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
});

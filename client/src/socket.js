
// src/socket.js
import { io } from "socket.io-client";

const API_URL = "http://localhost:8000"; // Your backend base URL

export const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
});

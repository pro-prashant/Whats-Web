const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const ConnectionDb = require("./Model/Db");
const router = require("./route/whatsroute");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Common allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://whats-web-lake.vercel.app"
];

// ✅ Socket.IO with proper CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Express CORS with same origins
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8000;
ConnectionDb();

// Attach socket.io to app (optional)
app.set("io", io);

// ✅ Debug connection
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

app.use("/whats", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

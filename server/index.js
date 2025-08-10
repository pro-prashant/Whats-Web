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

// Read allowed origins from env
const allowedOrigins = [
  process.env.FRONT_URL_LOCAL,
  process.env.FRONT_URL_PROD,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

// CORS middleware with dynamic origin check
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8000;
ConnectionDb();

// Socket.IO with CORS configured
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// Socket connection debugging
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

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // ✅ for socket.io
const { Server } = require("socket.io"); // ✅ socket.io
const ConnectionDb = require("./Model/Db");
const router = require("./route/whatsroute");

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ Use HTTP server for socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ✅ Change if frontend is hosted elsewhere
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;
ConnectionDb();

app.use(cors());
app.use(express.json());

// Attach socket.io instance to app so you can use it in controllers
app.set("io", io);

app.use("/whats", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

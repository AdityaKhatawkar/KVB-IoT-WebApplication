// require("dotenv").config();
// const express = require("express");
// const helmet = require("helmet");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");

// const connectDB = require("./config/db");
// const { initGridFSBucket } = require("./utils/gridfs");

// // Routes
// const authRoutes = require("./routes/auth");
// const locationRoutes = require("./routes/location");
// const dashboardRoutes = require("./routes/dashboard");
// const deviceRoutes = require("./routes/deviceRoutes");
// const cropRoutes = require("./routes/cropRoutes");
// const deviceConfigRoutes = require("./routes/deviceConfig");
// const userRoutes = require("./routes/userRoutes");
// const operationModeRoutes = require("./routes/operationModeRoutes");
// const firmwareRoutes = require("./routes/firmwareRoutes");

// const app = express();

// // -------------------
// // Connect MongoDB
// // -------------------
// connectDB().then(() => {
//   initGridFSBucket(mongoose.connection);
//   console.log("GridFS initialized");
// });

// // -------------------
// app.use(helmet());
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));


// //!rate limiter, use later if needed
// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 200,
// // });
// // app.use(limiter);


// // -------------------
// // Routes
// // -------------------
// app.use("/api/auth", authRoutes);
// app.use("/api/location", locationRoutes);
// app.use("/api/devices", deviceRoutes);
// app.use("/api/crops", cropRoutes);
// app.use("/api/device-config", deviceConfigRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/operation-mode", operationModeRoutes);
// app.use("/api/firmware", firmwareRoutes);
// app.use("/api", dashboardRoutes);

// app.get("/", (req, res) => {
//   res.json({ ok: true, msg: "MERN backend running" });
// });

// // -------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initGridFSBucket } = require("./utils/gridfs");

const authRoutes = require("./routes/auth");
const locationRoutes = require("./routes/location");
const dashboardRoutes = require("./routes/dashboard");
const deviceRoutes = require("./routes/deviceRoutes");
const cropRoutes = require("./routes/cropRoutes");
const deviceConfigRoutes = require("./routes/deviceConfig");
const userRoutes = require("./routes/userRoutes");
const operationModeRoutes = require("./routes/operationModeRoutes");
const firmwareRoutes = require("./routes/firmwareRoutes");

// -------------------
// Express Setup
// -------------------
const app = express();
const server = http.createServer(app);

// -------------------
// Socket.IO Setup
// -------------------
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// -------------------
// Database Connection
// -------------------
connectDB().then(() => {
  initGridFSBucket(mongoose.connection);
  console.log("GridFS initialized");
});

// -------------------------------
// Enable MongoDB Change Streams
// -------------------------------
mongoose.connection.once("open", () => {
  console.log("📡 MongoDB connected — enabling DeviceData change stream...");

  const deviceDataCollection = mongoose.connection.collection("devicedatas");

  const changeStream = deviceDataCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const newDoc = change.fullDocument;

      console.log("🔄 New DeviceData inserted:", newDoc);

      // Broadcast to relevant device room
      io.to(newDoc.device_name).emit("device_update", newDoc);
    }
  });
});

// -------------------
// Middleware
// -------------------
app.use(helmet());
app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// -------------------
// Routes
// -------------------
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/device-config", deviceConfigRoutes);
app.use("/api/users", userRoutes);
app.use("/api/operation-mode", operationModeRoutes);
app.use("/api/firmware", firmwareRoutes);
app.use("/api", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "MERN backend running" });
});

// -------------------
// WebSocket Events
// -------------------
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Client joins device-specific socket room
  socket.on("join_device", (deviceName) => {
    console.log(`📡 Client ${socket.id} joined room: ${deviceName}`);
    socket.join(deviceName);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------
// Server Start
// -------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


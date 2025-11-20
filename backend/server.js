// require("dotenv").config();
// const express = require("express");
// const helmet = require("helmet");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const bodyParser = require("body-parser");
// const connectDB = require("./config/db");

// const authRoutes = require("./routes/auth");
// const locationRoutes = require("./routes/location");
// const dashboardRoutes = require("./routes/dashboard");
// const deviceRoutes = require("./routes/deviceRoutes");
// const cropRoutes = require("./routes/cropRoutes");
// const deviceConfigRoutes = require("./routes/deviceConfig");
// const userRoutes = require("./routes/userRoutes");
// const operationModeRoutes = require("./routes/operationModeRoutes");


// const app = express();

// // Connect database
// connectDB();

// // Middleware
// app.use(helmet());
// // app.use(cors());
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// // app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
// app.use(limiter);

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/location", locationRoutes);
// app.use("/api", dashboardRoutes);
// app.use("/api/devices", deviceRoutes);
// app.use("/api/crops", cropRoutes);
// app.use("/api/device-config", deviceConfigRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/operation-mode", operationModeRoutes);

// app.get("/", (req, res) => {
//   res.json({ ok: true, msg: "MERN backend is running" });
// });

// const PORT = process.env.PORT || 5000;
// console.log(
//   process.env.EMAIL_HOST,
//   process.env.EMAIL_USER,
//   process.env.EMAIL_PASS
// );

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const { initGridFSBucket } = require("./utils/gridfs");

// Routes
const authRoutes = require("./routes/auth");
const locationRoutes = require("./routes/location");
const dashboardRoutes = require("./routes/dashboard");
const deviceRoutes = require("./routes/deviceRoutes");
const cropRoutes = require("./routes/cropRoutes");
const deviceConfigRoutes = require("./routes/deviceConfig");
const userRoutes = require("./routes/userRoutes");
const operationModeRoutes = require("./routes/operationModeRoutes");
const firmwareRoutes = require("./routes/firmwareRoutes");

const app = express();

// -------------------
// Connect MongoDB
// -------------------
connectDB().then(() => {
  initGridFSBucket(mongoose.connection);
  console.log("GridFS initialized");
});

// -------------------
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//!rate limiter, use later if needed
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
// });
// app.use(limiter);


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

app.get("/", (req, res) => {
  res.json({ ok: true, msg: "MERN backend running" });
});

// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

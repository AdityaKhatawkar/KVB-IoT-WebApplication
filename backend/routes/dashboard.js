const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");
const User = require("../models/User");

// ===============================
// STATIC ROUTES (IN EXACT ORDER)
// ===============================

// Count users
router.get("/users/count", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Search users
router.get("/users/search", protect, adminOnly, dashboardController.searchUser);

// Get all users
router.get("/users", protect, adminOnly, dashboardController.getUsers);

// Add device
router.post(
  "/users/device/add",
  protect,
  adminOnly,
  dashboardController.addDevice
);

// Remove device
router.post(
  "/users/device/remove",
  protect,
  adminOnly,
  dashboardController.removeDevice
);

// Dashboards
router.get("/dashboard/user", protect, dashboardController.userDashboard);
router.get(
  "/dashboard/admin",
  protect,
  adminOnly,
  dashboardController.adminDashboard
);

// ===============================
// DYNAMIC ROUTE — ALWAYS LAST
// ===============================
router.get("/users/:id", protect, adminOnly, dashboardController.getUserById);

module.exports = router;

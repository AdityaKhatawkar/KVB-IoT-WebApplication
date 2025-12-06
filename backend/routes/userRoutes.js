const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getUserDevices,
  getUserCount,
  getDeviceCount,
  getUserByIdSecure,
  grantPresetAccess,
  revokePresetAccess,
  getPresetAccessForUser,
  assignPresetToUser,
  removePresetFromUser,
} = require("../controllers/userController");

const { getActiveDeviceCount } = require("../controllers/deviceController");
const dashboardController = require("../controllers/dashboardController");
const { getOnlineUsers } = require("../controllers/userController");


// ===============================
// STATIC ROUTES (MUST COME FIRST)
// ===============================

router.get("/me", protect, async (req, res) => {
  try {
    const UserModel = require("../models/User");
    const DeviceMetadata = require("../models/DeviceMetadata");
    const DeviceHistory = require("../models/DeviceHistory");

    const user = await UserModel.findById(req.user._id).select(
      "name email phone devices location"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.devices || user.devices.length === 0) {
      return res.json({
        success: true,
        user,
        devices: [],
      });
    }

    // Fetch metadata for all devices
    const metaList = await DeviceMetadata.find({
      device_name: { $in: user.devices },
    });

    // Convert metadata list → map
    const metaMap = {};
    metaList.forEach((m) => {
      metaMap[m.device_name] = m;
    });

    // Fetch latest preset entry for each device
    const historyList = await Promise.all(
      user.devices.map(async (deviceName) => {
        return await DeviceHistory.findOne({ device_name: deviceName })
          .sort({ configuredAt: -1 }) // latest entry
          .lean();
      })
    );

    const historyMap = {};
    historyList.forEach((h) => {
      if (!h) return;
      historyMap[h.device_name] = h;
    });

    // Merge deviceName + metadata + latest preset
    const devices = user.devices.map((deviceName) => {
      const meta = metaMap[deviceName] || {};
      const latest = historyMap[deviceName] || {};

      const preset = latest.preset_name || latest.crop_name || null;

      return {
        device_name: deviceName,
        active: meta.active ?? false,
        subscriptionStart: meta.subscriptionStart ?? null,
        subscriptionEnd: meta.subscriptionEnd ?? null,
        daysRemaining: meta.daysRemaining ?? null,
        lastActive: meta.lastActive ?? null,

        // ⭐ NEW FIELD — From latest DeviceHistory ⭐
        preset,
      };
    });

    return res.json({
      success: true,
      user,
      devices,
    });
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Counts
router.get("/count", getUserCount);
router.get("/online", protect, adminOnly, getOnlineUsers);
router.get("/devices/count", getDeviceCount);
router.get("/devices/active", getActiveDeviceCount);

// Search (admin only)
router.get("/search", protect, adminOnly, dashboardController.searchUser);

// Get devices for logged user
router.get("/devices", protect, getUserDevices);

// Preset routes
router.post("/:userId/presets/grant", protect, adminOnly, grantPresetAccess);
router.delete(
  "/:userId/presets/:presetId",
  protect,
  adminOnly,
  revokePresetAccess
);
router.get("/:id/presets", getPresetAccessForUser);
router.post("/:id/presets/assign", assignPresetToUser);
router.post("/:id/presets/remove", removePresetFromUser);

// ===============================
// DYNAMIC ROUTE — ALWAYS LAST
// ===============================
router.get("/:id", protect, getUserByIdSecure);

module.exports = router;

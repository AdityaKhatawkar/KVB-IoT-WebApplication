// // controllers/userController.js
// const User = require("../models/User");

// // GET /api/users/devices?email=user@example.com
// exports.getUserDevices = async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ devices: user.devices });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // GET /api/users/count
// exports.getUserCount = async (req, res) => {
//   try {
//     const count = await User.countDocuments();
//     res.json({ totalUsers: count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // GET /api/users/devices/count
// exports.getDeviceCount = async (req, res) => {
//   try {
//     const users = await User.find({}, "devices");
//     let totalDevices = 0;

//     users.forEach(user => {
//       totalDevices += user.devices.length;
//     });

//     res.json({ totalDevices });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };




//!Version 2

// controllers/userController.js
const User = require("../models/User");
const Crop = require("../models/Crop");
// =========================
// GET USER DEVICES (SECURE)
// =========================
// Admin → can access any user's devices
// Normal user → only their own devices
exports.getUserDevices = async (req, res) => {
  try {
    const { email } = req.query;

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let targetEmail = email;

    if (req.user.role !== "admin") {
      // Normal users can access ONLY their own devices
      targetEmail = req.user.email;

      if (email && email !== req.user.email) {
        return res.status(403).json({
          message: "Forbidden: cannot access other user's devices",
        });
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: targetEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ devices: user.devices || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================
// USER COUNT
// ===================
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================
// DEVICE COUNT
// ===================
exports.getDeviceCount = async (req, res) => {
  try {
    const users = await User.find({}, "devices");
    let totalDevices = 0;

    users.forEach((user) => {
      totalDevices += user.devices.length;
    });

    res.json({ totalDevices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// GET USER BY ID (SECURE)
// ==============================
// Admin → can fetch any user
// Normal user → can fetch ONLY themselves
exports.getUserByIdSecure = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { id } = req.params;

    if (req.user.role !== "admin" && String(req.user._id) !== String(id)) {
      return res.status(403).json({
        message: "Forbidden: cannot access other user's details",
      });
    }

    const user = await User.findById(id)
      .select(
        "name email phone devices location accessiblePresets"
      )
      .populate("accessiblePresets");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      devices: user.devices || [],
      location: user.location || {},
      accessiblePresets: user.accessiblePresets || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================================
// GRANT PRESET ACCESS (ADMIN ONLY)
// ========================================
exports.grantPresetAccess = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const { userId } = req.params;
    const { presetId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const Crop = require("../models/Crop");
    const crop = await Crop.findById(presetId);
    if (!crop) {
      return res.status(404).json({ message: "Preset not found" });
    }

    if (!user.accessiblePresets.includes(presetId)) {
      user.accessiblePresets.push(presetId);
      await user.save();
    }

    const updatedUser = await User.findById(userId).populate(
      "accessiblePresets"
    );
    res.json({
      message: "Preset access granted successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================================
// REVOKE PRESET ACCESS (ADMIN ONLY)
// ========================================
exports.revokePresetAccess = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const { userId, presetId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accessiblePresets = user.accessiblePresets.filter(
      (id) => id.toString() !== presetId
    );
    await user.save();

    const updatedUser = await User.findById(userId).populate(
      "accessiblePresets"
    );
    res.json({
      message: "Preset access revoked successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------
// GET all crops + assigned status
// -------------------------------
exports.getPresetAccessForUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).populate(
      "accessiblePresets.preset"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const allCrops = await Crop.find();

    const presets = allCrops.map((crop) => {
      const match = user.accessiblePresets.find(
        (p) => p.preset && p.preset._id.toString() === crop._id.toString()
      );

      const assigned = crop.tier === "free" || !!match;

      const expiresAt = match?.expiresAt || null;
      const expired = expiresAt ? new Date(expiresAt) < new Date() : false;

      return {
        crop,
        free: crop.tier === "free",
        assigned,
        expired,
        expiresAt,
        locked: !assigned, // 🚀 NEW: Not free + not assigned
      };
    });

    res.json(presets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------------------------
// ASSIGN preset to a specific user
// -------------------------------
exports.assignPresetToUser = async (req, res) => {
  try {
    const { presetId, days } = req.body;
    const userId = req.params.id;

    const preset = await Crop.findById(presetId);

    // FREE preset cannot be assigned manually
    if (preset.tier === "free") {
      return res.status(400).json({
        message: "Free presets are assigned automatically",
      });
    }

    const assignedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Remove previous assignment
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { accessiblePresets: { preset: presetId } },
      },
      { new: true }
    );

    // Add new assignment
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          accessiblePresets: {
            preset: presetId,
            assignedAt,
            expiresAt,
          },
        },
      },
      { new: true }
    );

    res.json({ message: "Preset assigned", data: updatedUser });
  } catch (err) {
    console.error("Error assigning preset:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------
// REMOVE preset
// -------------------------------
exports.removePresetFromUser = async (req, res) => {
  try {
    const { presetId } = req.body;
    const userId = req.params.id;

    const preset = await Crop.findById(presetId);

    // Cannot remove free presets
    if (preset.tier === "free") {
      return res.status(400).json({
        message: "Free presets cannot be removed",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { accessiblePresets: { preset: presetId } } },
      { new: true }
    );

    res.json({ message: "Preset removed", data: updatedUser });
  } catch (err) {
    console.error("Error removing preset:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/users/online
exports.getOnlineUsers = async (req, res) => {
  try {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

    const users = await User.find({
      lastActive: { $gte: tenMinAgo }
    }).select("name email devices lastActive");

    res.json({ users });
  } catch (err) {
    console.error("Error fetching online users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// const User = require("../models/User");

// exports.userDashboard = async (req, res) => {
//   // Placeholder content
//   res.json({
//     message: `Welcome to user dashboard, ${req.user.name}`,
//     placeholder: "User dashboard placeholder content",
//   });
// };

// exports.adminDashboard = async (req, res) => {
//   // Placeholder content
//   res.json({
//     message: `Welcome to admin dashboard, ${req.user.name}`,
//     placeholder: "Admin dashboard placeholder content",
//   });
// };

// // Get all users (name, phone, devices)
// // controllers/adminController.js
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find(
//       {},
//       "name phone email devices location.state location.city"
//     ).lean();

//     // Format the response to flatten location for frontend use
//     const formattedUsers = users.map((u) => ({
//       _id: u._id,
//       name: u.name,
//       phone: u.phone,
//       email: u.email,
//       state: u.location?.state || "",
//       city: u.location?.city || "",
//       devices: u.devices || [],
//     }));

//     res.json(Array.isArray(formattedUsers) ? formattedUsers : []);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Search users by name or phone
// exports.searchUser = async (req, res) => {
//   try {
//     const { query } = req.query; // ?query=something
//     const users = await User.find(
//       {
//         $or: [
//           { name: { $regex: query, $options: "i" } },
//           { phone: { $regex: query, $options: "i" } },
//         ],
//       },
//       "name phone devices"
//     );
//     res.json(Array.isArray(users) ? users : []);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Add device by phone
// // exports.addDevice = async (req, res) => {
// //   try {
// //     const { phone, device } = req.body;
// //     const user = await User.findOneAndUpdate(
// //       { phone },
// //       { $addToSet: { devices: device } }, // avoid duplicates
// //       { new: true }
// //     );
// //     if (!user) return res.status(404).json({ error: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };
// exports.addDevice = async (req, res) => {
//   try {
//     const { phone, device } = req.body;

//     // 1. Check if this device is already assigned to ANY user
//     const existingUser = await User.findOne({ devices: device });
//     if (existingUser) {
//       return res.status(400).json({
//         error: `Device already assigned to another user (${existingUser.phone})`,
//       });
//     }

//     // 2. Add device to the specific user
//     const user = await User.findOneAndUpdate(
//       { phone },
//       { $addToSet: { devices: device } }, // avoid duplicates for that user
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.json({
//       message: "Device added successfully",
//       user: {
//         name: user.name,
//         phone: user.phone,
//         devices: user.devices,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Remove device by phone
// exports.removeDevice = async (req, res) => {
//   try {
//     const { phone, device } = req.body;
//     const user = await User.findOneAndUpdate(
//       { phone },
//       { $pull: { devices: device } },
//       { new: true }
//     );
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

//!Version 2

const User = require("../models/User");

// USER DASHBOARD
exports.userDashboard = async (req, res) => {
  res.json({
    message: `Welcome to user dashboard, ${req.user.name}`,
    placeholder: "User dashboard placeholder content",
  });
};

// ADMIN DASHBOARD
exports.adminDashboard = async (req, res) => {
  res.json({
    message: `Welcome to admin dashboard, ${req.user.name}`,
    placeholder: "Admin dashboard placeholder content",
  });
};

// GET ALL USERS (name, phone, email, devices, location)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name phone email devices location.state location.city"
    ).lean();

    const formatted = users.map((u) => ({
      _id: u._id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      state: u.location?.state || "",
      city: u.location?.city || "",
      devices: u.devices || [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// SEARCH USER BY NAME OR PHONE
exports.searchUser = async (req, res) => {
  try {
    const { query } = req.query;

    const users = await User.find(
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      },
      "name phone email location devices"
    );

    // flatten location for frontend compatibility
    const formatted = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      state: u.location?.state || "",
      city: u.location?.city || "",
      devices: u.devices || [],
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// NEW FROM V2: Get user devices
exports.getUserDevices = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("name devices");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      name: user.name,
      devices: user.devices || [],
    });
  } catch (err) {
    console.error("Error getting user devices:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// NEW FROM V2: Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("name phone email devices");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      devices: user.devices || [],
    });
  } catch (err) {
    console.error("Error getting user by id:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ADD DEVICE (Improved from V2)
exports.addDevice = async (req, res) => {
  try {
    const { phone, device } = req.body;

    if (!phone || !device) {
      return res.status(400).json({ error: "Phone and device are required" });
    }

    // Ensure device is not assigned to anyone else
    const existingUser = await User.findOne({ devices: device });
    if (existingUser) {
      return res.status(400).json({
        error: `Device already assigned to ${existingUser.name} (${existingUser.phone})`,
      });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { $addToSet: { devices: device } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      message: "Device added successfully",
      user: {
        id: user._id,
        name: user.name,
        devices: user.devices || [],
      },
    });
  } catch (err) {
    console.error("Error adding device:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// REMOVE DEVICE (Improved from V2)
exports.removeDevice = async (req, res) => {
  try {
    const { phone, device } = req.body;

    if (!phone || !device) {
      return res.status(400).json({ error: "Phone and device are required" });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { $pull: { devices: device } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      message: "Device removed successfully",
      user: {
        id: user._id,
        name: user.name,
        devices: user.devices || [],
      },
    });
  } catch (err) {
    console.error("Error removing device:", err);
    res.status(500).json({ error: "Server error" });
  }
};

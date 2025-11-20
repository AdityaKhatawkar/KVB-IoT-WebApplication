// scripts/initDeviceMetadata.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const DeviceMetadata = require("../models/DeviceMetadata");

(async function init() {
  try {
    await connectDB();
    const users = await User.find({}, "devices").lean();
    const allDevices = new Set();
    users.forEach((u) => (u.devices || []).forEach((d) => allDevices.add(d)));
    const devices = Array.from(allDevices);

    for (const device_name of devices) {
      await DeviceMetadata.findOneAndUpdate(
        { device_name },
        { $setOnInsert: { device_name, active: true } },
        { upsert: true, new: true }
      );
      console.log("Initialized metadata for:", device_name);
    }

    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

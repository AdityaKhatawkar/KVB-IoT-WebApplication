const DeviceData = require("../models/deviceModel");
const User = require("../models/User");
const DeviceConfig = require("../models/deviceConfig");
const OperationMode = require("../models/operationMode");
const DeviceMetadata = require("../models/DeviceMetadata");

// Test route
exports.testServer = (req, res) => {
  res.send("IoT Server is running 🚀");
};

// Save incoming data
exports.saveData = async (req, res) => {
  try {
    const { device_name } = req.body;

    // 1. Check if any user has this device assigned
    const userWithDevice = await User.findOne({ devices: device_name });
    if (!userWithDevice) {
      console.log(
        `⚠️ Device ${device_name} not assigned to any user, ignoring data`
      );
      return res.status(400).send("Device not assigned to any user");
    }

    // 2. Save new reading
    const newData = new DeviceData(req.body);
    await newData.save();

    // ⭐ UPDATE LAST ACTIVE HERE ⭐
    try {
      await DeviceMetadata.findOneAndUpdate(
        { device_name },
        { $set: { lastActive: new Date() } },
        { upsert: true }
      );
    } catch (metaErr) {
      console.error("Error updating lastActive:", metaErr);
    }

    console.log("📥 Data received:", req.body);

    // 3. Keep only last 5 readings for this specific device
    const readings = await DeviceData.find({ device_name })
      .sort({ timestamp: -1 })
      .skip(5);

    if (readings.length > 0) {
      const idsToDelete = readings.map((r) => r._id);
      await DeviceData.deleteMany({ _id: { $in: idsToDelete } });
      console.log(
        `🗑️ Deleted ${idsToDelete.length} old readings for device ${device_name}`
      );
    }

    res.status(201).send("Data stored successfully");
  } catch (err) {
    console.error("❌ Error saving data:", err);
    res.status(500).send("Error saving data");
  }
};


// Get 5 recent readings for a specific device
exports.getRecentByDevice = async (req, res) => {
  try {
    const { deviceName } = req.params; // deviceName comes from the URL

    const recent = await DeviceData.find({ device_name: deviceName })
      .sort({ timestamp: -1 })
      .limit(5);

    if (!recent.length) {
      return res.status(404).json({ message: "No data found for this device" });
    }

    res.json(recent.reverse()); // reverse so graph is in oldest → latest order
  } catch (err) {
    console.error("❌ Error fetching recent data:", err);
    res.status(500).send("Error fetching recent data");
  }
};

exports.getLatestThreshold = async (req, res) => {
  try {
    const { device_name } = req.query;

    if (!device_name) {
      return res.status(400).json({ error: "device_name is required" });
    }

    // Fetch threshold from deviceconfigs collection
    const threshold = await DeviceConfig.findOne({ device_name });

    if (!threshold) {
      return res
        .status(404)
        .json({ error: `No threshold found for device: ${device_name}` });
    }

    // Return in IoT device format
    res.json({
      device_name: threshold.device_name,
      temperature: threshold.temperature,
      humidity: threshold.humidity,
    });

    console.log(`📤 Sent thresholds to device: ${device_name}`, {
      temperature: threshold.temperature,
      humidity: threshold.humidity,
    });
  } catch (err) {
    console.error("❌ Error fetching threshold:", err);
    res.status(500).json({ error: "Error fetching threshold" });
  }
};


// 2️⃣ Fan stages only
// @desc    Get only device name + 6 fan PWM stages
// @route   GET /api/devices/fan_stages?device_name=KVB2
exports.getFanStages = async (req, res) => {
  try {
    const { device_name } = req.query;

    if (!device_name) {
      return res.status(400).json({ error: "device_name is required" });
    }

    // 1️⃣ Fetch the operation mode
    const mode = await OperationMode.findOne({ device_name });

    if (!mode) {
      return res
        .status(404)
        .json({ error: `No operation mode found for device: ${device_name}` });
    }

    // 2️⃣ Fetch config
    const config = await DeviceConfig.findOne({ device_name });
    if (!config) {
      return res
        .status(404)
        .json({ error: `No configuration found for device: ${device_name}` });
    }

    // 3️⃣ Decide fan stages based on mode
    let fanStages;
    if (mode.operation_mode === 1) {
      // WiFi mode → use preset config values
      fanStages = {
        stage1_pwm: config.stage1_pwm,
        stage2_pwm: config.stage2_pwm,
        stage3_pwm: config.stage3_pwm,
        stage4_pwm: config.stage4_pwm,
        stage5_pwm: config.stage5_pwm,
        stage6_pwm: config.stage6_pwm,
      };
    } else {
      // Manual mode → all fans full speed (255)
      fanStages = {
        stage1_pwm: 255,
        stage2_pwm: 255,
        stage3_pwm: 255,
        stage4_pwm: 255,
        stage5_pwm: 255,
        stage6_pwm: 255,
      };
    }

    // 4️⃣ Send response
    res.json({
      device_name: config.device_name,
      operation_mode: mode.operation_mode,
      ...fanStages,
    });

    console.log(
      `📤 Sent fan stages for ${device_name} → Mode: ${
        mode.operation_mode === 1 ? "WiFi" : "Manual"
      }`
    );
  } catch (err) {
    console.error("Error fetching fan stages:", err);
    res.status(500).json({ error: "Error fetching fan stages" });
  }
};

// GET metadata for a single device
exports.getMetadata = async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const meta = await DeviceMetadata.findOne({ device_name: deviceName });

    if (!meta) {
      return res.status(404).json({ msg: "No metadata found", device_name: deviceName });
    }
    res.json(meta);
  } catch (err) {
    console.error("Error getting metadata:", err);
    res.status(500).json({ msg: err.message });
  }
};

// BATCH GET metadata for many devices: ?deviceNames=name1,name2
exports.getMetadataBatch = async (req, res) => {
  try {
    const q = req.query.deviceNames; // comma separated
    if (!q) return res.status(400).json({ msg: "deviceNames query required" });

    const names = q.split(",").map((s) => s.trim()).filter(Boolean);
    const metas = await DeviceMetadata.find({ device_name: { $in: names } });
    // Return as map for easier frontend merging
    const map = {};
    metas.forEach((m) => (map[m.device_name] = m));
    res.json(map);
  } catch (err) {
    console.error("Error getting metadata batch:", err);
    res.status(500).json({ msg: err.message });
  }
};

// PATCH update metadata for a device
exports.updateMetadata = async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const payload = {};

    if (typeof req.body.active !== "undefined") payload.active = !!req.body.active;
    if (typeof req.body.subscriptionStart !== "undefined")
      payload.subscriptionStart = req.body.subscriptionStart ? new Date(req.body.subscriptionStart) : undefined;
    if (typeof req.body.subscriptionEnd !== "undefined")
      payload.subscriptionEnd = req.body.subscriptionEnd ? new Date(req.body.subscriptionEnd) : undefined;
    if (typeof req.body.daysRemaining !== "undefined")
      payload.daysRemaining = typeof req.body.daysRemaining === "number" ? req.body.daysRemaining : Number(req.body.daysRemaining);
    if (typeof req.body.lastActive !== "undefined")
      payload.lastActive = req.body.lastActive ? new Date(req.body.lastActive) : undefined;

    const updated = await DeviceMetadata.findOneAndUpdate(
      { device_name: deviceName },
      { $set: payload },
      { upsert: true, new: true }
    );

    res.json({ msg: "Metadata updated", metadata: updated });
  } catch (err) {
    console.error("Error updating metadata:", err);
    res.status(500).json({ msg: err.message });
  }
};




// GET /api/users/devices/active
exports.getActiveDeviceCount = async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const activeDevices = await DeviceMetadata.countDocuments({
      active: true,
      subscriptionEnd: { $gt: now },             // subscription valid
      lastActive: { $gte: oneHourAgo },          // contacted within last 1 hour
    });

    res.json({ activeDevices });
  } catch (err) {
    console.error("Error counting active devices:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// const DeviceConfig = require("../models/deviceConfig");
// const Crop = require("../models/Crop");
// const DeviceHistory = require("../models/DeviceHistory");

// // @desc    Get configuration for a device
// // @route   GET /api/device-config/:deviceName
// exports.getDeviceConfig = async (req, res) => {
//   try {
//     const config = await DeviceConfig.findOne({
//       device_name: req.params.deviceName,
//     });
//     if (!config)
//       return res.status(404).json({ msg: "No configuration found." });
//     res.json(config);
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

// // @desc    Update device configuration based on selected crop
// // @route   POST /api/device-config/:deviceName/configure
// exports.configureDevice = async (req, res) => {
//   const { cropName } = req.body;

//   try {
//     const crop = await Crop.findOne({ crop_name: cropName });
//     if (!crop) return res.status(404).json({ msg: "Crop not found." });

//     // 1️⃣ Update the current configuration including fan stages
//     const updatedConfig = await DeviceConfig.findOneAndUpdate(
//       { device_name: req.params.deviceName },
//       {
//         temperature: crop.temperature,
//         humidity: crop.humidity,
//         stage1_pwm: crop.fan_stages[0],
//         stage2_pwm: crop.fan_stages[1],
//         stage3_pwm: crop.fan_stages[2],
//         stage4_pwm: crop.fan_stages[3],
//         stage5_pwm: crop.fan_stages[4],
//         stage6_pwm: crop.fan_stages[5],
//       },
//       { new: true, upsert: true }
//     );

//     // 2️⃣ Save a history entry including fan stages
//     await DeviceHistory.create({
//       device_name: req.params.deviceName,
//       crop_name: crop.crop_name,
//       temperature: crop.temperature,
//       humidity: crop.humidity,
//       fan_stages: crop.fan_stages,
//     });

//     res.json({
//       msg: "Device configured successfully.",
//       config: updatedConfig,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

// exports.getDeviceHistory = async (req, res) => {
//   try {
//     const { start, end } = req.query;
//     const filter = { device_name: req.params.deviceName };

//     if (start || end) {
//       filter.configuredAt = {};

//       if (start) {
//         const startDate = new Date(start);
//         startDate.setHours(0, 0, 0, 0); // start of the day local
//         filter.configuredAt.$gte = startDate;
//       }

//       if (end) {
//         const endDate = new Date(end);
//         endDate.setHours(23, 59, 59, 999); // end of the day local
//         filter.configuredAt.$lte = endDate;
//       }
//     }

//     const history = await DeviceHistory.find(filter).sort({ configuredAt: -1 });
//     res.json(history);
//   } catch (err) {
//     console.error("Error fetching device history:", err);
//     res.status(500).json({ msg: err.message });
//   }
// };

//!Version 2

const DeviceConfig = require("../models/deviceConfig");
const Crop = require("../models/Crop");
const DeviceHistory = require("../models/DeviceHistory");

// GET DEVICE CONFIG
exports.getDeviceConfig = async (req, res) => {
  try {
    const config = await DeviceConfig.findOne({
      device_name: req.params.deviceName,
    });

    if (!config) {
      return res.status(404).json({ msg: "No configuration found." });
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// MAP 6 FAN STAGES → stage1_pwm ... stage6_pwm
function mapStages(stagesArr) {
  const s = Array.isArray(stagesArr)
    ? stagesArr.map((v) => (typeof v === "string" ? Number(v) : v))
    : [];

  return {
    stage1_pwm:
      typeof s[0] === "number" && !Number.isNaN(s[0]) ? s[0] : undefined,
    stage2_pwm:
      typeof s[1] === "number" && !Number.isNaN(s[1]) ? s[1] : undefined,
    stage3_pwm:
      typeof s[2] === "number" && !Number.isNaN(s[2]) ? s[2] : undefined,
    stage4_pwm:
      typeof s[3] === "number" && !Number.isNaN(s[3]) ? s[3] : undefined,
    stage5_pwm:
      typeof s[4] === "number" && !Number.isNaN(s[4]) ? s[4] : undefined,
    stage6_pwm:
      typeof s[5] === "number" && !Number.isNaN(s[5]) ? s[5] : undefined,
  };
}

// CONFIGURE DEVICE (Preset + Manual Mode)
exports.configureDevice = async (req, res) => {
  try {
    const { cropName, temperature, humidity, presetName, fan_stages } =
      req.body;
    const deviceName = req.params.deviceName;

    // PRESET MODE (cropName exists and is not "manual")
    if (cropName && String(cropName).toLowerCase() !== "manual") {
      const crop = await Crop.findOne({ crop_name: cropName });

      // If preset not found but manual values exist → fallback
      if (!crop) {
        const tempNum =
          typeof temperature === "string" ? Number(temperature) : temperature;
        const humNum =
          typeof humidity === "string" ? Number(humidity) : humidity;

        if (
          typeof tempNum === "number" &&
          !Number.isNaN(tempNum) &&
          typeof humNum === "number" &&
          !Number.isNaN(humNum)
        ) {
          const stageUpdate = mapStages(fan_stages);

          const updatedConfig = await DeviceConfig.findOneAndUpdate(
            { device_name: deviceName },
            { temperature: tempNum, humidity: humNum, ...stageUpdate },
            { new: true, upsert: true }
          );

          await DeviceHistory.create({
            device_name: deviceName,
            crop_name: "Manual",
            temperature: tempNum,
            humidity: humNum,
            preset_mode: "Manual",
            preset_name: presetName?.trim() || "Manual",
            ...stageUpdate,
          });

          return res.json({
            msg: "Device configured successfully.",
            config: updatedConfig,
          });
        }

        return res.status(404).json({ msg: "Crop not found." });
      }

      // PRESET MODE SUCCESS
      const stageUpdate = mapStages(crop.fan_stages);

      const updatedConfig = await DeviceConfig.findOneAndUpdate(
        { device_name: deviceName },
        {
          temperature: crop.temperature,
          humidity: crop.humidity,
          ...stageUpdate,
        },
        { new: true, upsert: true }
      );

      await DeviceHistory.create({
        device_name: deviceName,
        crop_name: crop.crop_name,
        temperature: crop.temperature,
        humidity: crop.humidity,
        preset_mode: "Preset",
        preset_name: crop.crop_name,
        ...stageUpdate,
      });

      return res.json({
        msg: "Device configured successfully.",
        config: updatedConfig,
      });
    }

    // MANUAL MODE
    const tempNum =
      typeof temperature === "string" ? Number(temperature) : temperature;
    const humNum = typeof humidity === "string" ? Number(humidity) : humidity;

    if (
      typeof tempNum !== "number" ||
      Number.isNaN(tempNum) ||
      typeof humNum !== "number" ||
      Number.isNaN(humNum)
    ) {
      return res.status(400).json({
        msg: "temperature and humidity are required for manual mode",
      });
    }

    if (!presetName || !presetName.trim()) {
      return res
        .status(400)
        .json({ msg: "presetName is required for manual mode" });
    }

    const stageUpdate = mapStages(fan_stages);

    const updatedConfig = await DeviceConfig.findOneAndUpdate(
      { device_name: deviceName },
      { temperature: tempNum, humidity: humNum, ...stageUpdate },
      { new: true, upsert: true }
    );

    await DeviceHistory.create({
      device_name: deviceName,
      crop_name: "Manual",
      temperature: tempNum,
      humidity: humNum,
      preset_mode: "Manual",
      preset_name: presetName.trim(),
      ...stageUpdate,
    });

    res.json({
      msg: "Device configured successfully.",
      config: updatedConfig,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DEVICE HISTORY (same as V1)
exports.getDeviceHistory = async (req, res) => {
  try {
    const { start, end } = req.query;

    const filter = { device_name: req.params.deviceName };

    if (start || end) {
      filter.configuredAt = {};

      if (start) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        filter.configuredAt.$gte = startDate;
      }

      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.configuredAt.$lte = endDate;
      }
    }

    const history = await DeviceHistory.find(filter).sort({ configuredAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Error fetching device history:", err);
    res.status(500).json({ msg: err.message });
  }
};

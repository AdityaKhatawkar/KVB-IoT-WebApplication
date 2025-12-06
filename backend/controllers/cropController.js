// const Crop = require("../models/Crop");

// exports.uploadCrops = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ msg: "No file uploaded" });
//     }

//     let jsonData = JSON.parse(req.file.buffer.toString());

//     // If it's a single object, wrap it in an array
//     if (!Array.isArray(jsonData)) {
//       jsonData = [jsonData];
//     }

//     for (const crop of jsonData) {
//       const { crop_name, temperature, humidity } = crop;

//       if (!crop_name || temperature === undefined || humidity === undefined) {
//         continue; // Skip invalid entries
//       }

//       // Upsert: update if exists, otherwise insert
//       await Crop.findOneAndUpdate(
//         { crop_name },
//         { temperature, humidity },
//         { upsert: true, new: true }
//       );
//     }

//     res.status(200).json({ msg: "Crops uploaded and updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Server error", error: error.message });
//   }
// };

// // Get all crops
// exports.getCrops = async (req, res) => {
//   try {
//     const crops = await Crop.find();
//     res.json(crops);
//   } catch (error) {
//     res.status(500).json({ msg: "Server error", error: error.message });
//   }
// };




//!Version 2
const Crop = require("../models/Crop");

// Upload crops JSON
exports.uploadCrops = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    let jsonData = JSON.parse(req.file.buffer.toString());

    // If single object, convert to array
    if (!Array.isArray(jsonData)) {
      jsonData = [jsonData];
    }

    for (const crop of jsonData) {
      const { crop_name, temperature, humidity, fan_stages, tier } = crop;

      if (!crop_name || temperature === undefined || humidity === undefined) {
        continue;
      }

      // Upsert with optional new fields
      await Crop.findOneAndUpdate(
        { crop_name },
        {
          temperature,
          humidity,
          ...(Array.isArray(fan_stages) ? { fan_stages } : {}),
          ...(tier ? { tier } : {}),
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ msg: "Crops uploaded and updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get crops - supports user-based filtering
exports.getCrops = async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId) {
      const User = require("../models/User");
      const user = await User.findById(userId).populate("accessiblePresets");

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const accessiblePresetIds = user.accessiblePresets.map((p) => p._id || p);

      const freeTierCrops = await Crop.find({ tier: "free" });
      const accessibleCrops = await Crop.find({
        _id: { $in: accessiblePresetIds },
      });

      // Remove duplicates
      const combined = [...freeTierCrops, ...accessibleCrops];
      const unique = Array.from(
        new Map(combined.map((c) => [c._id.toString(), c])).values()
      );

      return res.json(unique);
    }

    const crops = await Crop.find();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Admin: update only the tier
exports.updatePresetTier = async (req, res) => {
  try {
    const { presetId } = req.params;
    const { tier } = req.body;

    if (!["free", "locked"].includes(tier)) {
      return res
        .status(400)
        .json({ msg: "Invalid tier. Must be 'free' or 'locked'" });
    }

    const crop = await Crop.findByIdAndUpdate(
      presetId,
      { tier },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json({ msg: "Preset not found" });
    }

    res.json({ msg: "Preset tier updated successfully", crop });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Admin: update full crop fields
exports.updateCrop = async (req, res) => {
  try {
    const { presetId } = req.params;
    const { crop_name, temperature, humidity, fan_stages, tier } = req.body;

    const update = {};

    if (crop_name !== undefined) update.crop_name = crop_name;
    if (temperature !== undefined) update.temperature = temperature;
    if (humidity !== undefined) update.humidity = humidity;
    if (Array.isArray(fan_stages)) update.fan_stages = fan_stages.map(Number);
    if (tier !== undefined) update.tier = tier;

    const crop = await Crop.findByIdAndUpdate(presetId, update, { new: true });

    if (!crop) {
      return res.status(404).json({ msg: "Preset not found" });
    }

    res.json({ msg: "Preset updated successfully", crop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

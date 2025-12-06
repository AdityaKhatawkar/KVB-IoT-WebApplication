// const mongoose = require("mongoose");

// const deviceHistorySchema = new mongoose.Schema({
//   device_name: { type: String, required: true },
//   crop_name: { type: String, required: true },
//   temperature: { type: Number, required: true },
//   humidity: { type: Number, required: true },
//   configuredAt: { type: Date, default: Date.now },
// });

// // Optional index for faster cleanup queries
// deviceHistorySchema.index(
//   { configuredAt: 1 },
//   { expireAfterSeconds: 60 * 60 * 24 * 31 }
// );
// // TTL index keeps entries for 31 days automatically

// module.exports = mongoose.model("DeviceHistory", deviceHistorySchema);



//!Version 2

const mongoose = require("mongoose");

const deviceHistorySchema = new mongoose.Schema({
  device_name: { type: String, required: true },
  crop_name: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },

  // New fields from V2
  preset_mode: { type: String, enum: ["Manual", "Preset"], required: false },
  preset_name: { type: String, required: false },

  // PWM stage snapshots
  stage1_pwm: { type: Number },
  stage2_pwm: { type: Number },
  stage3_pwm: { type: Number },
  stage4_pwm: { type: Number },
  stage5_pwm: { type: Number },
  stage6_pwm: { type: Number },

  configuredAt: { type: Date, default: Date.now },
});

// Automatically delete entries older than 31 days
deviceHistorySchema.index(
  { configuredAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 31 }
);

module.exports =
  mongoose.models.DeviceHistory ||
  mongoose.model("DeviceHistory", deviceHistorySchema);

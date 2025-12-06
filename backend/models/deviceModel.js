const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  device_name: String,
  temperature: Number,
  humidity: Number,
  set_temperature: Number,
  set_humidity: Number,
  ac_fan_status: Number,
  dc_fan_status: Number,
  circular_fan_speed: Number,
  operation_mode: String,
  device_status: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeviceData", deviceSchema);

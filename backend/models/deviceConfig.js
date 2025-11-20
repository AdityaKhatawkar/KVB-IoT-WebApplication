// const mongoose = require("mongoose");

// const deviceConfigSchema = new mongoose.Schema(
//   {
//     device_name: { type: String, required: true, unique: true },
//     temperature: { type: Number, required: true },
//     humidity: { type: Number, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("DeviceConfig", deviceConfigSchema);







// const mongoose = require("mongoose");

// const deviceConfigSchema = new mongoose.Schema({
//   device_name: { type: String, required: true, unique: true },
//   temperature: { type: Number, required: true },
//   humidity: { type: Number, required: true },

//   // Explicit fan stages for IoT device
//   stage1_pwm: { type: Number, required: true },
//   stage2_pwm: { type: Number, required: true },
//   stage3_pwm: { type: Number, required: true },
//   stage4_pwm: { type: Number, required: true },
//   stage5_pwm: { type: Number, required: true },
//   stage6_pwm: { type: Number, required: true },
// });

// module.exports = mongoose.model("DeviceConfig", deviceConfigSchema);


//!Version 2

const mongoose = require("mongoose");

const deviceConfigSchema = new mongoose.Schema(
  {
    device_name: { type: String, required: true, unique: true },

    // These MUST always exist for a valid configuration
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },

    // PWM fan stages (optional at creation, set during configure)
    stage1_pwm: { type: Number },
    stage2_pwm: { type: Number },
    stage3_pwm: { type: Number },
    stage4_pwm: { type: Number },
    stage5_pwm: { type: Number },
    stage6_pwm: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeviceConfig", deviceConfigSchema);



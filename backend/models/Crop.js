// const mongoose = require("mongoose");

// const cropSchema = new mongoose.Schema({
//   crop_name: { type: String, required: true, unique: true },
//   temperature: { type: Number, required: true },
//   humidity: { type: Number, required: true },
// });

// module.exports = mongoose.model("Crop", cropSchema);

//!Verson 1

// const mongoose = require("mongoose");

// const cropSchema = new mongoose.Schema({
//   crop_name: { type: String, required: true, unique: true },
//   temperature: { type: Number, required: true },
//   humidity: { type: Number, required: true },
//   fan_stages: {
//     type: [Number], // array of 6 numbers
//     validate: {
//       validator: function (arr) {
//         return arr.length === 6;
//       },
//       message: "fan_stages must contain exactly 6 values",
//     },
//     required: true,
//   },
// });

// module.exports = mongoose.model("Crop", cropSchema);



//!Version 2

const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  crop_name: { type: String, required: true, unique: true },

  temperature: { type: Number, required: true },

  humidity: { type: Number, required: true },

  // NEW: preset tier (from V2)
  tier: {
    type: String,
    enum: ["free", "locked"],
    default: "locked",
  },

  // Fan stage array — must have exactly 6 numbers (from V1)
  fan_stages: {
    type: [Number],
    validate: {
      validator: function (arr) {
        return arr.length === 6;
      },
      message: "fan_stages must contain exactly 6 values",
    },
    required: true,
  },
});

module.exports = mongoose.model("Crop", cropSchema);

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     location: { type: String },
//     role: { type: String, enum: ["user", "admin"], default: "user" },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);



// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     location: {
//       state: { type: String, required: true },
//       city: { type: String, required: true },
//     },
//     role: { type: String, enum: ["user", "admin"], default: "user" },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//     devices: [{ type: String }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);





const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    location: {
      state: { type: String, required: true },
      city: { type: String, required: true },
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    devices: [{ type: String }],

    // NEW FIELD — Track user activity
    lastActive: { type: Date, default: null },

    // NEW FIELD — Preset access system
    accessiblePresets: [
      {
        preset: { type: mongoose.Schema.Types.ObjectId, ref: "Crop" },
        assignedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

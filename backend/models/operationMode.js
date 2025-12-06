// models/operationMode.js
const mongoose = require("mongoose");

const operationModeSchema = new mongoose.Schema(
  {
    device_name: { type: String, required: true, unique: true },
    operation_mode: { type: Number, enum: [0, 1], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OperationMode", operationModeSchema);

const mongoose = require("mongoose");

const FirmwareSchema = new mongoose.Schema({
  deviceName: { type: String, required: true, unique: true },
  version: { type: String, required: true },
  size: { type: Number, required: true },
  md5: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  fileId: { type: mongoose.Types.ObjectId, required: true },
});

module.exports = mongoose.model("Firmware", FirmwareSchema);

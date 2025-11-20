const mongoose = require("mongoose");

const deviceMetadataSchema = new mongoose.Schema(
  {
    device_name: { type: String, required: true, unique: true },

    // Status: true = active, false = inactive
    active: { type: Boolean, default: true },

    // Subscription timestamps
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },

    // Days remaining (optional, can be derived from subscriptionEnd)
    daysRemaining: { type: Number },

    // Last time device contacted server (you can update this from saveData)
    lastActive: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeviceMetadata", deviceMetadataSchema);

// controllers/operationModeController.js
const OperationMode = require("../models/operationMode");

exports.getOperationMode = async (req, res) => {
  try {
    const { device_name } = req.query; // <-- query string

    if (!device_name) {
      return res.status(400).json({ error: "device_name query parameter is required" });
    }

    const mode = await OperationMode.findOne({ device_name });

    if (!mode) {
      return res
        .status(404)
        .json({ error: `No operation mode found for device: ${device_name}` });
    }

    res.json({
      device_name: mode.device_name,
      operation_mode: mode.operation_mode,
    });
  } catch (err) {
    console.error("❌ Error fetching operation mode:", err);
    res.status(500).json({ error: "Error fetching operation mode" });
  }
};

// ✅ Set operation mode for a device (0 = manual, 1 = wifi)
exports.setOperationMode = async (req, res) => {
  try {
    const { deviceName } = req.params;
    const { operation_mode } = req.body;

    if (operation_mode === undefined) {
      return res
        .status(400)
        .json({ error: "operation_mode is required in the request body" });
    }

    if (![0, 1].includes(operation_mode)) {
      return res
        .status(400)
        .json({
          error: "Invalid operation_mode. Must be 0 (manual) or 1 (wifi)",
        });
    }

    // Upsert (insert if not exists, update if exists)
    const mode = await OperationMode.findOneAndUpdate(
      { device_name: deviceName },
      { operation_mode },
      { new: true, upsert: true }
    );

    res.json({
      message: "Operation mode updated successfully",
      device_name: mode.device_name,
      operation_mode: mode.operation_mode,
    });

    console.log(
      `🔄 Operation mode updated: ${deviceName} → ${
        operation_mode === 1 ? "WiFi" : "Manual"
      }`
    );
  } catch (err) {
    console.error("❌ Error setting operation mode:", err);
    res.status(500).json({ error: "Error setting operation mode" });
  }
};

const express = require("express");
const {
  getDeviceConfig,
  configureDevice,
  getDeviceHistory,
} = require("../controllers/deviceConfigController");

const router = express.Router();

router.get("/:deviceName", getDeviceConfig);
router.post("/:deviceName/configure", configureDevice);
router.get("/:deviceName/history", getDeviceHistory);

module.exports = router;

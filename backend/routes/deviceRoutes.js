const express = require("express");
const router = express.Router();
const {
  testServer,
  saveData,
  getRecentByDevice,
  getLatestThreshold,
  getFanStages,
  getMetadata,
  getMetadataBatch,
  updateMetadata,
} = require("../controllers/deviceController");

router.get("/", testServer);
router.post("/iotdata", saveData);

// ✅ Put fixed routes first
router.get("/latest_threshold", getLatestThreshold);
router.get("/fan_stages", getFanStages);

// ❗ Keep dynamic routes after
router.get("/:deviceName/recent", getRecentByDevice);

router.get("/metadata/:deviceName", getMetadata);
router.get("/metadata", getMetadataBatch);
router.patch("/metadata/:deviceName", updateMetadata);

module.exports = router;

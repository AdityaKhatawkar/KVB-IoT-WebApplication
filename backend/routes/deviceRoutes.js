const express = require("express");
const router = express.Router();

const {
  testServer,
  saveData,
  getRecentByDevice,
  getLogsByDevice, // ⭐ NEW CONTROLLER
  getLatestThreshold,
  getFanStages,
  getMetadata,
  getMetadataBatch,
  updateMetadata,
} = require("../controllers/deviceController");

// Test + Data ingestion
router.get("/", testServer);
router.post("/iotdata", saveData);

// Fixed (non-dynamic) routes
router.get("/latest_threshold", getLatestThreshold);
router.get("/fan_stages", getFanStages);

// Metadata routes
router.get("/metadata/:deviceName", getMetadata);
router.get("/metadata", getMetadataBatch);
router.patch("/metadata/:deviceName", updateMetadata);

// ⭐ New Logs route (must come BEFORE /:deviceName/recent)
router.get("/:deviceName/logs", getLogsByDevice);

// Recent last 5 readings (live)
router.get("/:deviceName/recent", getRecentByDevice);

module.exports = router;

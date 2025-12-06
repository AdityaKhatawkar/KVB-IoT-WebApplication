// routes/operationModeRoutes.js
const express = require("express");
const router = express.Router();
const {
  getOperationMode,
  setOperationMode,
} = require("../controllers/operationModeController");

// Routes
// router.get("/:deviceName", getOperationMode); // GET  /api/operation-mode/KVB3
router.get("/", getOperationMode); // GET  /api/operation-mode?device_name=KVB3
router.post("/:deviceName/set", setOperationMode); // POST /api/operation-mode/KVB3/set

module.exports = router;

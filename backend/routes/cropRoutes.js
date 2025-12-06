// const express = require("express");
// const multer = require("multer");
// const { uploadCrops, getCrops } = require("../controllers/cropController");

// const router = express.Router();

// // Multer setup: store file in memory
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Upload crops JSON
// router.post("/upload", upload.single("file"), uploadCrops);

// // Get all crops
// router.get("/", getCrops);

// module.exports = router;



const express = require("express");
const multer = require("multer");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  uploadCrops,
  getCrops,
  updatePresetTier,
  updateCrop,
} = require("../controllers/cropController");

const router = express.Router();

// Multer setup: file stored in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload crops JSON (admin only)
router.post("/upload", protect, adminOnly, upload.single("file"), uploadCrops);

// Update preset tier (admin only)
router.patch("/:presetId/tier", protect, adminOnly, updatePresetTier);

// Update crop fields (admin only)
router.patch("/:presetId", protect, adminOnly, updateCrop);

// Get all crops (supports filtering by userId)
router.get("/", getCrops);

module.exports = router;

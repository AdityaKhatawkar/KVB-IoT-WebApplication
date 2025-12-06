// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const FirmwareManager = require("../utils/firmware-manager");
// const { protect, authorizeAdmin } = require("../middleware/authMiddleware");

// const router = express.Router();
// const firmwareManager = new FirmwareManager(
//   path.join(__dirname, "../firmware")
// );

// // Configure multer
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // increased limit to 10MB
//   fileFilter: (req, file, cb) => {
//     if (file.originalname.endsWith(".bin")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only .bin files are allowed"), false);
//     }
//   },
// });

// // ✅ Admin-only: Upload firmware
// router.post(
//   "/upload",
//   protect,
//   authorizeAdmin,
//   upload.single("firmware"),
//   (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: "No firmware file provided",
//         });
//       }

//       const version = req.body.version || `1.0.${Date.now()}`;
//       const firmwareInfo = firmwareManager.uploadFirmware(
//         req.file.buffer,
//         version
//       );

//       res.json({
//         success: true,
//         message: "Firmware uploaded successfully",
//         firmware: firmwareInfo,
//       });
//     } catch (error) {
//       console.error("Error uploading firmware:", error);
//       res.status(500).json({
//         success: false,
//         message: "Error uploading firmware",
//       });
//     }
//   }
// );

// // Public: Get firmware info
// // router.get("/info", (req, res) => {
// //   const firmwareInfo = firmwareManager.getFirmwareInfo();
// //   if (!firmwareInfo) {
// //     return res
// //       .status(404)
// //       .json({ available: false, message: "No firmware available" });
// //   }
// //   res.json({ available: true, ...firmwareInfo });
// // });

// // In routes/firmwareRoutes.js - Update the /info endpoint
// router.get("/info", (req, res) => {
//   try {
//     const firmwarePath = path.join(__dirname, "../firmware/firmware.bin");
    
//     // Check if firmware file exists
//     if (!fs.existsSync(firmwarePath)) {
//       return res.status(404).json({ 
//         message: "No firmware available",
//         update_available: false
//       });
//     }

//     const stats = fs.statSync(firmwarePath);
    
//     // Use a simple version number that matches your ESP32 code
//     const firmwareVersion = "1.2.0"; // Change this when you upload new firmware

//     res.json({
//       message: "Firmware update available",
//       update_available: true,
//       current_version: "1.3.0", // This should match what ESP32 reports
//       new_version: firmwareVersion,
//       file_size: stats.size,
//       url: `${req.protocol}://${req.get('host')}/api/firmware/download`
//     });
//   } catch (error) {
//     console.error("Firmware info error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// // Public: Download firmware
// router.get("/download", (req, res) => {
//   const firmwarePath = path.join(__dirname, "../firmware/firmware.bin");
//   if (!fs.existsSync(firmwarePath)) {
//     return res
//       .status(404)
//       .json({ success: false, message: "No firmware file found" });
//   }
//   res.download(firmwarePath, "firmware.bin");
//   console.log("Firmware download initiated✅");
// });

// module.exports = router;



const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const Firmware = require("../models/Firmware");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getGridFSBucket } = require("../utils/gridfs");

const router = express.Router();

// Use memory storage only
const upload = multer({ storage: multer.memoryStorage() });

// ------------------------------
// Upload Firmware (MongoDB Only)
// ------------------------------
router.post(
  "/upload/:deviceName",
  protect,
  adminOnly,
  upload.single("firmware"),
  async (req, res) => {
    try {
      const { deviceName } = req.params;
      const version = req.body.version;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No firmware file provided" });
      }
      if (!version) {
        return res
          .status(400)
          .json({ success: false, message: "Version is required" });
      }

      const bucket = getGridFSBucket();
      if (!bucket)
        return res.status(500).json({ message: "GridFS not initialized" });

      // Upload to GridFS
      const uploadStream = bucket.openUploadStream(
        `${deviceName}_firmware.bin`
      );
      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        const fileId = uploadStream.id;

        const md5 = crypto
          .createHash("md5")
          .update(req.file.buffer)
          .digest("hex");

        const firmwareData = await Firmware.findOneAndUpdate(
          { deviceName },
          {
            deviceName,
            version,
            size: req.file.size,
            md5,
            fileId: fileId,
          },
          { upsert: true, new: true }
        );

        res.json({
          success: true,
          message: `Firmware uploaded for ${deviceName}`,
          firmware: firmwareData,
        });
      });

      uploadStream.on("error", (err) => {
        console.error("Upload error:", err);
        res.status(500).json({ success: false, message: "Upload failed" });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ------------------------------
// Get Firmware Info
// ------------------------------
router.get("/info/:deviceName", async (req, res) => {
  try {
    const { deviceName } = req.params;

    const firmware = await Firmware.findOne({ deviceName });
    if (!firmware) {
      return res.json({
        message: "No firmware found",
        update_available: false,
      });
    }

    res.json({
      message: "Firmware info retrieved",
      update_available: true,
      device: deviceName,
      new_version: firmware.version,
      file_size: firmware.size,
      url: `${req.protocol}://${req.get(
        "host"
      )}/api/firmware/download/${deviceName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// Download Firmware (GridFS)
// ------------------------------
router.get("/download/:deviceName", async (req, res) => {
  try {
    const { deviceName } = req.params;

    const firmware = await Firmware.findOne({ deviceName });
    if (!firmware) {
      return res.status(404).json({ message: "Firmware not found" });
    }

    const bucket = getGridFSBucket();
    if (!bucket)
      return res.status(500).json({ message: "GridFS not initialized" });

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${deviceName}_firmware.bin"`,
    });

    bucket.openDownloadStream(firmware.fileId).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

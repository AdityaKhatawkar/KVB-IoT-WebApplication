const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

router.get("/states", locationController.states);
router.get("/cities/:stateName", locationController.cities);


module.exports = router;
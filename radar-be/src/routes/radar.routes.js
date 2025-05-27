const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const radarController = require("../controllers/radar.controller");
const configController = require("../controllers/config.controller");

router.post("/scan", radarController.handleRadarData);
router.get("/history", radarController.getHistory);
router.get("/intrusions", radarController.getIntrusions);
router.get("/live", radarController.getLiveData);
router.get("/stats", radarController.getStats);

router.post("/config", configController.saveConfig);
router.get("/config", configController.getConfig);

module.exports = router;
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config.json");

const radarService = require("../services/radar.service");

exports.handleRadarData = async (req, res) => {
  try {
    const result = await radarService.processRadarScan(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { limit = 100, radarId } = req.query;
    const history = await radarService.getRadarHistory(limit, radarId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.getIntrusions = async (req, res) => {
    try {
      const { radarId } = req.query;
      const intrusions = await radarService.getIntrusions(radarId);
      res.json(intrusions);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch intrusions" });
    }
};

exports.getLiveData = async (req, res) => {
  try {
    const data = await radarService.getCurrentReadings();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to get live data" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await radarService.getSystemStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
};
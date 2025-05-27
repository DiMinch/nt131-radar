const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config.json");

function getConfigValue(key, fallback) {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config[key] !== undefined) return config[key];
    }
  } catch (err) {
    console.error("Error reading config:", err);
  }
  return process.env[key] || fallback;
}

function getConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (err) {
    console.error("Error reading config:", err);
  }
  return {};
}

function saveConfig({ MASTER_NODE_URL, SLAVE_NODE_URL, DANGER_THRESHOLD }) {
  try {
    let config = getConfig();
    if (MASTER_NODE_URL) config.MASTER_NODE_URL = MASTER_NODE_URL;
    if (SLAVE_NODE_URL) config.SLAVE_NODE_URL = SLAVE_NODE_URL;
    if (DANGER_THRESHOLD !== undefined) {
      config.DANGER_THRESHOLD = Number(DANGER_THRESHOLD);
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Config saved:", config);
    return config;
  } catch (err) {
    console.error("Error saving config:", err);
    throw err;
  }
}

module.exports = {
  getConfig,
  saveConfig,
  getConfigValue
};
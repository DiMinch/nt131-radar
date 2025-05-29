const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config.json");

exports.getConfigValue = async (key, fallback) => {
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

exports.getConfig = async () => {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (err) {
    console.error("Error reading config:", err);
  }
  return {};
}

function normalizeUrl(ip) {
  if (!ip) return "";
  if (!/^https?:\/\//.test(ip)) return "http://" + ip;
  return ip;
}

exports.saveConfig = async ({ MASTER_NODE_URL, SLAVE_NODE_URL, DANGER_THRESHOLD }) => {
  try {
    let config = await exports.getConfig();
    if (MASTER_NODE_URL) config.MASTER_NODE_URL = normalizeUrl(MASTER_NODE_URL);
    if (SLAVE_NODE_URL) config.SLAVE_NODE_URL = normalizeUrl(SLAVE_NODE_URL);
    if (DANGER_THRESHOLD !== undefined) {
      config.DANGER_THRESHOLD = Number(DANGER_THRESHOLD);
    }
    if (ALERT_EMAIL) config.ALERT_EMAIL = ALERT_EMAIL;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Config saved:", config);

    if (config.MASTER_NODE_URL && config.SLAVE_NODE_URL) {
      try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const url = `${config.MASTER_NODE_URL}/setNode2IP`;
        const body = JSON.stringify({ ip: config.SLAVE_NODE_URL.replace(/^https?:\/\//, "") });
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        });
        console.log("Updated node2_host on master:", config.SLAVE_NODE_URL);
      } catch (err) {
        console.error("Failed to update node2_host on master:", err.message);
      }
    }

    return config;
  } catch (err) {
    console.error("Error saving config:", err);
    throw err;
  }
}
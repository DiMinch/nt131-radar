const db = require("../config/firebase"); 
const ws = require("../ws");
const sendAlertMail = require("../utils/mailer");
const { getConfigValue } = require("./config.service");

exports.processRadarScan = async ({ angle, distance, radarId, timestamp }) => {
  const DANGER_THRESHOLD = Number(getConfigValue("DANGER_THRESHOLD", 50));
  const isIntrusion = distance < DANGER_THRESHOLD;

  const scanData = {
    angle,
    distance,
    timestamp: timestamp || new Date().toISOString(),
    radarId,
    isIntrusion,
  };

  ws.broadcast(scanData);

  await db.collection("radar_scans").add(scanData);

  if (isIntrusion) {
    await db.collection("intrusion_logs").add(scanData);
    await sendAlertMail(scanData);
  }

  return {
    message: "Scan received",
    isIntrusion,
  };
};

exports.getRadarHistory = async (limit = 100, radarId) => {
  let query = db.collection("radar_scans").orderBy("timestamp", "desc").limit(Number(limit));
  if (radarId) query = query.where("radarId", "==", radarId);
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

exports.getIntrusions = async (radarId) => {
  let query = db.collection("intrusion_logs");
  if (radarId) query = query.where("radarId", "==", radarId).orderBy("timestamp", "desc").limit(100);
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

exports.getCurrentReadings = async () => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const timeout = 2000;

    const fetchWithTimeout = async (url) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return await res.json();
      } catch (e) {
        clearTimeout(id);
        return null;
      }
    };

    const masterUrl = getConfigValue("MASTER_NODE_URL", "http://localhost:3001") + "/data";
    const slaveUrl = getConfigValue("SLAVE_NODE_URL", "http://localhost:3001") + "/data";
    const masterData = await fetchWithTimeout(masterUrl);
    const slaveData = await fetchWithTimeout(slaveUrl);

    // --- NEW: Xử lý intrusion và broadcast ---
    const DANGER_THRESHOLD = Number(getConfigValue("DANGER_THRESHOLD", 50));
    const now = new Date().toISOString();

    // Helper để xử lý và lưu intrusion
    async function handleScan(data, radarId) {
      if (!data) return null;
      const scanData = {
        angle: data.angle,
        distance: data.distance,
        timestamp: now,
        radarId,
        isIntrusion: data.distance < DANGER_THRESHOLD
      };
      ws.broadcast(scanData);
      await db.collection("radar_scans").add(scanData);
      if (scanData.isIntrusion) {
        await db.collection("intrusion_logs").add(scanData);
        await sendAlertMail(scanData);
      }
      return scanData;
    }

    const masterScan = await handleScan(masterData, "master");
    const slaveScan = await handleScan(slaveData, "slave");

    return { master: masterScan, slave: slaveScan };
  } catch (e) {
    return { master: null, slave: null };
  }
};

exports.getSystemStats = async () => {
  const scansSnapshot = await db.collection("radar_scans").get();
  const intrusionsSnapshot = await db.collection("intrusion_logs").get();
  return {
    totalScans: scansSnapshot.size,
    totalIntrusions: intrusionsSnapshot.size
  };
};
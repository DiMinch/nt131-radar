const db = require("../config/firebase"); 
const ws = require("../ws");
const sendAlertMail = require("../utils/mailer");
const { getConfigValue } = require("./config.service");

let lastIntrusionState = { master: false, slave: false };

exports.processRadarScan = async ({ angle, distance, radarId, timestamp }) => {
  const DANGER_THRESHOLD = Number(await getConfigValue("DANGER_THRESHOLD", 50));
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

  if (scanData.isIntrusion && !lastIntrusionState[radarId]) {
    await db.collection("intrusion_logs").add(scanData);
    await sendAlertMail(scanData);
  }
  lastIntrusionState[radarId] = scanData.isIntrusion;
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
    const timeout = 4000;

    const fetchWithTimeout = async (url) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        const text = await res.text();
        console.log("Fetch", url, "->", text.slice(0, 100));
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("JSON parse error:", e.message);
          return null;
        }
      } catch (e) {
        clearTimeout(id);
        console.error("Fetch error:", url, e.message);
        return null;
      }
    };

    const masterUrl = (await getConfigValue("MASTER_NODE_URL", "http://localhost:3001")) + "/data";    
    const masterData = await fetchWithTimeout(masterUrl);

    const DANGER_THRESHOLD = Number(await getConfigValue("DANGER_THRESHOLD", 50));
    const now = new Date().toISOString();

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
      if (scanData.isIntrusion && !lastIntrusionState[radarId]) {
        await db.collection("intrusion_logs").add(scanData);
        await sendAlertMail(scanData);
      }
      lastIntrusionState[radarId] = scanData.isIntrusion;
      return scanData;
    }

    let masterScan = null, slaveScan = null;
    if (masterData && masterData.master && masterData.slave) {
      masterScan = await handleScan(masterData.master, "master");
      slaveScan = await handleScan(masterData.slave, "slave");
    }

    return { master: masterScan, slave: slaveScan };
  } catch (e) {
    return { master: null, slave: null };
  }
};

let statsCache = { data: null, ts: 0 };
exports.getSystemStats = async () => {
  const now = Date.now();
  if (statsCache.data && now - statsCache.ts < 10000) return statsCache.data;
  const scansSnapshot = await db.collection("radar_scans").get();
  const intrusionsSnapshot = await db.collection("intrusion_logs").get();
  statsCache = {
    data: {
      totalScans: scansSnapshot.size,
      totalIntrusions: intrusionsSnapshot.size
    },
    ts: now
  };
  return statsCache.data;
};
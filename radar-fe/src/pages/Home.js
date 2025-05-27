import React, { useEffect, useState, useRef } from "react";
import StatsPanel from "../components/StatsPanel";
import NodeStatus from "../components/NodeStatus";
import RadarChart from "../components/RadarChart";
import IntrusionAlert from "../components/IntrusionAlert";
import IntrusionList from "../components/IntrusionList";
import ConfigPanel from "../components/ConfigPanel";

export default function Home() {
  const [masterPoints, setMasterPoints] = useState([]);
  const [slavePoints, setSlavePoints] = useState([]);
  const [threshold, setThreshold] = useState(50);
  const [sweep, setSweep] = useState(0);
  const wsRef = useRef();

  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8080";
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.radarId === "master") {
        setMasterPoints((prev) => [
          ...prev.filter((p) => p.angle !== data.angle),
          data,
        ]);
      } else if (data.radarId === "slave") {
        setSlavePoints((prev) => [
          ...prev.filter((p) => p.angle !== data.angle),
          data,
        ]);
      }
    };
    return () => wsRef.current.close();
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/radar/config`)
      .then(res => res.json())
      .then(cfg => setThreshold(cfg.DANGER_THRESHOLD || 50));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSweep((s) => (s + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const reloadThreshold = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/radar/config`)
      .then(res => res.json())
      .then(cfg => setThreshold(cfg.DANGER_THRESHOLD || 50))
      .catch(() => setThreshold(50));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #001f1f 60%, #000 100%)",
        color: "#00ffcc",
        fontFamily: "Orbitron, monospace",
        textAlign: "center",
        paddingTop: 40,
      }}
    >
      <IntrusionAlert />
      <h1 style={{ fontSize: 48, letterSpacing: 2, textShadow: "0 0 20px #00ffcc" }}>
        RADAR MONITORING
      </h1>
      <StatsPanel />
      <ConfigPanel onConfigSaved={reloadThreshold} />
      <NodeStatus />
      <div style={{display:"flex", justifyContent:"center", gap:40, margin:"40px 0"}}>
        <div>
          <h2 style={{color:"#00ffcc"}}>Node Master</h2>
          <RadarChart data={masterPoints} sweepAngle={sweep} threshold={threshold} />
          </div>
        <div>
          <h2 style={{color:"#00ffcc"}}>Node Slave</h2>
          <RadarChart data={slavePoints} sweepAngle={sweep} threshold={threshold} />
          </div>
      </div>
      <IntrusionList />
    </div>
  );
}
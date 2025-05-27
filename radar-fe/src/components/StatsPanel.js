import React, { useEffect, useState } from "react";

export default function StatsPanel() {
  const [stats, setStats] = useState({ totalScans: 0, totalIntrusions: 0 });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/radar/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats({ totalScans: 0, totalIntrusions: 0 }));
  }, []);

  return (
    <div style={{
      margin: "32px auto 0 auto",
      background: "#002828cc",
      borderRadius: 16,
      padding: 24,
      maxWidth: 400,
      boxShadow: "0 0 20px #00ffcc44",
      color: "#00ffcc",
      fontSize: 20,
      letterSpacing: 1
    }}>
      <div>🛰️ Total of Scanning: <b>{stats.totalScans}</b></div>
      <div>🚨 Total of Intrusion: <b style={{color:"#ff0033"}}>{stats.totalIntrusions}</b></div>
    </div>
  );
}
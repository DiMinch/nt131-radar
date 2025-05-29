import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function IntrusionTrendChart() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("day");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/radar/intrusions`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  const groupMap = {};
  data.forEach(item => {
    let key = "";
    let dateObj;
    if (typeof item.timestamp === "string" && item.timestamp.includes("T")) {
      dateObj = new Date(item.timestamp);
    } else if (!isNaN(Number(item.timestamp))) {
      dateObj = new Date(Number(item.timestamp));
    }
    if (mode === "hour" && dateObj) key = `${dateObj.getHours()}:00`;
    else if (mode === "day" && dateObj) key = dateObj.toISOString().slice(0,10);
    else if (mode === "month" && dateObj) key = dateObj.toISOString().slice(0,7);
    else if (mode === "year" && dateObj) key = dateObj.toISOString().slice(0,4);
    if (key) groupMap[key] = (groupMap[key]||0)+1;
  });
  const labels = Object.keys(groupMap).sort();
  const counts = labels.map(d=>groupMap[d]);

  return (
    <div style={{
      background:"#002828cc",
      borderRadius:16,
      padding:24,
      maxWidth:600,
      margin:"32px auto"
    }}>
      <div style={{display:"flex", alignItems:"center", marginBottom:8}}>
        <h2 style={{color:"#ff0033", flex:1}}>Intrusion Trend</h2>
        <select
          value={mode}
          onChange={e=>setMode(e.target.value)}
          style={{
            marginLeft:8,
            padding:"6px 12px",
            borderRadius:8,
            border:"1px solid #00ffcc",
            background:"#001f1f",
            color:"#00ffcc",
            fontWeight:"bold",
            outline:"none",
            fontFamily:"Orbitron, monospace"
          }}
        >
          <option value="hour">By hour</option>
          <option value="day">By day</option>
          <option value="month">By month</option>
          <option value="year">By year</option>
        </select>
      </div>
      <Line
        data={{
          labels,
          datasets: [{
            label: "Intrusion",
            data: counts,
            fill: true,
            backgroundColor: "rgba(255,0,51,0.2)",
            borderColor: "#ff0033",
            pointBackgroundColor: "#ff0033"
          }]
        }}
        options={{
          responsive: true,
          aspectRatio: 2,
          maintainAspectRatio: true,
          scales: { x: { ticks: { color: "#ff0033" } }, y: { ticks: { color: "#ff0033" } } },
          plugins: { legend: { labels: { color: "#ff0033" } } }
        }}
      />
    </div>
  );
}
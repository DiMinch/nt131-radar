import React, { useEffect, useRef, useState } from "react";

export default function RadarHeatmap() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("all");
  const canvasRef = useRef();

  useEffect(() => {
    fetch("http://localhost:8080/api/radar/history?limit=1000")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  // Gom nhóm theo thời gian
  let filtered = data;
  if (mode !== "all") {
    const now = new Date();
    filtered = data.filter(item => {
      let dateObj;
      if (typeof item.timestamp === "string" && item.timestamp.includes("T")) {
        dateObj = new Date(item.timestamp);
      } else if (!isNaN(Number(item.timestamp))) {
        dateObj = new Date(Number(item.timestamp));
      }
      if (!dateObj) return false;
      if (mode === "hour") return dateObj.getHours() === now.getHours() && dateObj.toDateString() === now.toDateString();
      if (mode === "day") return dateObj.toDateString() === now.toDateString();
      if (mode === "month") return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
      if (mode === "year") return dateObj.getFullYear() === now.getFullYear();
      return true;
    });
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0,0,400,400);
    ctx.save();
    ctx.translate(200,200);

    // Tạo ma trận heatmap
    const angleStep = 10;
    const distStep = 20;
    const heat = Array(18).fill(0).map(()=>Array(10).fill(0));
    filtered.forEach(item => {
      const a = Math.floor(item.angle/angleStep);
      const d = Math.floor(item.distance/distStep);
      if(a>=0 && a<18 && d>=0 && d<10) heat[a][d]++;
    });

    // Vẽ heatmap
    for(let a=0;a<18;a++) {
      for(let d=0;d<10;d++) {
        const count = heat[a][d];
        if(count===0) continue;
        const angle = (a*angleStep-90)*Math.PI/180;
        const r = (d+1)*20;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.arc(r,0,8,0,2*Math.PI);
        ctx.fillStyle = `rgba(255,0,51,${Math.min(count/10,0.8)})`;
        ctx.shadowColor = "#ff0033";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }, [filtered]);

  return (
    <div style={{background:"#002828cc", borderRadius:16, padding:24, maxWidth:500, margin:"32px auto"}}>
      <div style={{display:"flex", alignItems:"center", marginBottom:8}}>
        <h2 style={{color:"#ff0033", flex:1}}>Heatmap</h2>
        <select
          value={mode}
          onChange={e=>setMode(e.target.value)}
          style={{
            marginLeft:8,
            padding:"6px 12px",
            borderRadius:8,
            border:"1px solid #00ffcc",
            background:"#111",
            color:"#00ffcc",
            fontWeight:"bold",
            outline:"none",
            fontFamily:"Orbitron, monospace"
          }}
        >
          <option value="all">All time</option>
          <option value="hour">This hour</option>
          <option value="day">Today</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>
      <canvas ref={canvasRef} width={400} height={400} style={{background:"#111", borderRadius:"50%"}} />
    </div>
  );
}
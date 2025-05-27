import React, { useEffect, useState } from "react";

export default function ConfigPanel({ onConfigSaved }) {
  const [master, setMaster] = useState("");
  const [slave, setSlave] = useState("");
  const [threshold, setThreshold] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/radar/config")
      .then(res => res.json())
      .then(cfg => {
        setMaster(cfg.MASTER_NODE_URL || "");
        setSlave(cfg.SLAVE_NODE_URL || "");
        setThreshold(cfg.DANGER_THRESHOLD || 50);
      });
  }, []);

  const handleSave = async () => {
    const res = await fetch("http://localhost:8080/api/radar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MASTER_NODE_URL: master,
          SLAVE_NODE_URL: slave,
          DANGER_THRESHOLD: threshold
        })
      });
      if (res.ok) {
        setMsg("Đã lưu cấu hình!");
        if (onConfigSaved) onConfigSaved();
        setTimeout(() => setMsg(""), 2000);
      }
      else setMsg("Lỗi lưu cấu hình!");
      setTimeout(() => setMsg(""), 2000);
    };

  return (
    <div style={{
      margin: "32px auto",
      background: "#002828cc",
      borderRadius: 16,
      padding: 24,
      maxWidth: 400,
      boxShadow: "0 0 20px #00ffcc44",
      color: "#00ffcc",
      fontSize: 18
    }}>
      <h2 style={{color:"#00ffcc"}}>System Config</h2>
      <div style={{marginBottom:12}}>
        <label>Master Node IP: </label>
        <input
            value={master}
            onChange={e=>setMaster(e.target.value)}
            style={{
                width:"100%",
                padding:"8px",
                borderRadius:"8px",
                border:"1px solid #00ffcc",
                background:"#001f1f",
                color:"#00ffcc",
                marginTop:"4px",
                marginBottom:"8px",
                fontFamily:"Orbitron, monospace"
            }}
        />
      </div>
      <div style={{marginBottom:12}}>
        <label>Slave Node IP: </label>
        <input
            value={slave}
            onChange={e=>setSlave(e.target.value)}
            style={{
                width:"100%",
                padding:"8px",
                borderRadius:"8px",
                border:"1px solid #00ffcc",
                background:"#001f1f",
                color:"#00ffcc",
                marginTop:"4px",
                marginBottom:"8px",
                fontFamily:"Orbitron, monospace"
            }}
        />
      </div>
      <div style={{marginBottom:12}}>
        <label>Threshold (cm): </label>
        <input
            value={threshold}
            onChange={e=>setThreshold(e.target.value)}
            style={{
                width:"100%",
                padding:"8px",
                borderRadius:"8px",
                border:"1px solid #00ffcc",
                background:"#001f1f",
                color:"#00ffcc",
                marginTop:"4px",
                marginBottom:"8px",
                fontFamily:"Orbitron, monospace"
            }}
        />
      </div>
        <button
            onClick={handleSave}
            style={{
            background:"#00ffcc",
            color:"#001f1f",
            fontWeight:"bold",
            borderRadius:8,
            border:"none",
            padding:"8px 24px",
            cursor: "pointer",
            transition: "background 0.2s"
            }}
            onMouseOver={e => e.target.style.background = "#00e6b8"}
            onMouseOut={e => e.target.style.background = "#00ffcc"}
        >
            Save Config
        </button>
      <div style={{marginTop:8, color:"#ff0033"}}>{msg}</div>
    </div>
  );
}
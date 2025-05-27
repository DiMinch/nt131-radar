import React, { useEffect, useState } from "react";

export default function IntrusionList() {
  const [intrusions, setIntrusions] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "master", "slave"

  useEffect(() => {
    const fetchData = () => {
      const url = filter === "all" 
        ? `${process.env.REACT_APP_API_URL}/api/radar/intrusions`
        : `${process.env.REACT_APP_API_URL}/api/radar/intrusions?radarId=${filter}`;

      fetch(url)
        .then((res) => res.json())
        .then(setIntrusions)
        .catch(() => setIntrusions([]));
    };
  
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [filter]); // Thêm filter vào dependencies

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    let dateObj;
    if (typeof timestamp === "string" && timestamp.includes("T")) {
      dateObj = new Date(timestamp);
    } else if (!isNaN(Number(timestamp))) {
      dateObj = new Date(Number(timestamp));
    }
    return dateObj ? dateObj.toLocaleString() : "";
  };

  return (
    <div style={{
      margin: "32px auto",
      background: "#330000cc",
      borderRadius: 16,
      padding: 24,
      maxWidth: 1000,
      boxShadow: "0 0 20px #ff003344"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16
      }}>
        <h2 style={{
          color:"#ff0033",
          fontSize: 24,
          textShadow: "0 0 10px #ff003366"
        }}>🚨 Intrusion Log</h2>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ff0033",
            background: "#330000",
            color: "#ff0033",
            fontWeight: "bold",
            outline: "none",
            fontFamily: "Orbitron, monospace"
          }}
        >
          <option value="all">All Nodes</option>
          <option value="master">Master Only</option>
          <option value="slave">Slave Only</option>
        </select>
      </div>

      {/* Custom scrollbar container */}
      <div style={{
        maxHeight: 300,
        overflowY: "auto",
        padding: "4px 8px",
        marginRight: -8,
        scrollbarWidth: "thin",
        scrollbarColor: "#ff0033 #330000"
      }}>
        {intrusions.length === 0 ? (
          <div style={{
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ff0033",
            fontSize: 18,
            opacity: 0.8
          }}>
            No intrusion was found
          </div>
        ) : (
          intrusions.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                background: "#440000aa",
                margin: "8px 0",
                padding: "12px 16px",
                borderRadius: 8,
                color: "#ff6666",
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: 16,
                alignItems: "center",
                transition: "transform 0.2s",
                cursor: "default",
                boxShadow: "0 2px 4px #00000044"
              }}
            >
              <span style={{fontFamily: "monospace"}}>{formatTime(item.timestamp)}</span>
              <span>Node: <b style={{color: "#ff0033"}}>{item.radarId}</b></span>
              <span>Angle: <b style={{color: "#ff0033"}}>{item.angle}°</b></span>
              <span>Distance: <b style={{color: "#ff0033"}}>{item.distance} cm</b></span>
            </div>
          ))
        )}
      </div>

      <div style={{
        marginTop: 16,
        fontSize: 14,
        color: "#ff003366",
        textAlign: "center"
      }}>
        Auto-refreshes every 10 seconds
      </div>
    </div>
  );
}
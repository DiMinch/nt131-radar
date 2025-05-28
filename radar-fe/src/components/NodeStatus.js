import React, { useEffect, useState } from "react";

export default function NodeStatus() {
  const [status, setStatus] = useState({ master: null, slave: null });

  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${process.env.REACT_APP_API_URL}/api/radar/live`)
        .then((res) => res.json())
        .then(setStatus)
        .catch(() => setStatus({ master: null, slave: null }));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 300);
    return () => clearInterval(interval);
  }, []);

  const renderNode = (node, label) => (
    <div style={{
      background: "#003333cc",
      borderRadius: 12,
      padding: 16,
      margin: 8,
      minWidth: 180,
      display: "inline-block"
    }}>
      <div style={{fontWeight:"bold", fontSize:18}}>{label}</div>
      {node ? (
        <>
          <div>Angle: <b>{node.angle}°</b></div>
          <div>Distance: <b>{node.distance} cm</b></div>
          <div style={{color:"#00ff66"}}>Status: Active</div>
        </>
      ) : (
        <div style={{color:"#ff0033"}}>Not connected</div>
      )}
    </div>
  );

  return (
    <div style={{margin:"32px auto", textAlign:"center"}}>
      <h2 style={{color:"#00ffcc"}}>Node status</h2>
      {renderNode(status.master, "Node Master")}
      {renderNode(status.slave, "Node Slave")}
    </div>
  );
}
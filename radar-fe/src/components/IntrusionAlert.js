import React, { useEffect, useState } from "react";

export default function IntrusionAlert() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.isIntrusion) {
        setShow(true);
        setTimeout(() => setShow(false), 3000);
      }
    };
    return () => ws.close();
  }, []);

  if (!show) return null;
  return (
    <div style={{
      position:"fixed", top:40, right:40, zIndex:1000,
      background:"#ff0033", color:"#fff", fontWeight:"bold",
      fontSize:28, padding:"24px 40px", borderRadius:16,
      boxShadow:"0 0 40px #ff0033aa", animation:"shake 0.5s"
    }}>
      🚨 INTRUSION ALERT!
      <style>
        {`@keyframes shake {
          0% { transform: translateX(0);}
          20% { transform: translateX(-10px);}
          40% { transform: translateX(10px);}
          60% { transform: translateX(-10px);}
          80% { transform: translateX(10px);}
          100% { transform: translateX(0);}
        }`}
      </style>
    </div>
  );
}
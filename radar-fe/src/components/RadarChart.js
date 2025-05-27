import React, { useRef, useEffect } from "react";

export default function RadarChart({ data, sweepAngle, threshold = 50 }) {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const r = 200;
    ctx.clearRect(0, 0, 400, 400);

    // Vẽ nền radar
    ctx.save();
    ctx.translate(r, r);
    ctx.strokeStyle = "#00ffcc";
    ctx.globalAlpha = 0.3;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, i * 40, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Vẽ vòng đỏ cảnh báo
    ctx.beginPath();
    ctx.arc(0, 0, (threshold / 200) * r, 0, 2 * Math.PI);
    ctx.strokeStyle = "#ff0033";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    // Vẽ sweep line
    ctx.save();
    ctx.rotate((sweepAngle * Math.PI) / 180);
    ctx.strokeStyle = "#00ffcc";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r - 10, 0);
    ctx.stroke();
    ctx.restore();

    // Vẽ dot phát hiện xâm nhập
    data.forEach((point) => {
      const angleRad = (point.angle * Math.PI) / 180;
      const x = Math.cos(angleRad) * point.distance;
      const y = Math.sin(angleRad) * point.distance;
      ctx.fillStyle = point.isIntrusion ? "#ff0033" : "#00ffcc";
      ctx.shadowColor = point.isIntrusion ? "#ff0033" : "#00ffcc";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, -y, 8, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }, [data, sweepAngle, threshold]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{
        background: "radial-gradient(ellipse at center, #003 60%, #000 100%)",
        border: "2px solid #00ffcc",
        borderRadius: "50%",
        boxShadow: "0 0 40px #00ffcc88",
        margin: "auto",
        display: "block",
      }}
    />
  );
}
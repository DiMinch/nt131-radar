import React, { useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarStatsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/radar/history?limit=1000`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  const sectorStep = 1;
  const sectorCount = 360 / sectorStep;
  const counts = Array(sectorCount).fill(0);

  data.forEach(item => {
    const angle = Number(item.angle);
    if (!isNaN(angle) && angle >= 0 && angle < 360) {
      const sector = Math.floor(angle / sectorStep);
      counts[sector]++;
    }
  });

  const labelStep = 20;
  const labels = Array.from({ length: sectorCount }, (_, i) =>
    i % labelStep === 0 ? `${i}°` : ""
  );

  return (
    <div style={{ background: "#002828cc", borderRadius: 16, padding: 24, maxWidth: 600, margin: "32px auto" }}>
      <h2 style={{ color: "#ff0033" }}>Obstacles Tracking by Angle (360°)</h2>
      <Radar
        data={{
          labels,
          datasets: [{
            label: "Number of obstacles",
            data: counts,
            backgroundColor: "rgba(0,255,204,0.2)",
            borderColor: "#00ffcc",
            pointBackgroundColor: "#00ffcc"
          }]
        }}
        options={{
          scales: {
            r: {
              angleLines: { color: "#00ffcc44" },
              grid: { color: "#00ffcc22" },
              pointLabels: { color: "#00ffcc", font: { size: 10 } },
              ticks: { color: "#00ffcc" }
            }
          },
          plugins: {
            legend: { labels: { color: "#00ffcc" } },
            tooltip: {
              callbacks: {
                title: (ctx) => {
                  // ctx[0].dataIndex là index của điểm
                  const angle = ctx[0].dataIndex;
                  return `Angle: ${angle}°`;
                },
                label: (ctx) => `Number of obstacles: ${ctx.formattedValue}`
              }
            }
          }
        }}
      />
    </div>
  );
}
import RadarStatsChart from "../components/RadarStatsChart";
import RadarHeatmap from "../components/RadarHeatmap";
import IntrusionTrendChart from "../components/IntrusionTrendChart";

export default function Analysis() {
  return (
    <div>
      <h1 style={{color:"#00ffcc", marginTop:32}}>Radar Data Analysis</h1>
      <div
        className="analysis-flex"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32,
          margin: "32px 0"
        }}
      >
        <div style={{width: "100%", maxWidth: 500, minWidth: 300, margin: "auto"}}>
          <RadarStatsChart />
        </div>
        <div style={{width: "100%", maxWidth: 500, minWidth: 300, margin: "auto"}}>
          <IntrusionTrendChart />
        </div>
        <div style={{width: "100%", maxWidth: 500, minWidth: 300, margin: "auto"}}>
          <RadarHeatmap />
        </div>
      </div>
    </div>
  );
}
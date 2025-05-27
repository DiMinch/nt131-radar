import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

function NavBar() {
  const location = useLocation();
  return (
    <nav style={{
      padding: "16px 0",
      background: "linear-gradient(90deg, #002828 60%, #003333 100%)",
      textAlign: "center",
      boxShadow: "0 2px 12px #00ffcc22",
      marginBottom: 0,
      fontFamily: "Orbitron, monospace"
    }}>
      <Link
        to="/"
        style={{
          color: location.pathname === "/" ? "#001f1f" : "#00ffcc",
          background: location.pathname === "/" ? "#00ffcc" : "transparent",
          borderRadius: 8,
          padding: "8px 24px",
          marginRight: 24,
          fontWeight: "bold",
          textDecoration: "none",
          transition: "all 0.2s"
        }}
      >Dashboard</Link>
      <Link
        to="/analysis"
        style={{
          color: location.pathname === "/analysis" ? "#001f1f" : "#00ffcc",
          background: location.pathname === "/analysis" ? "#00ffcc" : "transparent",
          borderRadius: 8,
          padding: "8px 24px",
          fontWeight: "bold",
          textDecoration: "none",
          transition: "all 0.2s"
        }}
      >Analysis</Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
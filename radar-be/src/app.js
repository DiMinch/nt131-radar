const express = require("express");
const cors = require("cors");
const http = require("http");
const radarRoutes = require("./routes/radar.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/radar", radarRoutes);

const server = http.createServer(app);

const ws = require("./ws");
ws.init(server);

module.exports = { app, server, ws };
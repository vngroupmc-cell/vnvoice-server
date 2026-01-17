// ===============================
// VNVOICE SERVER - index.js
// ===============================

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

// ===== Load Config =====
const configPath = path.join(__dirname, "config", "server.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// ===== Import Modules =====
const createPluginWS = require("./src/ws/pluginWS");
const createAppWS = require("./src/ws/appWS");
const { validateKey } = require("./src/auth/keyValidator");

// ===== App / Server =====
const app = express();
const server = http.createServer(app);

// ===== WebSocket Server =====
const wss = new WebSocket.Server({ server });

// ===== Global State (แชร์ทั้งระบบ) =====
const STATE = {
  plugins: new Map(), // uuid -> plugin socket
  apps: new Map(),    // uuid -> app socket
  rooms: new Map()    // roomId -> Set(uuid)
};

// ===============================
// HTTP ROUTES
// ===============================
app.get("/", (req, res) => {
  res.json({
    status: "ONLINE",
    service: "VNVOICE SERVER",
    version: "1.0.0",
    ws: {
      plugin: "/ws/plugin",
      app: "/ws/app"
    }
  });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

// ===============================
// WEBSOCKET ROUTER
// ===============================
wss.on("connection", (ws, req) => {
  const url = req.url;

  // ───── Plugin (Endstone) ─────
  if (url.startsWith("/ws/plugin")) {
    createPluginWS(ws, STATE, config);
    return;
  }

  // ───── Mobile App ─────
  if (url.startsWith("/ws/app")) {
    createAppWS(ws, STATE, config);
    return;
  }

  // ───── Unknown ─────
  ws.close(1008, "Invalid WebSocket endpoint");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || config.port || 3000;

server.listen(PORT, () => {
  console.log("=================================");
  console.log(" VNVOICE SERVER STARTED");
  console.log(` PORT: ${PORT}`);
  console.log("=================================");
});});

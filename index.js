// =======================================
// VNVOICE SERVER - index.js
// =======================================

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

// =======================================
// Load Config
// =======================================

const configPath = path.join(__dirname, "config", "server.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// =======================================
// Import WS Handlers
// =======================================

const createPluginWS = require("./src/ws/pluginWS");
const createAppWS = require("./src/ws/appWS");

// =======================================
// App / Server
// =======================================

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// =======================================
// Global State (หัวใจของระบบ)
// =======================================

const STATE = {
  plugins: new Map(), // uuid -> plugin socket
  apps: new Map(),    // uuid -> app socket
  rooms: new Map()    // roomId -> Set(uuid)
};

// =======================================
// Health Check (Render ต้องมี)
// =======================================

app.get("/health", (req, res) => {
  res.send("OK");
});

// =======================================
// WebSocket Router
// =======================================

wss.on("connection", (ws, req) => {
  const url = req.url || "";

  console.log("[WS CONNECT]", url);

  // ---------- Plugin (Endstone) ----------
  if (url.startsWith("/ws/plugin")) {
    createPluginWS(ws, STATE, config);
    return;
  }

  // ---------- Mobile App ----------
  if (url.startsWith("/ws/app")) {
    createAppWS(ws, STATE, config);
    return;
  }

  // ---------- Unknown ----------
  ws.close(1008, "Invalid WS Route");
});

// =======================================
// Start Server
// =======================================

const PORT = config.port || process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`VNVOICE SERVER running on port ${PORT}`);
});

import WebSocket from "ws";

const SERVER_URL = "wss://vnvoice-server.onrender.com";
const API_KEY = "YOUR_PLUGIN_KEY";

let ws;

export function connectPlugin() {
  ws = new WebSocket(SERVER_URL, {
    headers: {
      "x-api-key": API_KEY,
      "x-client": "plugin"
    }
  });

  ws.on("open", () => {
    console.log("[VNVOICE] Plugin connected");
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "voice-range") {
      // ระยะเสียงจากเซิฟ
      console.log("Voice range:", msg.range);
    }
  });

  ws.on("close", () => {
    console.log("[VNVOICE] Plugin disconnected");
    setTimeout(connectPlugin, 3000);
  });
}};

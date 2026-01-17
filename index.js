const http = require('http');
const WebSocket = require('ws');
const config = require('./config/server.json');

const handlePluginWS = require('./src/ws/pluginWS');
const handleAppWS = require('./src/ws/appWS');

// 1. สร้าง HTTP Server
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('VNVOICE SERVER ONLINE');
});

// 2. สร้าง WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

// 3. Handle Upgrade Request (แยก Route)
server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;

    if (pathname === '/plugin') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            handlePluginWS(ws);
        });
    } else if (pathname === '/app') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            handleAppWS(ws);
        });
    } else {
        socket.destroy(); // บล็อก Route ที่ไม่รู้จัก
    }
});

// Start Server
server.listen(config.port, () => {
    console.log(`VNVOICE-SERVER running on port ${config.port}`);
});

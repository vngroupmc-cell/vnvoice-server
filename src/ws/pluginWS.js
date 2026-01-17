const keyValidator = require('../auth/keyValidator');
const roomManager = require('../voice/roomManager');

module.exports = function handlePluginConnection(ws) {
    console.log('[PLUGIN] Connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Expected Type: "PLAYER_UPDATE"
            if (data.type === 'PLAYER_UPDATE') {
                const { uuid, serverId, world, position, key, state, playerName } = data.payload;

                // 1. อัปเดตข้อมูล Session (รวมถึง Key)
                keyValidator.registerPlayer(uuid, {
                    key, serverId, world, position, state, playerName
                });

                // 2. จัดการห้อง (เผื่อมีการเปลี่ยน World)
                roomManager.updatePlayerRoom(uuid, serverId, world);
            }
            
            // Handle Player Quit
            if (data.type === 'PLAYER_QUIT') {
                const { uuid } = data.payload;
                keyValidator.removeSession(uuid);
                roomManager.removePlayer(uuid);
            }

        } catch (e) {
            console.error('[PLUGIN] Invalid JSON:', e.message);
        }
    });

    ws.on('close', () => console.log('[PLUGIN] Disconnected'));
};

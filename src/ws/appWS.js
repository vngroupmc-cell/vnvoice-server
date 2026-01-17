const keyValidator = require('../auth/keyValidator');
const proximity = require('../voice/proximity');

module.exports = function handleAppConnection(ws) {
    let authenticatedUUID = null;

    ws.on('message', (message, isBinary) => {
        // กรณีเป็น Binary (ข้อมูลเสียง)
        if (isBinary) {
            if (authenticatedUUID) {
                // ส่งต่อให้ระบบ Proximity
                proximity.broadcastVoice(authenticatedUUID, message);
            }
            return;
        }

        // กรณีเป็น Text (JSON Auth)
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'AUTH') {
                const { uuid, key } = data.payload;

                // ตรวจสอบ Key
                if (keyValidator.validateKey(uuid, key)) {
                    authenticatedUUID = uuid;
                    proximity.registerConnection(uuid, ws);
                    
                    ws.send(JSON.stringify({ type: 'AUTH_RESULT', success: true }));
                    console.log(`[APP] User ${uuid} Authenticated`);
                } else {
                    ws.send(JSON.stringify({ type: 'AUTH_RESULT', success: false, reason: 'Invalid Key' }));
                    ws.close();
                }
            }
        } catch (e) {
            console.error('[APP] Error processing message:', e.message);
        }
    });

    ws.on('close', () => {
        if (authenticatedUUID) {
            proximity.removeConnection(authenticatedUUID);
        }
    });
};

const distanceUtil = require('../util/distance');
const keyValidator = require('../auth/keyValidator');
const roomManager = require('./roomManager');
const config = require('../../config/server.json');

// เก็บ WebSocket connection ของ App: Map<UUID, WebSocket>
const appConnections = new Map();

// ระยะเสียงยกกำลังสอง (คำนวณไว้ก่อนเพื่อความเร็ว)
const MAX_DIST_SQ = config.maxVoiceDistance * config.maxVoiceDistance;

module.exports = {
    registerConnection: (uuid, ws) => {
        appConnections.set(uuid, ws);
    },

    removeConnection: (uuid) => {
        appConnections.delete(uuid);
    },

    /**
     * กระจายเสียงไปยังผู้เล่นใกล้เคียง
     * @param {string} senderUUID - คนพูด
     * @param {Buffer} audioData - ข้อมูลเสียง (Binary)
     */
    broadcastVoice: (senderUUID, audioData) => {
        const senderSession = keyValidator.getSession(senderUUID);
        if (!senderSession || !senderSession.position) return;

        // 1. หาคนในห้องเดียวกัน (World เดียวกัน)
        const nearbyUUIDs = roomManager.getPlayersInRoom(
            senderSession.serverId, 
            senderSession.world
        );

        // 2. วนลูปเช็คระยะทาง
        nearbyUUIDs.forEach(targetUUID => {
            // ไม่ส่งกลับหาตัวเอง
            if (targetUUID === senderUUID) return;

            const targetSession = keyValidator.getSession(targetUUID);
            if (!targetSession || !targetSession.position) return;

            // 3. คำนวณระยะ (Squared)
            const distSq = distanceUtil.getDistanceSquared(
                senderSession.position,
                targetSession.position
            );

            // 4. ถ้าอยู่ในระยะ -> ส่งเสียง
            if (distSq <= MAX_DIST_SQ) {
                const targetWS = appConnections.get(targetUUID);
                if (targetWS && targetWS.readyState === 1) { // 1 = OPEN
                    // ส่งเป็น Binary หรือ JSON ตาม Protocol ที่ App รองรับ
                    // ในที่นี้ส่งเป็น Binary Array โดยแปะ Header ไปนิดหน่อยได้ถ้าต้องการ
                    // แต่เพื่อความ simple ส่ง raw audio ไปเลย หรือห่อ JSON ก็ได้
                    // กรณีนี้สมมติส่ง raw binary เพื่อ performance
                    targetWS.send(audioData); 
                }
            }
        });
    }
};

// เก็บข้อมูล Session ผู้เล่น: Map<UUID, { key, serverId, world, playerName }>
const playerSessions = new Map();

module.exports = {
    /**
     * ลงทะเบียน/อัปเดตข้อมูลผู้เล่นจาก Plugin
     */
    registerPlayer: (uuid, data) => {
        playerSessions.set(uuid, {
            key: data.key,
            playerName: data.playerName,
            serverId: data.serverId,
            world: data.world,
            position: data.position,
            state: data.state
        });
    },

    /**
     * ตรวจสอบว่า Key จาก App ตรงกับที่ Plugin ส่งมาหรือไม่
     */
    validateKey: (uuid, key) => {
        const session = playerSessions.get(uuid);
        if (!session) return false;
        return session.key === key;
    },

    getSession: (uuid) => playerSessions.get(uuid),
    
    removeSession: (uuid) => playerSessions.delete(uuid)
};

// Map<RoomKey, Set<UUID>>
// RoomKey format: "serverId:world"
const rooms = new Map();

/**
 * สร้าง Room Key
 */
const getRoomKey = (serverId, world) => `${serverId}:${world}`;

module.exports = {
    /**
     * นำผู้เล่นเข้าห้อง (ย้ายอัตโนมัติถ้าเปลี่ยน world)
     */
    updatePlayerRoom: (uuid, serverId, world) => {
        // 1. หาว่าเดิมอยู่ห้องไหน แล้วลบออก
        rooms.forEach((players, key) => {
            if (players.has(uuid)) players.delete(uuid);
        });

        // 2. เพิ่มเข้าห้องใหม่
        const key = getRoomKey(serverId, world);
        if (!rooms.has(key)) {
            rooms.set(key, new Set());
        }
        rooms.get(key).add(uuid);
    },

    /**
     * ดึง UUID ของคนในห้องเดียวกันทั้งหมด
     */
    getPlayersInRoom: (serverId, world) => {
        const key = getRoomKey(serverId, world);
        return rooms.get(key) || new Set();
    },

    /**
     * ลบผู้เล่นออกจากระบบห้อง
     */
    removePlayer: (uuid) => {
        rooms.forEach((players) => players.delete(uuid));
    }
};

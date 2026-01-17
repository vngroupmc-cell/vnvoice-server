/**
 * คำนวณระยะทางแบบยกกำลังสอง (เร็วกว่า Math.sqrt)
 * @param {Object} pos1 - {x, y, z}
 * @param {Object} pos2 - {x, y, z}
 * @returns {number} distance squared
 */
function getDistanceSquared(pos1, pos2) {
    if (!pos1 || !pos2) return Infinity;
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return dx * dx + dy * dy + dz * dz;
}

module.exports = { getDistanceSquared };

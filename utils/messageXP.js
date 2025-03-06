/**
 * @file Message XP Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { addXP } = require("./leveling");
const config = require("../config.json");

async function handleMessageXP(message) {
    if (!config.leveling.enabled || !config.leveling.xp_methods.message_xp.enabled) return;
    if (message.author.bot) return; // ✅ Ignore bots from earning XP

    const { min_xp, max_xp } = config.leveling.xp_methods.message_xp;
    const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;

    await addXP(message.author.id, message.guild, xpGain, "message_xp");
}

module.exports = { handleMessageXP };
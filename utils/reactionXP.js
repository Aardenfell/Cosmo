/**
 * @file Reaction XP Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { addXP, loadXPData, saveXPData } = require("./leveling");
const config = require("../config.json");

async function handleReactionXP(reaction, user) {
    if (!config.leveling.enabled || !config.leveling.xp_methods.reaction_xp.enabled) return;

    const { min_xp, max_xp, cooldown } = config.leveling.xp_methods.reaction_xp;
    const guild = reaction.message.guild;

    if (!guild) return; // Ensure it's a guild reaction

    const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;
    let xpData = loadXPData();

    if (!xpData.users[user.id]) {
        xpData.users[user.id] = { xp: 0, level: 0, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
    }

    const userXP = xpData.users[user.id];

    // Check cooldown
    const now = Math.floor(Date.now() / 1000); // Store in seconds
    if (now - userXP.last_reaction_xp < cooldown) return;

    // Grant XP and update last reaction XP time
    await addXP(user.id, guild, xpGain, "reaction_xp");

    userXP.last_reaction_xp = now;
    saveXPData(xpData); // Ensure data is stored properly
}

module.exports = { handleReactionXP };

/**
 * @file Optimized Voice XP Handler (Tracks Time in VC)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { addXP, loadXPData, saveXPData } = require("../utils/leveling");
const config = require("../config.json");

const activeVoiceUsers = new Map(); // Tracks when users join VC

/**
 * Handle users joining/leaving voice channels.
 */
module.exports = {
    name: "voiceStateUpdate",
    
    async execute(oldState, newState) {
        if (!config.leveling.enabled || !config.leveling.xp_methods.voice_xp.enabled) return;

        const userId = newState.member.id;
        const guild = newState.guild;

        // User joins a voice channel
        if (!oldState.channelId && newState.channelId) {
            activeVoiceUsers.set(userId, {
                joinedAt: Date.now(),
                lastXP: 0
            });
        }

        // User leaves a voice channel
        if (oldState.channelId && !newState.channelId) {
            activeVoiceUsers.delete(userId);
        }
    }
};

/**
 * Periodically check voice XP and grant XP.
 */
async function checkVoiceXP(client) {
    if (!config.leveling.enabled || !config.leveling.xp_methods.voice_xp.enabled) return;

    const { min_xp, max_xp, cooldown } = config.leveling.xp_methods.voice_xp;
    const now = Date.now();
    let xpData = loadXPData();

    for (const [userId, data] of activeVoiceUsers) {
        const user = await client.users.fetch(userId).catch(() => null);
        if (!user || user.bot) continue;

        const guild = client.guilds.cache.find(g => g.members.cache.has(userId));
        if (!guild) continue;

        const userXP = xpData.users[userId] || { xp: 0, level: 0, last_voice_xp: 0 };

        // Calculate time spent in VC
        const timeSpent = (now - data.joinedAt) / 1000; // Convert ms → seconds

        // If user has been in VC for cooldown duration, award XP
        if (timeSpent >= cooldown && now - userXP.last_voice_xp >= cooldown * 1000) {
            const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;
            await addXP(userId, guild, xpGain, "voice_xp");

            // Update last XP time
            activeVoiceUsers.set(userId, { ...data, lastXP: now });
        }
    }

    saveXPData(xpData);
}

/**
 * Start the XP check interval on bot startup.
 */
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("✅ Voice XP tracking started.");
        setInterval(() => checkVoiceXP(client), CHECK_INTERVAL);
    }
};

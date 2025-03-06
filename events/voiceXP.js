/**
 * @file Voice XP Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { addXP, loadXPData, saveXPData } = require("../utils/leveling");
const config = require("../config.json");

const activeVoiceUsers = new Map(); // Tracks when users join VC
const CHECK_INTERVAL = 60 * 1000; // Check every 60s

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
            console.log(`🎤 User ${newState.member.user.username} joined VC.`);
            activeVoiceUsers.set(userId, {
                joinedAt: Date.now(),
                lastXP: 0
            });
        }

        // User leaves a voice channel
        if (oldState.channelId && !newState.channelId) {
            console.log(`🚪 User ${newState.member.user.username} left VC.`);
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

    console.log("🔍 Checking voice XP for active users...");

    for (const [userId, data] of activeVoiceUsers) {
        const user = await client.users.fetch(userId).catch(() => null);
        if (!user || user.bot) {
            console.log(`🚫 Ignoring bot or invalid user: ${userId}`);
            continue;
        }

        const guild = client.guilds.cache.find(g => g.members.cache.has(userId));
        if (!guild) {
            console.log(`❌ User ${userId} not found in any guild.`);
            continue;
        }

        const userXP = xpData.users[userId] || { xp: 0, level: 0, last_voice_xp: 0 };

        // Calculate time spent in VC
        const timeSpent = (now - data.joinedAt) / 1000; // Convert ms → seconds
        console.log(`🕒 ${user.username} has been in VC for ${timeSpent} seconds.`);

        // If user has been in VC for cooldown duration, award XP
        if (timeSpent >= cooldown && now - userXP.last_voice_xp >= cooldown * 1000) {
            const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;
            console.log(`✅ Awarding ${xpGain} XP to ${user.username}`);

            await addXP(userId, guild, xpGain, "voice_xp");

            // Update last XP time
            activeVoiceUsers.set(userId, { ...data, lastXP: now });
        } else {
            console.log(`⏳ ${user.username} has not yet reached cooldown.`);
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

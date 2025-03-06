/**
 * @file Voice XP Handler 
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { addXP, loadXPData, saveXPData } = require("./leveling");
const { activeVoiceUsers } = require("./voiceTracking");
const config = require("../config.json");

const CHECK_INTERVAL = 60 * 1000; // Check every 60s

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
        if (timeSpent >= cooldown && now - userXP.last_voice_xp >= cooldown) {
            const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;
            console.log(`✅ Awarding ${xpGain} XP to ${user.username}`);

            await addXP(userId, guild, xpGain, "voice_xp");

            // Update last XP time
            userXP.last_voice_xp = Math.floor(now / 1000);
            saveXPData(xpData);
        } else {
            console.log(`⏳ ${user.username} has not yet reached cooldown.`);
        }
    }

    saveXPData(xpData);
}

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("✅ Voice XP tracking started.");
        setInterval(() => checkVoiceXP(client), CHECK_INTERVAL);
    }
};

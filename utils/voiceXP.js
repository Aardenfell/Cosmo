/**
 * @file Voice XP Handler 
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.3.0
 */

const { addXP } = require("./leveling"); 
const { activeVoiceUsers } = require("./voiceTracking");
const config = require("../config.json");

const CHECK_INTERVAL = 60 * 1000; // Check every 60s
let voiceXPInterval = null; // Stores the interval ID

/**
 * Periodically check voice XP and grant XP.
 */
async function checkVoiceXP(client) {
    if (!config.leveling.enabled || !config.leveling.xp_methods.voice_xp.enabled) return;
    if (activeVoiceUsers.size === 0) return; // No active users, stop checking

    const { min_xp, max_xp, cooldown } = config.leveling.xp_methods.voice_xp;
    const now = Math.floor(Date.now() / 1000);

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

        const member = await guild.members.fetch(userId);
        const voiceState = member.voice;

        // **EXCLUSION CHECKS**
        if (voiceState.serverDeaf || voiceState.selfDeaf) {
            console.log(`🚫 ${user.username} is deafened (No XP granted).`);
            continue;
        }

        if (voiceState.serverMute) {
            console.log(`🚫 ${user.username} is server-muted (No XP granted).`);
            continue;
        }

        if (voiceState.suppress) {
            console.log(`🚫 ${user.username} is suppressed (No XP granted).`);
            continue;
        }

        console.log(`🕒 ${user.username} has been in VC for ${(now - Math.floor(data.joinedAt / 1000))} seconds.`);

        // If user has been in VC for cooldown duration, award XP
        if (now - Math.floor(data.joinedAt / 1000) >= cooldown) {
            const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;
            console.log(`✅ Awarding ${xpGain} XP to ${user.username}`);

            await addXP(userId, guild, xpGain, "voice_xp"); 

        } else {
            console.log(`⏳ ${user.username} has not yet reached cooldown.`);
        }
    }
}

/**
 * Start the Voice XP interval if not already running.
 */
function startVoiceXP(client) {
    if (voiceXPInterval) return; // Already running
    console.log("✅ Voice XP tracking started.");

    voiceXPInterval = setInterval(() => checkVoiceXP(client), CHECK_INTERVAL);
}

/**
 * Stop the Voice XP interval if no one is in VC.
 */
function stopVoiceXP() {
    if (activeVoiceUsers.size === 0 && voiceXPInterval) {
        clearInterval(voiceXPInterval);
        voiceXPInterval = null;
        console.log("🛑 Voice XP tracking stopped (No users in VC).");
    }
}

module.exports = { startVoiceXP, stopVoiceXP };

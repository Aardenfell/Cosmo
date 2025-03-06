/**
 * @file Leveling Utility (Handles XP, Level-Ups & Rewards)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const config = require("../config.json");

const XP_FILE_PATH = path.join(__dirname, "../data/levels.json");

/**
 * Load user XP data.
 */
function loadXPData() {
    if (!fs.existsSync(XP_FILE_PATH)) {
        return { users: {} };
    }
    return JSON.parse(fs.readFileSync(XP_FILE_PATH, "utf8"));
}

/**
 * Save user XP data.
 */
function saveXPData(data) {
    fs.writeFileSync(XP_FILE_PATH, JSON.stringify(data, null, 4), "utf8");
}

/**
 * Calculate XP required for the next level.
 */
function getXPForNextLevel(level) {
    const { base_xp, multiplier } = config.leveling.level_formula;
    return base_xp * Math.pow(level, multiplier);
}

/**
 * Add XP to a user, handle level-ups, and send a message if they level up.
 */
async function addXP(userId, guild, xpGain, method) {
    if (!config.leveling.enabled || !config.leveling.xp_methods[method].enabled) return;

    const now = Math.floor(Date.now() / 1000);
    let xpData = loadXPData();

    if (!xpData.users[userId]) {
        xpData.users[userId] = { xp: 0, level: 1, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
    }

    const userXP = xpData.users[userId];

    // Check cooldown
    const cooldown = config.leveling.xp_methods[method].cooldown;
    if (now - userXP[`last_${method}`] < cooldown) return;
    
    // Grant XP
    userXP.xp += xpGain;
    userXP[`last_${method}`] = now;

    // Check for level-up
    let leveledUp = false;
    while (userXP.xp >= getXPForNextLevel(userXP.level)) {
        userXP.xp -= getXPForNextLevel(userXP.level);
        userXP.level += 1;
        leveledUp = true;
    }

    // Save XP data
    saveXPData(xpData);

    // Send level-up message
    if (leveledUp && config.leveling.levelup_messages.enabled) {
        const levelupChannelId = config.leveling.levelup_messages.channel_id;
        const channel = guild.channels.cache.get(levelupChannelId);
        if (channel) {
            channel.send(`✧ Congratulations, <@${userId}>! You reached **Level ${userXP.level}**! ˚ʚ♡ɞ˚`);
        }
    }
}

module.exports = { addXP, getXPForNextLevel, loadXPData, saveXPData };

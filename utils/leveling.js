/**
 * @file Leveling Utility (Handles XP, Level-Ups & Rewards)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.3.2
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
 * Assign role rewards based on level and update 1st Place role.
 */
async function assignRoleRewards(member, newLevel) {
    const guild = member.guild;
    await guild.roles.fetch();

    let earnedRoles = [];
    let firstPlaceGained = false;
    let firstPlaceUser = null;
    let previousFirstPlaceUser = null;

    // Find level roles dynamically (e.g., "Level 5", "Level 10")
    const levelRoles = guild.roles.cache.filter(role => role.name.startsWith("Level "));

    for (const [roleId, role] of levelRoles) {
        const level = parseInt(role.name.replace("Level ", ""));
        if (!isNaN(level) && newLevel >= level && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            earnedRoles.push(`**${role.name}**`);
            console.log(`🎖 Assigned role ${role.name} to ${member.user.username} for reaching level ${level}`);
        }
    }

    // Find "1st Place" role
    const firstPlaceRole = guild.roles.cache.find(role => role.name === "1st Place");
    if (firstPlaceRole) {
        // Determine the new highest-level user
        const sortedUsers = Object.entries(loadXPData().users)
            .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp);
        
        const topUserId = sortedUsers.length > 0 ? sortedUsers[0][0] : null;

        if (topUserId) {
            // Fetch the current 1st place holder
            previousFirstPlaceUser = guild.members.cache.find(m => m.roles.cache.has(firstPlaceRole.id));
            firstPlaceUser = await guild.members.fetch(topUserId);

            // If a different user takes 1st place, reassign the role
            if (previousFirstPlaceUser && previousFirstPlaceUser.id !== firstPlaceUser.id) {
                await previousFirstPlaceUser.roles.remove(firstPlaceRole);
                console.log(`🏆 Removed "1st Place" role from ${previousFirstPlaceUser.user.username}`);
            }

            if (!firstPlaceUser.roles.cache.has(firstPlaceRole.id)) {
                await firstPlaceUser.roles.add(firstPlaceRole);
                firstPlaceGained = true;
                console.log(`🏆 ${firstPlaceUser.user.username} is now the highest level and received ${firstPlaceRole.name}!`);
            }
        }
    }

    // 🎤 Send announcement (NOW WITH SMART MENTIONS)
    if (config.leveling.levelup_messages.enabled) {
        const levelupChannelId = config.leveling.levelup_messages.channel_id;
        const channel = guild.channels.cache.get(levelupChannelId);
        if (channel) {
            let message = `✧ Congratulations, <@${member.user.id}>! You've reached **Level ${newLevel}**! ˚ʚ♡ɞ˚`;

            if (earnedRoles.length > 0) {
                message += `\nYou have earned the following roles: ${earnedRoles.join(", ")}`;
            }

            // 🔹 Handle 1st place messaging smartly:
            if (firstPlaceGained && firstPlaceUser) {
                if (firstPlaceUser.id === member.user.id) {
                    // The user who leveled up is also now 1st place → No duplicate mention
                    message += `\nYou are now the highest level and have received the **1st Place** role! 🏆`;
                } else {
                    // Someone ELSE became first place → Mention them separately
                    message += `\n<@${firstPlaceUser.user.id}>, you are now the highest level and have received the **1st Place** role! 🏆`;
                }
            }

            channel.send(message);
        }
    }

    return { earnedRoles, firstPlaceGained };
}


/**
 * Add XP to a user, handle level-ups, and assign roles.
 */
async function addXP(userId, guild, xpGain, method) {
    if (!config.leveling.enabled || !config.leveling.xp_methods[method].enabled) return;

    const now = Math.floor(Date.now() / 1000);
    let xpData = loadXPData();

    if (!xpData.users[userId]) {
        xpData.users[userId] = { xp: 0, level: 0, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
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

    // Assign role rewards if the user leveled up
    if (leveledUp) {
        const member = await guild.members.fetch(userId);
        await assignRoleRewards(member, userXP.level);
    }
}

module.exports = { addXP, getXPForNextLevel, loadXPData, saveXPData, assignRoleRewards };

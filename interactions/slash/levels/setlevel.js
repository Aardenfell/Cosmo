/**
 * @file Set Level Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

// Deconstruct the required modules
const { SlashCommandBuilder } = require("discord.js");
const { loadXPData, saveXPData, assignRoleRewards, getXPForNextLevel } = require("../../../utils/leveling");
const config = require("../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlevel")
        .setDescription("Set a user's level manually. (Admin only)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user whose level you want to set.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("level")
                .setDescription("The level to set the user to.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const { guild, member } = interaction;
        if (!hasAdminRole(member)) {
            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser("user");
        const newLevel = interaction.options.getInteger("level");

        let xpData = loadXPData();

        // Identify the current top user before changes
        const sortedUsers = Object.entries(xpData.users)
            .sort(([, a], [, b]) => b.level - a.level);
        const previousTopUserId = sortedUsers.length > 0 ? sortedUsers[0][0] : null;

        if (!xpData.users[targetUser.id]) {
            xpData.users[targetUser.id] = { xp: 0, level: 0, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
        }

        const userXP = xpData.users[targetUser.id];
        userXP.level = newLevel;

        // Adjust XP so they are at the start of their new level
        userXP.xp = newLevel > 0 ? getXPForNextLevel(newLevel - 1) : 0;

        saveXPData(xpData);

        // Fetch the guild member (needed for role rewards)
        const targetMember = await guild.members.fetch(targetUser.id);

        // Assign roles based on the new level
        const { earnedRoles, firstPlaceGained } = await assignRoleRewards(targetMember, userXP.level);

        // Identify the new top user after the changes
        const updatedSortedUsers = Object.entries(loadXPData().users)
            .sort(([, a], [, b]) => b.level - a.level);
        const newTopUserId = updatedSortedUsers.length > 0 ? updatedSortedUsers[0][0] : null;

        // Construct the level-up message
        const levelupChannelId = config.leveling.levelup_messages.channel_id;
        const channel = guild.channels.cache.get(levelupChannelId);
        if (channel) {
            let message = `✧ **Admin Override:** <@${targetUser.id}>, your level has been set to **${newLevel}**! ˚ʚ♡ɞ˚`;

            if (earnedRoles.length > 0) {
                message += `\nYou have earned the following roles: ${earnedRoles.join(", ")}`;
            }

            if (newTopUserId && newTopUserId !== previousTopUserId) {
                message += `\n<@${newTopUserId}> You are now the highest level and have received the **1st Place** role! 🏆`;
            }

            channel.send(message);
        }

        // Confirmation message to the admin
        return interaction.reply({
            content: `✅ Successfully set **${targetUser.username}**'s level to **${newLevel}**.`,
            ephemeral: true
        });
    }
};

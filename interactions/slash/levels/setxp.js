/**
 * @file Set XP Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

// Deconstruct the required modules
const { SlashCommandBuilder } = require("discord.js");
const { addXP, loadXPData, saveXPData, assignRoleRewards, getXPForNextLevel } = require("../../../utils/leveling");
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
        .setName("setxp")
        .setDescription("Set a user's XP manually. (Admin only)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user whose XP you want to set.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("The amount of XP to set.")
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
        const newXP = interaction.options.getInteger("amount");

        let xpData = loadXPData();
        if (!xpData.users[targetUser.id]) {
            xpData.users[targetUser.id] = { xp: 0, level: 0, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
        }

        const userXP = xpData.users[targetUser.id];
        userXP.xp = newXP; // Set XP directly

        // Check for level-ups
        let leveledUp = false;
        while (userXP.xp >= getXPForNextLevel(userXP.level)) {
            userXP.xp -= getXPForNextLevel(userXP.level);
            userXP.level += 1;
            leveledUp = true;
        }

        saveXPData(xpData);

        // Fetch the guild member (needed for role rewards)
        const targetMember = await guild.members.fetch(targetUser.id);

        // Assign roles if leveled up
        if (leveledUp) {
            const { earnedRoles, firstPlaceGained } = await assignRoleRewards(targetMember, userXP.level);

            // Construct the level-up message
            const levelupChannelId = config.leveling.levelup_messages.channel_id;
            const channel = guild.channels.cache.get(levelupChannelId);
            if (channel) {
                let message = `✧ **Admin Override:** <@${targetUser.id}>, your XP has been set to **${newXP}**. You are now **Level ${userXP.level}**! ˚ʚ♡ɞ˚`;

                if (earnedRoles.length > 0) {
                    message += `\nYou have earned the following roles: ${earnedRoles.join(", ")}`;
                }

                if (firstPlaceGained) {
                    message += `\nYou are now the highest level and have received the **1st Place** role! 🏆`;
                }

                channel.send(message);
            }
        }

        // Confirmation message to the admin
        return interaction.reply({
            content: `✅ Successfully set **${targetUser.username}**'s XP to **${newXP}**.`,
            ephemeral: true
        });
    }
};

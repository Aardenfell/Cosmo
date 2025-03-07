/**
 * @file Set XP Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.2.0
 */

const { SlashCommandBuilder } = require("discord.js");
const { loadXPData, saveXPData, assignRoleRewards, getXPForNextLevel } = require("../../../utils/leveling");
const config = require("../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

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
        while (userXP.xp >= getXPForNextLevel(userXP.level)) {
            userXP.xp -= getXPForNextLevel(userXP.level);
            userXP.level += 1;
        }

        saveXPData(xpData);

        // Fetch the guild member (needed for role rewards)
        const targetMember = await guild.members.fetch(targetUser.id);

        // Assign roles based on new level and trigger announcement
        await assignRoleRewards(targetMember, userXP.level);

        return interaction.reply({
            content: `✅ Successfully set **${targetUser.username}**'s XP to **${newXP}**.`,
            ephemeral: true
        });
    }
};

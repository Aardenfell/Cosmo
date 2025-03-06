/**
 * @file Set XP Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
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

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("setxp")
        .setDescription("Manually set a user's XP. (Admin Only)")
        .addUserOption(option =>
            option.setName("user").setDescription("The user whose XP you want to set.").setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("amount").setDescription("The XP amount to set.").setRequired(true)
        ),

    async execute(interaction) {
        const { guild, member } = interaction;

        // Ensure only admins can use this command
        if (!hasAdminRole(member)) {
            return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser("user");
        const xpAmount = interaction.options.getInteger("amount");

        let xpData = loadXPData();

        if (!xpData.users[targetUser.id]) {
            xpData.users[targetUser.id] = { xp: 0, level: 0, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
        }

        let userXP = xpData.users[targetUser.id];
        userXP.xp = xpAmount;

        // Adjust levels based on new XP
        let newLevel = 0;
        while (userXP.xp >= getXPForNextLevel(newLevel)) {
            userXP.xp -= getXPForNextLevel(newLevel);
            newLevel += 1;
        }
        userXP.level = newLevel;

        saveXPData(xpData);

        // Assign role rewards
        const targetMember = await guild.members.fetch(targetUser.id);
        const { earnedRoles, firstPlaceGained } = await assignRoleRewards(targetMember, newLevel);

        // Construct response message
        let message = `✅ **${targetUser.username}'s** XP has been set to **${xpAmount}** (Level ${newLevel}).`;
        if (earnedRoles.length > 0) {
            message += `\nThey have earned: ${earnedRoles.join(", ")}`;
        }
        if (firstPlaceGained) {
            message += `\nThey are now the highest level and have received **1st Place** role! 🏆`;
        }

        return interaction.reply({ content: message, ephemeral: false });
    }
};

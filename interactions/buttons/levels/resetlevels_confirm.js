/**
 * @file Confirm Reset Levels Button Interaction
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { EmbedBuilder } = require("discord.js");
const { loadXPData, saveXPData } = require("../../../utils/leveling");
const config = require("../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

module.exports = {
    id: "confirm_reset_levels",

    async execute(interaction) {
        const { member, guild } = interaction;

        if (!hasAdminRole(member)) {
            return interaction.reply({
                content: "❌ You do not have permission to perform this action.",
                ephemeral: true
            });
        }

        // Reset all users' XP and levels
        let xpData = loadXPData();
        Object.keys(xpData.users).forEach(userId => {
            xpData.users[userId] = {
                xp: 0,
                level: 0,
                last_message_xp: 0,
                last_voice_xp: 0,
                last_reaction_xp: 0
            };
        });
        saveXPData(xpData);

        // Send confirmation embed
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Levels Reset")
            .setDescription("All users' XP and levels have been successfully reset!");

        await interaction.update({ embeds: [embed], components: [] });
    }
};

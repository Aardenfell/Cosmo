/**
 * @file Cancel Reset Levels Button Interaction
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

module.exports = {
    id: "cancel_reset_levels",

    async execute(interaction) {
        const { member } = interaction;

        if (!hasAdminRole(member)) {
            return interaction.reply({
                content: "❌ You do not have permission to perform this action.",
                ephemeral: true
            });
        }

        // Send cancel message
        const embed = new EmbedBuilder()
            .setColor("#444444")
            .setTitle("❌ Reset Cancelled")
            .setDescription("No changes were made.");

        await interaction.update({ embeds: [embed], components: [] });
    }
};

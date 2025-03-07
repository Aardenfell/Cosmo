/**
 * @file Reset Levels Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 2.0.0
 */

const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

module.exports = {
    async execute(interaction) {
        if (interaction.options.getSubcommand() !== "reset") return;

        const { member } = interaction;
        if (!hasAdminRole(member)) {
            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });
        }

        // Embed warning message
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("⚠️ Reset Levels Warning")
            .setDescription(
                "**Are you sure you want to reset all users' XP and levels?**\n" +
                "This action **cannot be undone!**"
            );

        // Create buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_reset_levels")
                .setLabel("✅ Confirm")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("cancel_reset_levels")
                .setLabel("❌ Cancel")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [buttons] });
    }
};

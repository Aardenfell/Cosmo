/**
 * @file Level Command for Checking User Levels
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

// Deconstructed the constants we need in this file.
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadXPData, getXPForNextLevel } = require("../../../utils/leveling");

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    // The data needed to register slash commands to Discord.
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Check your level or someone else's.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user whose level you want to check.")
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("user") || interaction.user;
        const xpData = loadXPData();
        const userData = xpData.users[targetUser.id];

        if (!userData) {
            return interaction.reply({
                content: `❌ **${targetUser.username}** has no recorded XP.`,
                ephemeral: true
            });
        }

        const { xp, level } = userData;
        const xpNeeded = getXPForNextLevel(level) - xp;

        const embed = new EmbedBuilder()
            .setColor("#8f69f8") // Cozy lilac color
            .setTitle(`Level Info for ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setDescription(`🌟 **Level:** ${level}\n📈 **XP:** ${xp} XP\n🎯 **XP Needed for Next Level:** ${xpNeeded} XP`);

        interaction.reply({ embeds: [embed] });
    }
};

/**
 * @file Level Command for Checking User Levels
 * @author Aardenfell
 * @since 1.0.0
 * @version 2.0.0
 */

// Deconstructed the constants we need in this file.
const { EmbedBuilder } = require("discord.js");
const { loadXPData, getXPForNextLevel } = require("../../../../utils/leveling");

/**
 * @type {import('../../../../typings').SlashInteractionCommand}
 */
module.exports = {
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

        // Sort users by level (highest first), then XP as a tiebreaker
        const sortedUsers = Object.entries(xpData.users)
            .sort(([, a], [, b]) => (b.level === a.level ? b.xp - a.xp : b.level - a.level));

        // Find user's position (rank)
        const userRank = sortedUsers.findIndex(([id]) => id === targetUser.id) + 1;

        const { xp, level } = userData;
        const xpNeeded = getXPForNextLevel(level) - xp;

        // Fetch member object to check for server-specific avatar
        const member = await interaction.guild.members.fetch(targetUser.id);
        const displayName = member.nickname || targetUser.displayName;
        const avatarURL = member.avatar
            ? member.displayAvatarURL({ dynamic: true }) // Server-specific avatar
            : targetUser.displayAvatarURL({ dynamic: true }); // Default avatar

        const embed = new EmbedBuilder()
            .setColor("#8f69f8") // Cozy lilac color
            .setTitle(`Level Info for ${displayName}`)
            .setThumbnail(avatarURL)
            .setDescription(
                `🏆 **Place:** ${userRank}${getOrdinalSuffix(userRank)}\n` +
                `🌟 **Level:** ${level}\n` +
                `📈 **XP:** ${xp} XP\n` +
                `🎯 **XP Needed for Next Level:** ${xpNeeded} XP`
            );

        interaction.reply({ embeds: [embed] });
    }
};

/**
 * Returns the ordinal suffix for a given number (1st, 2nd, 3rd, etc.).
 */
function getOrdinalSuffix(rank) {
    if (rank % 100 >= 11 && rank % 100 <= 13) return "th";
    switch (rank % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

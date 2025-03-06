/**
 * @file Leaderboard Command for Displaying XP Rankings
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadXPData } = require("../../../utils/leveling");

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the top XP earners in the server."),

    async execute(interaction) {
        const xpData = loadXPData();
        const guild = interaction.guild;

        // Get only users in this guild
        const guildMembers = await guild.members.fetch();
        const guildUsers = Object.entries(xpData.users).filter(([id]) => guildMembers.has(id));

        if (guildUsers.length === 0) {
            return interaction.reply({ content: "❌ No XP data available for this server.", ephemeral: true });
        }

        // Sort users by level and XP
        const sortedUsers = guildUsers.sort(([, a], [, b]) => 
            b.level === a.level ? b.xp - a.xp : b.level - a.level
        );

        // Get the top 10 users
        const topUsers = sortedUsers.slice(0, 10);
        const firstPlaceUserId = topUsers.length > 0 ? topUsers[0][0] : null;

        // Get the first-place user's avatar
        let firstPlaceAvatar = null;
        if (firstPlaceUserId) {
            const firstPlaceMember = await guild.members.fetch(firstPlaceUserId);
            firstPlaceAvatar = firstPlaceMember.avatar
                ? firstPlaceMember.displayAvatarURL({ dynamic: true }) // Server-specific avatar
                : firstPlaceMember.user.displayAvatarURL({ dynamic: true }); // Default avatar
        }

        // Format leaderboard text with mentions
        const leaderboardText = topUsers.map(([id, data], index) => {
            return `**${index + 1}.** <@${id}> - 🏆 Level ${data.level} (${data.xp} XP)`;
        }).join("\n");

        // Get current user's rank if they aren't in the top 10
        const userIndex = sortedUsers.findIndex(([id]) => id === interaction.user.id);
        let userRankText = "";
        if (userIndex >= 10) {
            const userData = sortedUsers[userIndex][1];
            userRankText = `\n📍 **Your Rank:** #${userIndex + 1} - 🏆 Level ${userData.level} (${userData.xp} XP)`;
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setColor("#8f69f8") 
            .setTitle("🏆 Server Leaderboard")
            .setThumbnail(firstPlaceAvatar)
            .setDescription(`${leaderboardText}${userRankText}`)
            .setFooter({ text: "Keep earning XP to climb the ranks!" });

        await interaction.reply({ embeds: [embed] });
    }
};

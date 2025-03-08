/**
 * @file Voice Show Subcommand
 * @description Unhide the temporary VC for all users.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { PermissionsBitField } = require("discord.js");

module.exports = {
    async execute(interaction) {
        const { member, guild } = interaction;
        const userVC = member.voice.channel;

        // Unhide the channel by granting @everyone the View Channel permission
        await userVC.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: true
        });

        return interaction.reply({
            content: "✅ This voice channel is now **visible** to everyone!",
            ephemeral: true
        });
    }
};

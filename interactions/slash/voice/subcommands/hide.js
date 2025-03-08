/**
 * @file Voice Hide Subcommand
 * @description Hides the temporary VC from users who are not in the channel.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { PermissionsBitField } = require("discord.js");

module.exports = {
    async execute(interaction) {
        const { member, guild } = interaction;
        const voiceChannel = member.voice.channel;

        // Modify permissions to hide the VC from non-members
        await voiceChannel.permissionOverwrites.edit(guild.id, {
            ViewChannel: false
        });

        return interaction.reply({
            content: "✅ This voice channel is now **hidden** from non-members.",
            ephemeral: true
        });
    }
};

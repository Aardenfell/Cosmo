/**
 * @file Voice Lock Subcommand
 * @description Prevents users from joining the temporary VC.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { PermissionsBitField } = require("discord.js");

module.exports = {
    async execute(interaction) {
        const { member, guild } = interaction;
        const userVC = member.voice.channel;

        // Lock the VC by denying @everyone the Connect permission
        await userVC.permissionOverwrites.edit(guild.roles.everyone, {
            Connect: false
        });

        return interaction.reply({
            content: "🔒 This voice channel is now **locked**. New users cannot join!",
            ephemeral: true
        });
    }
};

/**
 * @file Voice Unlock Subcommand
 * @description Allows users to join the temporary VC again.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { PermissionsBitField } = require("discord.js");

module.exports = {
    async execute(interaction) {
        const { member, guild } = interaction;
        const userVC = member.voice.channel;

        // Unlock the VC by granting @everyone the Connect permission
        await userVC.permissionOverwrites.edit(guild.roles.everyone, {
            Connect: true
        });

        return interaction.reply({
            content: "🔓 This voice channel is now **unlocked**. Users can join freely!",
            ephemeral: true
        });
    }
};

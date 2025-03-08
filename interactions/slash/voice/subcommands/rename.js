/**
 * @file Voice Rename Subcommand
 * @description Allows the owner or an admin to rename the temporary VC.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

module.exports = {
    async execute(interaction) {
        const { member } = interaction;
        const userVC = member.voice.channel;
        const newName = interaction.options.getString("name").trim();

        // Validate name length (Discord has a max of 32 chars for VC names)
        if (newName.length < 1 || newName.length > 32) {
            return interaction.reply({
                content: "❌ The VC name must be between **1 and 32 characters** long.",
                ephemeral: true
            });
        }

        // Rename the VC
        await userVC.setName(`✧ ${newName} ✧`);

        return interaction.reply({
            content: `✅ The voice channel has been renamed to **${newName}**.`,
            ephemeral: true
        });
    }
};

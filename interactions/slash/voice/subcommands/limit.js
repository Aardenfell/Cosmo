/**
 * @file Voice Limit Subcommand
 * @description Allows the owner or an admin to set a user limit for their temporary VC.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

module.exports = {
    async execute(interaction) {
        const { member } = interaction;
        const userVC = member.voice.channel;
        const newLimit = interaction.options.getInteger("number");

        // Validate user limit (0-99 is Discord's max)
        if (newLimit < 0 || newLimit > 99) {
            return interaction.reply({
                content: "❌ The user limit must be between **0 (unlimited) and 99**.",
                ephemeral: true
            });
        }

        // Apply the new user limit
        await userVC.setUserLimit(newLimit);

        return interaction.reply({
            content: `✅ The voice channel limit has been set to **${newLimit === 0 ? "Unlimited" : newLimit} users**.`,
            ephemeral: true
        });
    }
};

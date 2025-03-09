/**
 * @file Counting Channel Subcommand
 * @description Allows admins to set the counting channel.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const configPath = path.resolve(__dirname, "../../../../config.json");

module.exports = {
    async execute(interaction) {
        // Check for admin permissions
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "❌ You do not have permission to change the counting channel.",
                ephemeral: true
            });
        }

        // Get the selected channel
        const channel = interaction.options.getChannel("channel");

        try {
            // Read and update config dynamically
            const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
            config.counting.channel_id = channel.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            return interaction.reply({
                content: `✅ Counting channel has been set to <#${channel.id}>.`,
                ephemeral: true
            });
        } catch (error) {
            console.error("Error updating counting channel:", error);
            return interaction.reply({
                content: "❌ An error occurred while updating the counting channel.",
                ephemeral: true
            });
        }
    }
};

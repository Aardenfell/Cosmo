/**
 * @file Counting Toggle Subcommand
 * @description Allows admins to enable or disable the counting system.
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
                content: "❌ You do not have permission to toggle the counting system.",
                ephemeral: true
            });
        }

        try {
            // Read and update config dynamically
            const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
            config.counting.enabled = !config.counting.enabled; // Toggle the setting
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            return interaction.reply({
                content: `✅ Counting system is now **${config.counting.enabled ? "ENABLED" : "DISABLED"}**.`,
                ephemeral: true
            });
        } catch (error) {
            console.error("Error toggling counting system:", error);
            return interaction.reply({
                content: "❌ An error occurred while toggling the counting system.",
                ephemeral: true
            });
        }
    }
};

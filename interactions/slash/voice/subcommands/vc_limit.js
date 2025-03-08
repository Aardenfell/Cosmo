/**
 * @file Voice VC Limit Subcommand
 * @description Allows an admin to modify the max number of temporary VCs.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const config = require("../../../../config.json");

/**
 * Saves the updated config file.
 */
function saveConfig(updatedConfig) {
    fs.writeFileSync(path.join(__dirname, "../../../../config.json"), JSON.stringify(updatedConfig, null, 4), "utf8");
}

module.exports = {
    async execute(interaction) {
        const { member } = interaction;
        const newLimit = interaction.options.getInteger("limit");

        // Ensure only admins can use this command
        if (!member.roles.cache.has(config.permissions.admin)) {
            return interaction.reply({
                content: "❌ Only **admins** can modify the voice chat limit.",
                ephemeral: true
            });
        }

        // Validate input (e.g., preventing negative numbers)
        if (newLimit < 1 || newLimit > 50) {
            return interaction.reply({
                content: "❌ The VC limit must be between **1 and 50**.",
                ephemeral: true
            });
        }

        // Update the config
        config.voice_hubs.vc_limit = newLimit;
        saveConfig(config);

        return interaction.reply({
            content: `✅ The **temporary VC limit** is now set to **${newLimit}**.`,
            ephemeral: true
        });
    }
};

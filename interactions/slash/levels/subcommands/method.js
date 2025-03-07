/**
 * @file Toggle XP Method Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 2.0.0
 */

// Deconstruct the required modules
const fs = require("fs");
const config = require("../../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

/**
 * Saves the updated config file.
 */
function saveConfig(updatedConfig) {
    fs.writeFileSync("./config.json", JSON.stringify(updatedConfig, null, 4), "utf8");
}

/**
 * @type {import('../../../../typings').SlashInteractionCommand}
 */
module.exports = {
    async execute(interaction) {
        if (interaction.options.getSubcommand() !== "method") return;

        const { member } = interaction;
        if (!hasAdminRole(member)) {
            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });
        }

        const method = interaction.options.getString("method");

        if (!config.leveling.xp_methods[method]) {
            return interaction.reply({
                content: `❌ Invalid XP method provided.`,
                ephemeral: true
            });
        }

        // Toggle the XP method
        config.leveling.xp_methods[method].enabled = !config.leveling.xp_methods[method].enabled;
        saveConfig(config);

        return interaction.reply({
            content: `✅ **${method.replace("_", " ").toUpperCase()}** has been **${config.leveling.xp_methods[method].enabled ? "enabled" : "disabled"}**.`,
            ephemeral: true
        });
    }
};

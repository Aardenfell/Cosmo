/**
 * @file AutoBan Toggle Subcommand
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../../config.json");

module.exports = {
    async execute(interaction) {
        const state = interaction.options.getBoolean("state");

        // Load and update config
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        config.moderation.autoban.enabled = state;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        return interaction.reply({
            content: `🔧 AutoBan has been **${state ? "enabled" : "disabled"}**.`,
            ephemeral: true
        });
    }
};

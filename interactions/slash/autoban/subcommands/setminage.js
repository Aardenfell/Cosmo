/**
 * @file AutoBan SetMinAge Subcommand
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../../config.json");

module.exports = {
    async execute(interaction) {
        const hours = interaction.options.getInteger("hours");
        const minAccountAgeMs = hours * 60 * 60 * 1000; // Convert to milliseconds

        // Load and update config
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        config.moderation.autoban.min_account_age = minAccountAgeMs;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        return interaction.reply({
            content: `🛑 AutoBan minimum account age set to **${hours} hours**.`,
            ephemeral: true
        });
    }
};

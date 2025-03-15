/**
 * @file AutoBan Whitelist Subcommand
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WHITELIST_PATH = path.join(__dirname, "../../../../data/autoban_whitelist.json");

/**
 * Load the whitelist from storage.
 */
function loadWhitelist() {
    if (!fs.existsSync(WHITELIST_PATH)) {
        fs.writeFileSync(WHITELIST_PATH, JSON.stringify({ whitelisted_users: [] }, null, 4));
    }
    return JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8"));
}

/**
 * Save the whitelist to storage.
 */
function saveWhitelist(data) {
    fs.writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 4));
}

module.exports = {
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const whitelistData = loadWhitelist();

        if (whitelistData.whitelisted_users.includes(user.id)) {
            // Remove from whitelist
            whitelistData.whitelisted_users = whitelistData.whitelisted_users.filter(id => id !== user.id);
            saveWhitelist(whitelistData);

            return interaction.reply({
                content: `❌ Removed **${user.tag}** from the AutoBan whitelist.`,
                ephemeral: true
            });
        } else {
            // Add to whitelist
            whitelistData.whitelisted_users.push(user.id);
            saveWhitelist(whitelistData);

            return interaction.reply({
                content: `✅ Added **${user.tag}** to the AutoBan whitelist.`,
                ephemeral: true
            });
        }
    }
};

/**
 * @file Voice Limit Subcommand
 * @description Allows the owner or an admin to set a user limit for their temporary VC.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");

const TEMP_VC_FILE = path.join(__dirname, "../../../../data/temp_vcs.json");

/**
 * Dynamically loads the temp VC data.
 */
function loadTempVCs() {
    if (!fs.existsSync(TEMP_VC_FILE)) return {};
    return JSON.parse(fs.readFileSync(TEMP_VC_FILE, "utf8"));
}

module.exports = {
    async execute(interaction) {
        const { member } = interaction;
        const userVC = member.voice.channel;
        const newLimit = interaction.options.getInteger("number");

        if (!userVC) {
            return interaction.reply({
                content: "❌ You must be in a temporary voice channel to use this command.",
                ephemeral: true
            });
        }

        const tempVCs = loadTempVCs();
        const tempVCData = tempVCs[userVC.id];

        if (!tempVCData) {
            return interaction.reply({
                content: "❌ This command can only be used in a temporary voice channel.",
                ephemeral: true
            });
        }

        // Check if the user is the owner or an admin
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!isAdmin && tempVCData.owner_id !== member.id) {
            return interaction.reply({
                content: "❌ You must be the **owner** of this temporary voice channel to set a limit.",
                ephemeral: true
            });
        }

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

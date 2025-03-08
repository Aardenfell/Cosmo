/**
 * @file Voice Rename Subcommand
 * @description Allows the owner or an admin to rename the temporary VC.
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

/**
 * Saves updated temp VC data.
 */
function saveTempVCs(data) {
    fs.writeFileSync(TEMP_VC_FILE, JSON.stringify(data, null, 4), "utf8");
}

module.exports = {
    async execute(interaction) {
        const { member } = interaction;
        const userVC = member.voice.channel;
        const newName = interaction.options.getString("name").trim();

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
                content: "❌ You must be the **owner** of this temporary voice channel to rename it.",
                ephemeral: true
            });
        }

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

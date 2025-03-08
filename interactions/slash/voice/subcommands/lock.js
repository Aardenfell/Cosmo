/**
 * @file Voice Lock Subcommand
 * @description Prevent users from joining the temporary VC.
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
        const { member, guild } = interaction;
        const userVC = member.voice.channel;

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
                content: "❌ You must be the **owner** of this temporary voice channel to use this command.",
                ephemeral: true
            });
        }

        // Lock the VC by denying @everyone the Connect permission
        await userVC.permissionOverwrites.edit(guild.roles.everyone, {
            Connect: false
        });

        return interaction.reply({
            content: "🔒 This voice channel is now **locked**. New users cannot join!",
            ephemeral: true
        });
    }
};

/**
 * @file Voice Show Subcommand
 * @description Unhide the temporary VC for all users.
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

        // Unhide the channel by granting @everyone the View Channel permission
        await userVC.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: true
        });

        return interaction.reply({
            content: "✅ This voice channel is now **visible** to everyone!",
            ephemeral: true
        });
    }
};

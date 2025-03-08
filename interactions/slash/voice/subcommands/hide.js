/**
 * @file Voice Hide Subcommand
 * @description Hides the temporary VC from users who are not in the channel.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const TEMP_VC_FILE = path.join(__dirname, "../../../../data/temp_vcs.json");
const config = require("../../../../config.json");

// Load active VCs from storage
function loadActiveVCs() {
    if (!fs.existsSync(TEMP_VC_FILE)) return {};
    return JSON.parse(fs.readFileSync(TEMP_VC_FILE, "utf8"));
}

module.exports = {
    async execute(interaction) {
        const { member, guild } = interaction;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: "❌ You must be in a **temporary voice channel** to use this command.",
                ephemeral: true
            });
        }

        let activeTempVCs = loadActiveVCs();

        // Ensure the channel is a temporary VC
        if (!activeTempVCs[voiceChannel.id]) {
            return interaction.reply({
                content: "❌ This command can only be used in **temporary voice channels**.",
                ephemeral: true
            });
        }

        const isOwner = activeTempVCs[voiceChannel.id].owner_id === member.id;
        const isAdmin = member.roles.cache.has(config.permissions.admin);

        if (!isOwner && !isAdmin) {
            return interaction.reply({
                content: "❌ Only the **VC owner** or an **admin** can hide this channel.",
                ephemeral: true
            });
        }

        // Modify permissions to hide the VC from non-members
        await voiceChannel.permissionOverwrites.edit(guild.id, {
            ViewChannel: false
        });

        return interaction.reply({
            content: "✅ This voice channel is now **hidden** from non-members.",
            ephemeral: true
        });
    }
};

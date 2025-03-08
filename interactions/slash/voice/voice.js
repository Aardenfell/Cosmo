/**
 * @file Voice Command Handler
 * @description Manage temporary voice channels (VCs).
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");
const config = require("../../../config.json");

const TEMP_VC_FILE = path.join(__dirname, "../../../data/temp_vcs.json");

function loadTempVCs() {
    if (!fs.existsSync(TEMP_VC_FILE)) return {};
    return JSON.parse(fs.readFileSync(TEMP_VC_FILE, "utf8"));
}

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("voice")
        .setDescription("Manage temporary voice channels.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("hide")
                .setDescription("Make the VC hidden for non-members.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("show")
                .setDescription("Unhide the VC for all users.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("lock")
                .setDescription("Prevent users from joining the VC.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("unlock")
                .setDescription("Allow users to join the VC.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("rename")
                .setDescription("Rename the temporary VC.")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("The new name for the VC.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("limit")
                .setDescription("Set a user limit for the VC.")
                .addIntegerOption(option =>
                    option.setName("number")
                        .setDescription("The max number of users.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("claim")
                .setDescription("Assign ownership of VC to yourself.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("vc_limit")
                .setDescription("Modify the temporary VC limit. (Admin Only)")
                .addIntegerOption(option =>
                    option.setName("limit")
                        .setDescription("The maximum number of active temp VCs.")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const { member, guild } = interaction;
        const subcommand = interaction.options.getSubcommand();
        const subcommandsPath = path.join(__dirname, "subcommands");

        // Ensure the user is in a voice channel
        const userVC = member.voice.channel;
        if (!userVC) {
            return interaction.reply({
                content: "❌ You must be in a temporary voice channel to use this command.",
                ephemeral: true
            });
        }

        // Check if the VC is a tracked temporary VC
        const tempVCData = loadTempVCs()[userVC.id];
        if (!tempVCData) {
            return interaction.reply({
                content: "❌ This command can only be used in a temporary voice channel.",
                ephemeral: true
            });
        }

        // Check if the user is the owner of the temp VC or an admin
        const isAdmin = hasAdminRole(member);
        if (!isAdmin && tempVCData.owner_id !== member.id) {
            return interaction.reply({
                content: "❌ You must be the **owner** of this temporary voice channel to use this command.",
                ephemeral: true
            });
        }

        // Try executing the specific subcommand
        try {
            const subcommandFile = require(`${subcommandsPath}/${subcommand}.js`);
            await subcommandFile.execute(interaction);
        } catch (error) {
            console.error(`❌ Subcommand '${subcommand}' not found.`);
            return interaction.reply({
                content: "❌ Invalid subcommand.",
                ephemeral: true
            });
        }
    }
};

/**
 * @file Voice Command Handler
 * @description Manage temporary voice channels (VCs).
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { SlashCommandBuilder } = require("discord.js");
const path = require("path");

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
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandsPath = path.join(__dirname, "subcommands");

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

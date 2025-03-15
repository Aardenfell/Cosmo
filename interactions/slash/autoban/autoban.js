/**
 * @file AutoBan Command Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("path");

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("autoban")
        .setDescription("Manage the AutoBan system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName("whitelist")
                .setDescription("Add or remove a user from the AutoBan whitelist.")
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("The user to whitelist or remove.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("toggle")
                .setDescription("Enable or disable the AutoBan system.")
                .addBooleanOption(option =>
                    option
                        .setName("state")
                        .setDescription("Enable or disable AutoBan.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("setminage")
                .setDescription("Set the minimum account age required to join (in hours).")
                .addIntegerOption(option =>
                    option
                        .setName("hours")
                        .setDescription("The minimum number of hours an account must be old to join.")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandsPath = path.join(__dirname, "subcommands");

        try {
            const subcommandFile = require(`${subcommandsPath}/${subcommand}.js`);
            await subcommandFile.execute(interaction);
        } catch (error) {
            console.error(`❌ Subcommand '${subcommand}' not found.`, error);
            return interaction.reply({
                content: "❌ Invalid subcommand.",
                ephemeral: true
            });
        }
    }
};

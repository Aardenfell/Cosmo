/**
 * @file Counting Command Handler
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
        .setName("counting")
        .setDescription("Manage the counting system.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("channel")
                .setDescription("Set the channel for counting. (Admin only)")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel where counting should take place.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("toggle")
                .setDescription("Enable or disable the counting system. (Admin only)")
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

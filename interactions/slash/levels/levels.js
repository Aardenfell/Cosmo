/**
 * @file Levels Command Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.1
 */

const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("levels")
        .setDescription("Manage and check the leveling system.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("info")
                .setDescription("Check your level or someone else's.")
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("The user whose level you want to check.")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("leaderboard")
                .setDescription("View the top XP earners in the server.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("method")
                .setDescription("Toggle an XP earning method on or off. (Admin only)")
                .addStringOption(option =>
                    option.setName("method")
                        .setDescription("The XP method to toggle (message_xp, voice_xp, reaction_xp)")
                        .setRequired(true)
                        .addChoices(
                            { name: "Message XP", value: "message_xp" },
                            { name: "Voice XP", value: "voice_xp" },
                            { name: "Reaction XP", value: "reaction_xp" }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Set a user's level or XP. (Admin only)")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user whose level or XP you want to set.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("type")
                        .setDescription("What to set (level or XP).")
                        .setRequired(true)
                        .addChoices(
                            { name: "Level", value: "level" },
                            { name: "XP", value: "xp" }
                        )
                )
                .addIntegerOption(option =>
                    option.setName("amount")
                        .setDescription("The amount to set.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription("Reset all users' XP and levels. (Admin only)")
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

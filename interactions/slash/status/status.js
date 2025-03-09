/**
 * @file Status Command Handler
 * @description Allows admins to change the bot's status dynamically, including a custom text status.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.3.0
 */

const { SlashCommandBuilder, ActivityType } = require("discord.js");

/**
 * Updates bot presence dynamically
 */
function updatePresence(client, type, message) {
    const presenceData = {
        status: "online",
    };

    if (type === "CUSTOM") {
        presenceData.activities = [{ type: ActivityType.Custom, name: message }];
    } else {
        const activityTypes = {
            PLAYING: ActivityType.Playing,
            WATCHING: ActivityType.Watching,
            LISTENING: ActivityType.Listening,
        };

        presenceData.activities = [{ name: message, type: activityTypes[type.toUpperCase()] }];
    }

    client.user.setPresence(presenceData);
}

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Manage the bot's status.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Set a new status for the bot.")
                .addStringOption(option =>
                    option.setName("type")
                        .setDescription("The type of status (Custom, Playing, Watching, Listening)")
                        .setRequired(true)
                        .addChoices(
                            { name: "Custom (Just Text)", value: "CUSTOM" },
                            { name: "Playing", value: "PLAYING" },
                            { name: "Watching", value: "WATCHING" },
                            { name: "Listening", value: "LISTENING" }
                        )
                )
                .addStringOption(option =>
                    option.setName("message")
                        .setDescription("The custom status message.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("clear")
                .setDescription("Clear the bot's status.")
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "❌ You do not have permission to change the bot's status.",
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const client = interaction.client;

        try {
            if (subcommand === "set") {
                let type = interaction.options.getString("type").toUpperCase();
                let message = interaction.options.getString("message");

                updatePresence(client, type, message);
                
                return interaction.reply({
                    content: `✅ Bot status updated to **${type.toLowerCase()} ${message}**`,
                    ephemeral: true
                });
            }

            if (subcommand === "clear") {
                client.user.setPresence({ status: "idle", activities: [] });

                setTimeout(() => {
                    client.user.setPresence({ status: "online", activities: [] });
                }, 1000);

                return interaction.reply({
                    content: "✅ Bot status has been cleared.",
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error("Error updating bot status:", error);
            return interaction.reply({
                content: "❌ An error occurred while updating the status.",
                ephemeral: true
            });
        }
    }
};

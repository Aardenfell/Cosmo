/**
 * @file Levels Config Modal Handler
 * @description Handles user input for modifying the leveling system configuration.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.3.0
 */

const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const config = require("../../../config.json");

/**
 * Saves the updated config file.
 */
function saveConfig(updatedConfig) {
    fs.writeFileSync("./config.json", JSON.stringify(updatedConfig, null, 4), "utf8");
}

/**
 * Generates the updated configuration embed.
 */
function getUpdatedConfigEmbed() {
    return new EmbedBuilder()
        .setColor("#8f69f8")
        .setTitle("📜 Leveling Configuration Updated")
        .setDescription("Modify the leveling system settings using the select menu below.")
        .addFields(
            { name: "🔧 General Settings", value: `**Enabled:** ${config.leveling.enabled ? "✅ Yes" : "❌ No"}` },
            {
                name: "💬 Message XP",
                value: `**Enabled:** ${config.leveling.xp_methods.message_xp.enabled ? "✅ Yes" : "❌ No"}
                **Min XP:** ${config.leveling.xp_methods.message_xp.min_xp} 
                **Max XP:** ${config.leveling.xp_methods.message_xp.max_xp}
                **Cooldown:** ${config.leveling.xp_methods.message_xp.cooldown}s`
            },
            {
                name: "🎤 Voice XP",
                value: `**Enabled:** ${config.leveling.xp_methods.voice_xp.enabled ? "✅ Yes" : "❌ No"}
                **Min XP:** ${config.leveling.xp_methods.voice_xp.min_xp}
                **Max XP:** ${config.leveling.xp_methods.voice_xp.max_xp}
                **Cooldown:** ${config.leveling.xp_methods.voice_xp.cooldown}s`
            },
            {
                name: "📌 Reaction XP",
                value: `**Enabled:** ${config.leveling.xp_methods.reaction_xp.enabled ? "✅ Yes" : "❌ No"}
                **Min XP:** ${config.leveling.xp_methods.reaction_xp.min_xp}
                **Max XP:** ${config.leveling.xp_methods.reaction_xp.max_xp}
                **Cooldown:** ${config.leveling.xp_methods.reaction_xp.cooldown}s`
            },
            {
                name: "📊 Level Formula",
                value: `**Base XP:** ${config.leveling.level_formula.base_xp}
                **Multiplier:** ${config.leveling.level_formula.multiplier}`
            },
            {
                name: "🔔 Level-up Messages",
                value: `**Enabled:** ${config.leveling.levelup_messages.enabled ? "✅ Yes" : "❌ No"}
                **Channel:** <#${config.leveling.levelup_messages.channel_id}>`
            }
        )
        .setFooter({ text: "Select a setting below to modify it." });
}

module.exports = {
    id: "level_config_input", // Keep a static ID for detection
    async execute(interaction) {
        if (!interaction.customId.startsWith("level_config_input:")) return;

        const inputValue = interaction.fields.getTextInputValue("config_input");
        const selectedOption = interaction.customId.split(":")[1]; // Extract the setting name

        // Ensure the input is a valid number
        if (isNaN(inputValue)) {
            return interaction.reply({ content: "❌ Please enter a valid number.", ephemeral: true });
        }

        let keys = selectedOption.split(".");
        let target = config.leveling;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
                return interaction.reply({
                    content: "❌ An error occurred while updating the setting.",
                    ephemeral: true
                });
            }
            target = target[keys[i]];
        }

        let lastKey = keys[keys.length - 1];
        target[lastKey] = parseFloat(inputValue); // Convert input to number

        saveConfig(config);

        // Retrieve original ephemeral interaction
        const originalInteraction = interaction.client.ephemeralMessages?.get(interaction.user.id);
        if (originalInteraction) {
            await originalInteraction.editReply({ embeds: [getUpdatedConfigEmbed()] });
        }
        
        return interaction.deferUpdate();
    }
};

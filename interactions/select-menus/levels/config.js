/**
 * @file Levels Config Select Menu Handler
 * @description Handles modifications to the leveling system using a select menu.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const config = require("../../../config.json");

/**
 * Saves the updated config file.
 */
function saveConfig(updatedConfig) {
    fs.writeFileSync("./config.json", JSON.stringify(updatedConfig, null, 4), "utf8");
}

/**
 * Updates and sends the configuration embed.
 */
async function updateConfigEmbed(interaction) {
    const embed = new EmbedBuilder()
        .setColor("#8f69f8")
        .setTitle("📜 Leveling Configuration")
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

    return interaction.update({ embeds: [embed] });
}

module.exports = {
    id: "level_config_select",
    async execute(interaction) {
        const selectedOption = interaction.values[0];

        // Boolean settings (toggle instantly)
        const booleanSettings = [
            "enabled",
            "xp_methods.message_xp.enabled",
            "xp_methods.voice_xp.enabled",
            "xp_methods.reaction_xp.enabled",
            "levelup_messages.enabled"
        ];

        // If the selected option is a boolean, toggle it directly
        if (booleanSettings.includes(selectedOption)) {
            let keys = selectedOption.split(".");
            let target = config.leveling;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) return;
                target = target[keys[i]];
            }

            let lastKey = keys[keys.length - 1];
            target[lastKey] = !target[lastKey]; // Toggle value

            saveConfig(config);

            return updateConfigEmbed(interaction);
        }

        // If the selected option requires input, open a modal
        const modal = new ModalBuilder()
            .setCustomId(`level_config_input:${selectedOption}`)
            .setTitle("Modify Leveling Setting");

        const input = new TextInputBuilder()
            .setCustomId("config_input")
            .setLabel("Enter the new value")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter a number or channel ID");

        modal.addComponents(new ActionRowBuilder().addComponents(input));

        await interaction.showModal(modal);
    }
};

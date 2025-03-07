/**
 * @file Levels Config Subcommand
 * @description View or modify the leveling configuration.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const config = require("../../../../config.json");

/**
 * Saves the updated config file.
 */
function saveConfig(updatedConfig) {
    fs.writeFileSync("./config.json", JSON.stringify(updatedConfig, null, 4), "utf8");
}

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

module.exports = {
    async execute(interaction) {
        const { member, options } = interaction;
        const field = options.getString("field");
        const value = options.getString("value");

        // If no field is provided, show current config
        if (!field) {
            const embed = new EmbedBuilder()
                .setColor("#8f69f8")
                .setTitle("📜 Leveling Configuration")
                .setDescription("Here is the current leveling configuration:")
                .addFields(
                    { name: "Leveling Enabled", value: config.leveling.enabled ? "✅ Enabled" : "❌ Disabled", inline: true },
                    { name: "Message XP", value: config.leveling.xp_methods.message_xp.enabled ? "✅ On" : "❌ Off", inline: true },
                    { name: "Voice XP", value: config.leveling.xp_methods.voice_xp.enabled ? "✅ On" : "❌ Off", inline: true },
                    { name: "Reaction XP", value: config.leveling.xp_methods.reaction_xp.enabled ? "✅ On" : "❌ Off", inline: true },
                    { name: "Base XP", value: `${config.leveling.level_formula.base_xp}`, inline: true },
                    { name: "XP Multiplier", value: `${config.leveling.level_formula.multiplier}`, inline: true },
                    { name: "Level-up Messages", value: config.leveling.levelup_messages.enabled ? "✅ On" : "❌ Off", inline: true },
                    { name: "Level-up Channel", value: `<#${config.leveling.levelup_messages.channel_id}>`, inline: true }
                );

            return interaction.reply({ embeds: [embed] });
        }

        // Admin check for modifications
        if (!hasAdminRole(member)) {
            return interaction.reply({ content: "❌ You do not have permission to modify the configuration.", ephemeral: true });
        }

        // Ensure the field exists in config
        let keys = field.split(".");
        let target = config.leveling;

        for (let i = 0; i < keys.length - 1; i++) {
            if (target[keys[i]] === undefined) {
                return interaction.reply({ content: `❌ Invalid field: ${field}`, ephemeral: true });
            }
            target = target[keys[i]];
        }

        let lastKey = keys[keys.length - 1];
        if (target[lastKey] === undefined) {
            return interaction.reply({ content: `❌ Invalid field: ${field}`, ephemeral: true });
        }

        // Convert the value to correct type
        let newValue = value;
        if (typeof target[lastKey] === "boolean") {
            newValue = value.toLowerCase() === "true";
        } else if (!isNaN(value)) {
            newValue = parseFloat(value);
        }

        // Update config
        target[lastKey] = newValue;
        saveConfig(config);

        return interaction.reply({
            content: `✅ Successfully updated **${field}** to **${newValue}**.`,
            ephemeral: true
        });
    }
};

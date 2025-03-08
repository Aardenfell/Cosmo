/**
 * @file Levels Config Subcommand
 * @description View or modify the leveling configuration with an interactive select menu.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.4.0
 */

const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
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
        const { member } = interaction;

        // Ensure user is an admin
        if (!hasAdminRole(member)) {
            return interaction.reply({ content: "❌ You do not have permission to modify the configuration.", ephemeral: true });
        }

        // Create an improved embed layout
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

        // Create a select menu for modifying settings
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("level_config_select")
            .setPlaceholder("📌 Select a setting to modify")
            .addOptions(
                { label: "Toggle Leveling", value: "enabled", description: "Enable/Disable the leveling system" },
                { label: "Toggle Message XP", value: "xp_methods.message_xp.enabled", description: "Enable/Disable Message XP" },
                { label: "Set Message XP Min", value: "xp_methods.message_xp.min_xp", description: "Set minimum XP for messages" },
                { label: "Set Message XP Max", value: "xp_methods.message_xp.max_xp", description: "Set maximum XP for messages" },
                { label: "Set Message XP Cooldown", value: "xp_methods.message_xp.cooldown", description: "Set cooldown for message XP" },
                { label: "Toggle Voice XP", value: "xp_methods.voice_xp.enabled", description: "Enable/Disable Voice XP" },
                { label: "Set Voice XP Min", value: "xp_methods.voice_xp.min_xp", description: "Set minimum XP for voice activity" },
                { label: "Set Voice XP Max", value: "xp_methods.voice_xp.max_xp", description: "Set maximum XP for voice activity" },
                { label: "Set Voice XP Cooldown", value: "xp_methods.voice_xp.cooldown", description: "Set cooldown for voice XP" },
                { label: "Toggle Reaction XP", value: "xp_methods.reaction_xp.enabled", description: "Enable/Disable Reaction XP" },
                { label: "Set Reaction XP Min", value: "xp_methods.reaction_xp.min_xp", description: "Set minimum XP for reactions" },
                { label: "Set Reaction XP Max", value: "xp_methods.reaction_xp.max_xp", description: "Set maximum XP for reactions" },
                { label: "Set Reaction XP Cooldown", value: "xp_methods.reaction_xp.cooldown", description: "Set cooldown for reaction XP" },
                { label: "Set Base XP", value: "level_formula.base_xp", description: "Set XP needed for Level 1" },
                { label: "Set XP Multiplier", value: "level_formula.multiplier", description: "Adjust XP scaling factor" },
                { label: "Toggle Level-up Messages", value: "levelup_messages.enabled", description: "Enable/Disable level-up messages" },
                { label: "Set Level-up Channel", value: "levelup_messages.channel_id", description: "Set channel for level-up messages" }
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};

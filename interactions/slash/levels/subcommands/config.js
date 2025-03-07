/**
 * @file Levels Config Subcommand
 * @description View or modify the leveling configuration with a detailed guide.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.3.0
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

        // If no field is provided, show full config with a guide
        if (!field) {
            const embed = new EmbedBuilder()
                .setColor("#8f69f8")
                .setTitle("📜 Leveling Configuration")
                .setDescription(
                    "🔧 **Current Settings:**\n" +
                    `**Leveling Enabled:** ${config.leveling.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
                    `**Message XP:** ${config.leveling.xp_methods.message_xp.enabled ? "✅ On" : "❌ Off"} (Min: ${config.leveling.xp_methods.message_xp.min_xp}, Max: ${config.leveling.xp_methods.message_xp.max_xp}, Cooldown: ${config.leveling.xp_methods.message_xp.cooldown}s)\n` +
                    `**Voice XP:** ${config.leveling.xp_methods.voice_xp.enabled ? "✅ On" : "❌ Off"} (Min: ${config.leveling.xp_methods.voice_xp.min_xp}, Max: ${config.leveling.xp_methods.voice_xp.max_xp}, Cooldown: ${config.leveling.xp_methods.voice_xp.cooldown}s)\n` +
                    `**Reaction XP:** ${config.leveling.xp_methods.reaction_xp.enabled ? "✅ On" : "❌ Off"} (Min: ${config.leveling.xp_methods.reaction_xp.min_xp}, Max: ${config.leveling.xp_methods.reaction_xp.max_xp}, Cooldown: ${config.leveling.xp_methods.reaction_xp.cooldown}s)\n` +
                    `**Base XP:** ${config.leveling.level_formula.base_xp} | **XP Multiplier:** ${config.leveling.level_formula.multiplier}\n` +
                    `**Level-up Messages:** ${config.leveling.levelup_messages.enabled ? "✅ On" : "❌ Off"} | **Channel:** <#${config.leveling.levelup_messages.channel_id}>\n\n` +
                    "📖 **How to Modify Settings:**\n" +
                    "Use `/levels config <field> <value>` to modify a setting.\n\n" +
                    "**✅ Available Fields:**\n" +
                    "1️⃣ **General Settings**\n" +
                    "`enabled` - Turns leveling system on/off (`true` or `false`).\n\n" +
                    "2️⃣ **XP Methods**\n" +
                    "`xp_methods.message_xp.enabled` - Enable/Disable message XP (`true` or `false`).\n" +
                    "`xp_methods.message_xp.min_xp` - Minimum XP per message.\n" +
                    "`xp_methods.message_xp.max_xp` - Maximum XP per message.\n" +
                    "`xp_methods.message_xp.cooldown` - Cooldown (in seconds) between XP gains.\n\n" +
                    "`xp_methods.voice_xp.enabled` - Enable/Disable voice XP (`true` or `false`).\n" +
                    "`xp_methods.voice_xp.min_xp` - Minimum XP per minute in VC.\n" +
                    "`xp_methods.voice_xp.max_xp` - Maximum XP per minute in VC.\n" +
                    "`xp_methods.voice_xp.cooldown` - Cooldown (in seconds).\n\n" +
                    "`xp_methods.reaction_xp.enabled` - Enable/Disable reaction XP (`true` or `false`).\n" +
                    "`xp_methods.reaction_xp.min_xp` - Minimum XP per reaction.\n" +
                    "`xp_methods.reaction_xp.max_xp` - Maximum XP per reaction.\n" +
                    "`xp_methods.reaction_xp.cooldown` - Cooldown (in seconds).\n\n" +
                    "3️⃣ **Level Formula**\n" +
                    "`level_formula.base_xp` - XP needed for **level 1**.\n" +
                    "`level_formula.multiplier` - Scaling factor for level-up difficulty.\n\n" +
                    "4️⃣ **Level-up Messages**\n" +
                    "`levelup_messages.enabled` - Enable/Disable level-up messages (`true` or `false`).\n" +
                    "`levelup_messages.channel_id` - ID of the level-up announcement channel.\n\n" +
                    "**🛠️ Example Modifications:**\n" +
                    "`/levels config enabled false` *(Disable leveling system)*\n" +
                    "`/levels config xp_methods.message_xp.enabled false` *(Turn off message XP)*\n" +
                    "`/levels config xp_methods.voice_xp.cooldown 600` *(Set voice XP cooldown to 600s)*"
                )
                .setFooter({ text: "Use valid fields and values to modify settings." });

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
                return interaction.reply({ content: `❌ Invalid field: **${field}**\nCheck the **Available Fields** section in the guide.`, ephemeral: true });
            }
            target = target[keys[i]];
        }

        let lastKey = keys[keys.length - 1];
        if (target[lastKey] === undefined) {
            return interaction.reply({ content: `❌ Invalid field: **${field}**\nCheck the **Available Fields** section in the guide.`, ephemeral: true });
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

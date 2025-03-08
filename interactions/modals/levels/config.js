/**
 * @file Levels Config Modal Handler
 * @description Handles user input for modifying the leveling system configuration.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
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

module.exports = {
    id: "level_config_input",
    async execute(interaction) {
        const inputValue = interaction.fields.getTextInputValue("config_input");
        const [_, selectedOption] = interaction.customId.split(":");

        // Ensure the input is a valid number
        if (isNaN(inputValue)) {
            return interaction.reply({ content: "❌ Please enter a valid number.", ephemeral: true });
        }

        let keys = selectedOption.split(".");
        let target = config.leveling;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) return;
            target = target[keys[i]];
        }

        let lastKey = keys[keys.length - 1];
        target[lastKey] = parseFloat(inputValue); // Convert input to number

        saveConfig(config);

        // Update the original embed
        const embed = new EmbedBuilder()
            .setColor("#8f69f8")
            .setTitle("📜 Leveling Configuration Updated")
            .setDescription(`✅ **${selectedOption}** has been updated to **${inputValue}**.`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

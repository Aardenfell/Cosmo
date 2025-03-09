/**
 * @file Counting System Event Handler
 * @description Handles counting in a specific channel and enforces rules.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.1
 */

const { Events } = require("discord.js");
const fs = require("fs");
const path = "./data/counting.json";
const config = require("../config.json");

module.exports = {
    name: Events.MessageCreate,
    
    /**
     * @description Executes when a message is created and handles counting logic.
     * @param {import('discord.js').Message} message The message object.
     */
    async execute(message) {
        // Ignore messages from bots and check if counting is enabled
        if (message.author.bot || !config.counting.enabled) return;

        // Ensure the message is in the correct counting channel
        if (message.channel.id !== config.counting.channel_id) return;

        // Load current counting data
        let data;
        try {
            data = JSON.parse(fs.readFileSync(path, "utf8"));
        } catch (err) {
            data = { current_count: 0, last_user: null };
        }

        // Extract number from message
        const number = parseInt(message.content.trim(), 10);

        if (isNaN(number)) return; // Ignore non-numeric messages

        // Validate counting sequence
        if (number === data.current_count + 1 && message.author.id !== data.last_user) {
            // Update count
            data.current_count = number;
            data.last_user = message.author.id;
            fs.writeFileSync(path, JSON.stringify(data, null, 4));
            await message.react("✅"); // Correct count reaction
        } else {
            // Reset count and notify user
            await message.react("❌");
            await message.reply(`<@${message.author.id}> RUINED IT AT ${data.current_count + 1}!! Next number is 1. Wrong number.`);
            data.current_count = 0;
            data.last_user = null;
            fs.writeFileSync(path, JSON.stringify(data, null, 4));
        }
    }
};

/**
 * @file Counting System Event Handler
 * @description Handles counting in a specific channel and enforces rules.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.1
 */

const { Events } = require("discord.js");
const fs = require("fs");
const path = "./data/counting.json";

module.exports = {
    name: Events.MessageCreate,
    
    /**
     * @description Executes when a message is created and handles counting logic.
     * @param {import('discord.js').Message} message The message object.
     */
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Dynamically load config on each execution
        let config;
        try {
            config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
        } catch (err) {
            console.error("Error loading config.json:", err);
            return;
        }

        // Ensure counting is enabled and in the correct channel
        if (!config.counting?.enabled || message.channel.id !== config.counting.channel_id) return;

        // Load current counting data
        let data;
        try {
            data = JSON.parse(fs.readFileSync(path, "utf8"));
        } catch (err) {
            // Initialize counting data if file read fails
            data = { current_count: 0, last_user: null };
        }

        // Extract number from message
        const number = parseInt(message.content.trim(), 10);

        // Ignore non-numeric messages
        if (isNaN(number)) return;

        // Validate counting sequence
        if (number === data.current_count + 1 && message.author.id !== data.last_user) {
            // Update count
            data.current_count = number;
            data.last_user = message.author.id;
            fs.writeFileSync(path, JSON.stringify(data, null, 4));
            await message.react("✅"); // Correct count reaction
        } else {
            // Determine the reason for failure
            const failReason = (message.author.id === data.last_user)
                ? "You can't count two numbers in a row."
                : "Wrong number.";

            // Reset count and notify user
            await message.react("❌");
            await message.reply(`<@${message.author.id}> RUINED IT AT ${data.current_count + 1}!! Next number is 1. ${failReason}`);

            // Reset counting data
            data.current_count = 0;
            data.last_user = null;
            fs.writeFileSync(path, JSON.stringify(data, null, 4));
        }
    }
};

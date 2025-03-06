/**
 * @file Message XP Handler for Leveling System (Refactored)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { addXP } = require("../utils/leveling");
const config = require("../config.json");

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot || !config.leveling.enabled || !config.leveling.xp_methods.message_xp.enabled) return;

        const { min_xp, max_xp } = config.leveling.xp_methods.message_xp;
        const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;

        // Call the centralized XP function
        await addXP(message.author.id, message.guild, xpGain, "message_xp");
    }
};

/**
 * @file Reaction XP Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { addXP } = require("./leveling");
const config = require("../config.json");

async function handleReactionXP(reaction, user) {
    if (!config.leveling.enabled || !config.leveling.xp_methods.reaction_xp.enabled) return;
    if (user.bot) return; // Ignore bot reactions

    const { min_xp, max_xp } = config.leveling.xp_methods.reaction_xp;
    const guild = reaction.message.guild;
    if (!guild) return; // Ensure it's a guild reaction

    const xpGain = Math.floor(Math.random() * (max_xp - min_xp + 1)) + min_xp;

    // Calling `addXP()` to handle XP and save data
    await addXP(user.id, guild, xpGain, "reaction_xp");
}

module.exports = { handleReactionXP };

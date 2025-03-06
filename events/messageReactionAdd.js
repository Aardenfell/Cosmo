/**
 * @file Reaction Event Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { handleReactionXP } = require("../utils/reactionXP");

module.exports = {
    name: "messageReactionAdd",

    async execute(reaction, user) {
        if (user.bot) return; // Ignore bot reactions

        await handleReactionXP(reaction, user);
    }
};

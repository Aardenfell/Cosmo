/**
 * @file Reaction Event Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { handleReactionXP } = require("../utils/reactionXP");

module.exports = {
    name: "messageReactionAdd",

    async execute(reaction, user) {
        if (user.bot) return; // Ignore bot reactions

        // ✅ If the message is not cached, fetch it
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                console.error("❌ Failed to fetch uncached message:", error);
                return;
            }
        }

        await handleReactionXP(reaction, user);
    }
};

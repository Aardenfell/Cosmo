/**
 * @file Reaction Event Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.1
 */

const { handleReactionXP } = require("../utils/reactionXP");

module.exports = {
    name: "messageReactionAdd",

    async execute(reaction, user) {
        if (user.bot) return; // ✅ Ignore bot reactions

        // ✅ If the message is not cached, fetch it
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch(); // ✅ Fetch full message content
            } catch (error) {
                console.error("❌ Failed to fetch old message:", error);
                return;
            }
        }

        // ✅ Fetch all existing reactions on the message
        await reaction.message.reactions.cache.forEach(async (r) => {
            try {
                await r.users.fetch(); // ✅ Fetch all users who reacted
            } catch (error) {
                console.error("⚠️ Could not fetch users for reaction:", error);
            }
        });

        await handleReactionXP(reaction, user);
    }
};

/**
 * @file Shard Resume Event Handler (Handles reconnects after downtime)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { handleRecovery } = require("../utils/downDetector");

module.exports = {
    name: "shardResume",

    /**
     * @description Executes when the bot reconnects after a disconnect.
     * @param {number} shardId The shard ID that resumed.
     * @param {import("discord.js").Client} client The bot client.
     */
    async execute(shardId, client) {
        console.log(`🔄 Shard ${shardId} resumed connection.`);
        
        if (!client || typeof client.channels?.fetch !== "function") {
            console.error("❌ Client is not properly initialized in shardResume event.");
            return;
        }

        await handleRecovery(client);
    }
};

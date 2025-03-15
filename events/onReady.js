/**
 * @file Ready Event File (Handles bot startup and downtime recovery messages)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { handleRecovery } = require("../utils/downDetector");

module.exports = {
	name: "ready",
	once: true,

	async execute(client) {
		console.log(`✅ Ready! Logged in as ${client.user.tag}`);

		// Call downDetector's recovery function
		await handleRecovery(client);
	},
};

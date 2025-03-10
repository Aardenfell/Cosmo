/**
 * @file Ready Event File.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

module.exports = {
	name: "ready",
	once: true,

	/**
	 * @description Executes when client is ready (bot initialization).
	 * @param {import('../typings').Client} client Main Application Client.
	 */
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

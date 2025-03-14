/**
 * @file Main trigger handler file.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.1
 */

module.exports = {
	name: "messageCreate",

	/**
	 * @description Executes when a message is created and handle it.
	 * @author Aardenfell
	 * @param {import('discord.js').Message & { client: import('../typings').Client }} message The message which was created.
	 */

	async execute(message) {
		// Ignore bot messages
		if (message.author.bot) return;

		const messageContent = message.content.toLowerCase();
		let triggered = false;

		// Loop through all registered triggers
		for (const trigger of message.client.triggers.values()) {
			if (triggered) break; // Stop checking if a trigger was already executed

			for (const name of trigger.name) {
				if (triggered) break;

				// Prevent meme triggers from running in DMs
				if (!message.guild && trigger.isMeme) continue;

				// Create regex with word boundaries to prevent partial matches
				const regex = new RegExp(`\\b${name}\\b`, "i");

				// If message contains the trigger word
				if (regex.test(messageContent)) {
					try {
						await trigger.execute(message);
					} catch (error) {
						console.error(error);
						message.reply({
							content: "❌ There was an error trying to execute that trigger!",
						});
					}

					// Mark trigger as executed and stop further matches
					triggered = true;
					break;
				}
			}
		}
	},
};

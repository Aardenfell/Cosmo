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

		// Extract words from the message
		const args = message.content.split(/ +/);

		// Flag to determine if a trigger has been executed
		let triggered = false;

		// Loop through all registered triggers
		message.client.triggers.every((trigger) => {
			if (triggered) return false; // Stop checking if a trigger was already executed

			// Loop through each keyword in the trigger's name array
			trigger.name.forEach(async (name) => {
				if (triggered) return;

				// If message contains the trigger word
				if (message.content.includes(name)) {
					try {
						await trigger.execute(message, args);
					} catch (error) {
						message.reply({
							content: "❌ There was an error trying to execute that trigger!",
						});
					}

					// Mark trigger as executed and stop checking further
					triggered = true;
					return false;
				}
			});

			return true; // Continue checking other triggers if none have executed
		});
	},
};

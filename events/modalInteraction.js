/**
 * @file Modal Interaction Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { InteractionType } = require("discord-api-types/v10");

module.exports = {
	name: "interactionCreate",

	/**
	 * @description Executes when an interaction is created and handles it.
	 * @author Aardenfell
	 * @param {import('discord.js').Interaction & { client: import('../typings').Client }} interaction The interaction which was created
	 */
	async execute(interaction) {
		// Deconstruct client from interaction object
		const { client } = interaction;

		// Ensure this is a modal submission interaction
		if (interaction.type !== InteractionType.ModalSubmit) return;

		// First, check for an exact static match (original logic)
		let command = client.modalCommands.get(interaction.customId);

		// If no exact match, check for dynamic IDs by looking for handlers with matching prefixes
		if (!command) {
			for (const [key, value] of client.modalCommands) {
				if (interaction.customId.startsWith(key + ":")) {
					command = value;
					break;
				}
			}
		}

		// If no valid handler was found, return an error message
		if (!command) {
			await require("../messages/defaultModalError").execute(interaction);
			return;
		}

		// Attempt to execute the interaction
		try {
			await command.execute(interaction);
		} catch (err) {
			console.error(err);
			await interaction.reply({
				content: "There was an issue while processing this modal!",
				ephemeral: true,
			});
		}
	},
};

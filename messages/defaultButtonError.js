/**
 * @file Default Error Message On Error Button Interaction
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

module.exports = {
	/**
	 * @description Executes when the button interaction could not be fetched.
	 * @author Aardenfell
	 * @param {import('discord.js').ButtonInteraction} interaction The Interaction Object of the command.
	 */

	async execute(interaction) {
		await interaction.reply({
			content: "There was an issue while fetching this button!",
			ephemeral: true,
		});
		return;
	},
};

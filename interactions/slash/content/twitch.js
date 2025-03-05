/**
 * @file Twitch Streamer Management Slash Command
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../../config.json");

const streamersFilePath = path.join(__dirname, "../../../data/twitch-streamers.json");


/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

/**
 * Read the latest streamers list dynamically.
 */
function getStreamers() {
	try {
		const data = fs.readFileSync(streamersFilePath, "utf8");
		return JSON.parse(data).streamers || [];
	} catch (error) {
		console.error("Error reading Twitch streamers file:", error);
		return [];
	}
}

/**
 * Save the updated streamers list back to the JSON file.
 * @param {Array} streamers - The updated list of streamers.
 */
function saveStreamers(streamers) {
	try {
		fs.writeFileSync(streamersFilePath, JSON.stringify({ streamers }, null, 4), "utf8");
	} catch (error) {
		console.error("Error saving Twitch streamers file:", error);
	}
}

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName("twitch")
		.setDescription("Manage the Twitch streamers list.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Add a streamer to the Twitch announcements.")
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription("The Twitch username of the streamer.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Remove a streamer from the Twitch announcements.")
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription("The Twitch username of the streamer.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("list").setDescription("List all tracked Twitch streamers.")
		),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const streamerName = interaction.options.getString("name")?.toLowerCase();
		const streamers = getStreamers();
		const member = interaction.member;

		// Restrict "add" and "remove" to Admins only
		if (["add", "remove"].includes(subcommand) && !hasAdminRole(member)) {
			return await interaction.reply({
				content: "❌ You do not have permission to use this command.",
				ephemeral: true,
			});
		}

		if (subcommand === "add") {
			if (streamers.includes(streamerName)) {
				return await interaction.reply({
					content: `⚠️ **${streamerName}** is already in the Twitch announcement list.`,
					ephemeral: true,
				});
			}

			streamers.push(streamerName);
			saveStreamers(streamers);
			return await interaction.reply({
				content: `✅ **${streamerName}** has been added to the Twitch announcement list.`,
				ephemeral: true,
			});
		}

		if (subcommand === "remove") {
			if (!streamers.includes(streamerName)) {
				return await interaction.reply({
					content: `⚠️ **${streamerName}** is not in the Twitch announcement list.`,
					ephemeral: true,
				});
			}

			const updatedStreamers = streamers.filter((name) => name !== streamerName);
			saveStreamers(updatedStreamers);
			return await interaction.reply({
				content: `❌ **${streamerName}** has been removed from the Twitch announcement list.`,
				ephemeral: true,
			});
		}

		if (subcommand === "list") {
			if (streamers.length === 0) {
				return await interaction.reply({
					content: "📢 There are no Twitch streamers currently being tracked.",
					ephemeral: true,
				});
			}

			const embed = new EmbedBuilder()
				.setColor("#6441A5")
				.setTitle("🎮 Tracked Twitch Streamers")
				.setDescription(streamers.map((name) => `- **${name}**`).join("\n"));

			return await interaction.reply({ embeds: [embed] });
		}
	},
};

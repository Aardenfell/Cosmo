/**
 * @file YouTube Channel Management Slash Command
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { getChannelId } = require("../../../utils/youtube");

const streamersFilePath = path.join(__dirname, "../../../data/youtube-streamers.json");

/**
 * Read the latest YouTube streamers list dynamically.
 */
function getYouTubeStreamers() {
	try {
		const data = fs.readFileSync(streamersFilePath, "utf8");
		return JSON.parse(data).streamers || [];
	} catch (error) {
		console.error("Error reading YouTube streamers file:", error);
		return [];
	}
}

/**
 * Save the updated YouTube streamers list.
 * @param {Array} streamers - The updated list of streamers.
 */
function saveYouTubeStreamers(streamers) {
	try {
		fs.writeFileSync(streamersFilePath, JSON.stringify({ streamers }, null, 4), "utf8");
	} catch (error) {
		console.error("Error saving YouTube streamers file:", error);
	}
}

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName("youtube")
		.setDescription("Manage the YouTube tracking list.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Add a YouTube channel to tracking.")
				.addStringOption((option) =>
					option
						.setName("name_or_id")
						.setDescription("The YouTube @handle or Channel ID.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Remove a YouTube channel from tracking.")
				.addStringOption((option) =>
					option
						.setName("name_or_id")
						.setDescription("The YouTube @handle or Channel ID.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("list").setDescription("List all tracked YouTube channels.")
		),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const input = interaction.options.getString("name_or_id");
		const streamers = getYouTubeStreamers();

		if (subcommand === "add") {
			await interaction.deferReply({ ephemeral: true });

			// Convert @handle to channel ID if needed
			let channelId = input.startsWith("@") ? await getChannelId(input) : input;
			if (!channelId) {
				return await interaction.editReply({
					content: `❌ Could not find a YouTube channel for **${input}**.`,
					ephemeral: true,
				});
			}

			// Check if the channel is already tracked
			if (streamers.some((s) => s.channel_id === channelId)) {
				return await interaction.editReply({
					content: `⚠️ **${input}** is already being tracked.`,
					ephemeral: true,
				});
			}

			streamers.push({ channel_id: channelId, name: input });
			saveYouTubeStreamers(streamers);

			return await interaction.editReply({
				content: `✅ **${input}** has been added to the YouTube tracking list.`,
				ephemeral: true,
			});
		}

		if (subcommand === "remove") {
			const updatedStreamers = streamers.filter((s) => s.channel_id !== input && s.name !== input);

			if (updatedStreamers.length === streamers.length) {
				return await interaction.reply({
					content: `⚠️ **${input}** is not in the YouTube tracking list.`,
					ephemeral: true,
				});
			}

			saveYouTubeStreamers(updatedStreamers);
			return await interaction.reply({
				content: `❌ **${input}** has been removed from the YouTube tracking list.`,
				ephemeral: true,
			});
		}

		if (subcommand === "list") {
			if (streamers.length === 0) {
				return await interaction.reply({
					content: "📢 No YouTube channels are currently being tracked.",
					ephemeral: true,
				});
			}

			const embed = new EmbedBuilder()
				.setColor("#FF0000")
				.setTitle("📺 Tracked YouTube Channels")
				.setDescription(streamers.map((s) => `- **${s.name}** (\`${s.channel_id}\`)`).join("\n"));

			return await interaction.reply({ embeds: [embed] });
		}
	},
};

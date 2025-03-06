/**
 * @file Welcome Event Handler for New Members
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.1
 */

const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: "guildMemberAdd",

    async execute(member) {
        const welcomeChannelId = config.welcome.channel_id; // Channel ID for welcome messages
        const welcomeImageUrl = config.welcome.image_url; // Large banner image
        const thumbnailUrl = config.welcome.thumbnail_url; // Small image

        if (!welcomeChannelId) {
            console.error("Welcome channel ID is not set in config.json!");
            return;
        }

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) {
            console.error(`Channel ID ${welcomeChannelId} not found.`);
            return;
        }

        // Get the current member count
        const memberCount = member.guild.memberCount;

        // Create the welcome embed
        const embed = new EmbedBuilder()
            .setColor("#8f69f8") // Soft purple for a cozy feel
            .setTitle("✧ Cosmic Cove ✧")
            .setDescription(`✧ Welcome ${member} to the ✧ Cosmic Cove ✧! You are our **${memberCount}th** member. ʚ♡ɞ˚`)
            .setImage(welcomeImageUrl) // Large banner image
            .setThumbnail(thumbnailUrl) // Small image
            .setFooter({ text: "Enjoy your stay in the Cosmic Cove!" });

        // Send the welcome message
        channel.send({ embeds: [embed] });
    }
};

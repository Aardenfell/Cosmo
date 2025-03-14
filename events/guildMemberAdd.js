/**
 * @file Welcome Event Handler for New Members
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.1
 */

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
    name: "guildMemberAdd",

    async execute(member) {
        const welcomeChannelId = config.welcome.channel_id; // Channel ID for welcome messages
        const imagePath = path.resolve(__dirname, "..", config.welcome.image_url); // Large banner image
        const thumbnailPath = path.resolve(__dirname, "..", config.welcome.thumbnail_url); // Small image

        if (!welcomeChannelId) {
            console.error("Welcome channel ID is not set in config.json!");
            return;
        }

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) {
            console.error(`Channel ID ${welcomeChannelId} not found.`);
            return;
        }

        const bannerAttachment = new AttachmentBuilder(imagePath);
        const thumbnailAttachment = new AttachmentBuilder(thumbnailPath);


        // Get the current member count
        const memberCount = member.guild.memberCount;

        // Create the welcome embed
        const embed = new EmbedBuilder()
            .setColor("#8f69f8") // Soft purple for a cozy feel
            .setTitle("✧ Cosmic Cove ✧")
            .setDescription(`✧ Welcome ${member} to the ✧ Cosmic Cove ✧! You are our **${memberCount}th** member. ʚ♡ɞ˚`)
            .setImage(`attachment://${path.basename(imagePath)}`) // Large banner image
            .setThumbnail(`attachment://${path.basename(thumbnailPath)}`) // Small image
            .setFooter({ text: "Enjoy your stay in the Cosmic Cove!" });

        // Send the welcome message
        channel.send({ embeds: [embed], files: [bannerAttachment, thumbnailAttachment] });
    }
};

/**
 * @file YouTube Video Upload Announcement Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const Parser = require("rss-parser");
const { getYouTubeStreamers, getSeenVideos, saveSeenVideos } = require("../utils/youtube");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes (previously 5)
const parser = new Parser();

/**
 * Periodically check for new YouTube video uploads via RSS.
 */
async function checkYouTubeVideos(client) {
    const announceChannelId = config.youtube.announce_channel;
    if (!announceChannelId) {
        console.error("YouTube announce channel is not set in config.json!");
        return;
    }

    const streamers = getYouTubeStreamers();
    const seenVideos = getSeenVideos();

    for (const { channel_id, name } of streamers) {
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel_id}`;

        try {
            const feed = await parser.parseURL(feedUrl);
            if (!feed.items.length) continue;

            const latestVideo = feed.items[0]; // Newest video
            if (seenVideos[channel_id] === latestVideo.id) continue; // Skip if already posted

            seenVideos[channel_id] = latestVideo.id;
            saveSeenVideos(seenVideos);

            announceYouTubeVideo(client, announceChannelId, latestVideo, name);
        } catch (error) {
            console.error(`Error fetching RSS feed for ${name}:`, error.message);
        }
    }
}

/**
 * Announce a new YouTube video upload.
 */
async function announceYouTubeVideo(client, channelId, videoData, streamerName) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error(`Channel ID ${channelId} not found.`);

    const roleMention = config.permissions.content_notifier
        ? `<@&${config.permissions.content_notifier}>`
        : "";

    const embed = new EmbedBuilder()
        .setColor("#FF0000") // YouTube red
        .setTitle(`${streamerName} uploaded a new video!`)
        .setURL(videoData.link)
        .setDescription(`**${videoData.title}**`)
        .setImage(videoData.enclosure?.url || config.youtube.default_thumbnail)
        .setFooter({ text: "Click the title to watch the video!" });

    channel.send({
        content: `${roleMention} 🎥 **${streamerName}** just uploaded a new video! Check it out!`,
        embeds: [embed]
    });
}

/**
 * Start the YouTube video check loop.
 */
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("YouTube video check (RSS) started.");
        setInterval(() => checkYouTubeVideos(client), CHECK_INTERVAL);
    }
};
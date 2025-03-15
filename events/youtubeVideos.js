/**
 * @file YouTube Announcement Handler (Streams & Videos via RSS)
 * @author Aardenfell
 * @since 1.0.0
 * @version 2.0.0
 */

const Parser = require("rss-parser");
const { getYouTubeStreamers, getSeenVideos, saveSeenVideos } = require("../utils/youtube");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 1000;
const parser = new Parser();

let isDowntime = false; // Global downtime flag

/**
 * Periodically check for new YouTube videos or livestreams via RSS.
 */
async function checkYouTubeContent(client) {
    if (isDowntime) {
        console.warn("⏸️ Skipping YouTube RSS check due to downtime.");
        return;
    }
    
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

            const latestContent = feed.items[0]; // Most recent content
            const videoId = latestContent.id.replace("yt:video:", ""); // Extract video ID
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            // ✅ Fix: Ensure metadata fields exist before accessing them
            const isLive =
                latestContent["media:group"]?.["media:community"]?.["media:starRating"] === undefined || // No rating = likely a stream
                latestContent["media:group"]?.["media:live"] === "true"; // Explicitly marked live

            // Prevent duplicate announcements
            if (seenVideos[channel_id] === videoId) continue;

            seenVideos[channel_id] = videoId;
            saveSeenVideos(seenVideos);

            // Announce based on content type
            if (isLive) {
                announceYouTubeLive(client, announceChannelId, latestContent, name, videoUrl);
            } else {
                announceYouTubeVideo(client, announceChannelId, latestContent, name, videoUrl);
            }
        } catch (error) {
            console.error(`Error fetching RSS feed for ${name}:`, error.message);
        }
    }
}


/**
 * Announce a new YouTube video upload.
 */
async function announceYouTubeVideo(client, channelId, videoData, streamerName, videoUrl) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error(`Channel ID ${channelId} not found.`);

    const roleMention = config.permissions.content_notifier ? `<@&${config.permissions.content_notifier}>` : "";

    const videoId = videoUrl.split("v=")[1];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    const embed = new EmbedBuilder()
        .setColor("#FF0000") // YouTube red
        .setTitle(`${streamerName} uploaded a new video!`)
        .setURL(videoUrl)
        .setDescription(`**${videoData.title}**`)
        .setImage(thumbnailUrl)
        .setFooter({ text: "Click the title to watch the video!" });

    channel.send({
        content: `${roleMention} 🎥 **${streamerName}** just uploaded a new video! Check it out!`,
        embeds: [embed]
    });
}

/**
 * Announce a YouTube livestream going live.
 */
async function announceYouTubeLive(client, channelId, streamData, streamerName, videoUrl) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error(`Channel ID ${channelId} not found.`);

    const roleMention = config.permissions.content_notifier ? `<@&${config.permissions.content_notifier}>` : "";

    const videoId = videoUrl.split("v=")[1];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    const embed = new EmbedBuilder()
        .setColor("#FF0000") // YouTube red
        .setTitle(`${streamerName} is now LIVE on YouTube!`)
        .setURL(videoUrl)
        .setDescription(`**${streamData.title}**`)
        .setImage(thumbnailUrl)
        .setFooter({ text: "Click the title to watch the stream!" });

    channel.send({
        content: `${roleMention} 📺 **${streamerName}** is now live! Go check them out!`,
        embeds: [embed]
    });
}

/**
 * Start the YouTube content check loop.
 */
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("✅ YouTube content check (RSS) started.");
        setInterval(() => checkYouTubeContent(client), CHECK_INTERVAL);
    }
};

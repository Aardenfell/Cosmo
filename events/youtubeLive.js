/**
 * @file YouTube Live Stream Announcement Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.1.0
 */

const { checkLiveStream, getYouTubeStreamers } = require("../utils/youtube");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes (Previously 1 minute) || Reduces amount of API calls
const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes (Skip API calls for offline users)

const liveStreamers = new Set(); // Tracks announced live streamers
const offlineCache = new Map(); // Cache to delay checking offline streamers

/**
 * Periodically check for live YouTube streams.
 */
async function checkYouTubeLive(client) {
    const announceChannelId = config.youtube.announce_channel;
    if (!announceChannelId) {
        console.error("YouTube announce channel is not set in config.json!");
        return;
    }

    const streamers = getYouTubeStreamers();
    const currentTime = Date.now();

    for (const { channel_id, name } of streamers) {
        // If a streamer was offline recently, skip checking them for CACHE_TIMEOUT
        if (offlineCache.has(channel_id) && currentTime - offlineCache.get(channel_id) < CACHE_TIMEOUT) {
            continue;
        }

        const liveStream = await checkLiveStream(channel_id);

        if (liveStream && !liveStreamers.has(channel_id)) {
            liveStreamers.add(channel_id);
            offlineCache.delete(channel_id); // Remove from offline cache
            announceLiveStream(client, announceChannelId, liveStream, name);
        } else if (!liveStream) {
            liveStreamers.delete(channel_id);
            offlineCache.set(channel_id, currentTime); // Add to offline cache
        }
    }
}

/**
 * Announce a YouTube stream going live.
 */
async function announceLiveStream(client, channelId, streamData, streamerName) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error(`Channel ID ${channelId} not found.`);

    const roleMention = config.permissions.content_notifier
        ? `<@&${config.permissions.content_notifier}>`
        : "";

    const embed = new EmbedBuilder()
        .setColor("#FF0000") // YouTube red
        .setTitle(`${streamerName} is now LIVE on YouTube!`)
        .setURL(streamData.url)
        .setDescription(`**${streamData.title}**`)
        .setImage(streamData.thumbnail.replace("{width}", "1280").replace("{height}", "720"))
        .setFooter({ text: "Click the title to watch the stream!" });

    channel.send({
        content: `${roleMention} 📺 **${streamerName}** is now live! Go check them out!`,
        embeds: [embed]
    });
}

/**
 * Start the YouTube live check loop.
 */
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("✅ YouTube live check started.");
        setInterval(() => checkYouTubeLive(client), CHECK_INTERVAL);
    }
};

/**
 * @file YouTube Video Upload Announcement Handler with Role Ping
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { getLatestVideo, getYouTubeStreamers, getSeenVideos, saveSeenVideos } = require("../utils/youtube");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Periodically check for new YouTube video uploads.
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
        const latestVideo = await getLatestVideo(channel_id);
        if (!latestVideo || seenVideos[channel_id] === latestVideo.id) continue;

        seenVideos[channel_id] = latestVideo.id;
        saveSeenVideos(seenVideos);

        announceYouTubeVideo(client, announceChannelId, latestVideo, name);
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
        .setURL(videoData.url)
        .setDescription(`**${videoData.title}**`)
        .setImage(videoData.thumbnail.replace("{width}", "1280").replace("{height}", "720"))
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
        console.log("YouTube video check started.");
        setInterval(() => checkYouTubeVideos(client), CHECK_INTERVAL);
    }
};

/**
 * @file YouTube Video Upload Announcement Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { getLatestVideo, getYouTubeStreamers, getSeenVideos, saveSeenVideos } = require("../utils/youtube");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function checkYouTubeVideos(client) {
    const announceChannelId = config.youtube.announce_channel;
    if (!announceChannelId) {
        console.error("YouTube announce channel not set in config.json!");
        return;
    }

    const streamers = getYouTubeStreamers();
    const seenVideos = getSeenVideos();

    for (const { channel_id, name } of streamers) {
        const latestVideo = await getLatestVideo(channel_id);
        if (!latestVideo || seenVideos[channel_id] === latestVideo.id) continue;

        seenVideos[channel_id] = latestVideo.id;
        saveSeenVideos(seenVideos);

        const channel = await client.channels.fetch(announceChannelId);
        if (!channel) return console.error(`Channel ID ${announceChannelId} not found.`);

        const videoEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`📢 New Video by ${name}!`)
            .setURL(latestVideo.url)
            .setDescription(`**${latestVideo.title}**`)
            .setThumbnail(latestVideo.thumbnail)
            .setFooter({ text: "Click the title to watch the video!" });

        channel.send({ embeds: [videoEmbed] });
    }
}

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("YouTube video check started.");
        setInterval(() => checkYouTubeVideos(client), CHECK_INTERVAL);
    }
};

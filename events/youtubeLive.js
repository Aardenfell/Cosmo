/**
 * @file YouTube Live Stream Announcement Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { checkLiveStream, getYouTubeStreamers, getSeenVideos, saveSeenVideos } = require("../utils/youtube");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 60 * 1000; // 60 seconds

async function checkYouTubeLive(client) {
    const announceChannelId = config.youtube.announce_channel;
    if (!announceChannelId) {
        console.error("YouTube announce channel not set in config.json!");
        return;
    }

    const streamers = getYouTubeStreamers();
    const seenVideos = getSeenVideos();

    for (const { channel_id, name } of streamers) {
        const liveStream = await checkLiveStream(channel_id);
        if (!liveStream || seenVideos[channel_id] === liveStream.id) continue;

        seenVideos[channel_id] = liveStream.id;
        saveSeenVideos(seenVideos);

        const channel = await client.channels.fetch(announceChannelId);
        if (!channel) return console.error(`Channel ID ${announceChannelId} not found.`);

        const liveEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`🔴 ${name} is LIVE on YouTube!`)
            .setURL(liveStream.url)
            .setDescription(`**${liveStream.title}**`)
            .setThumbnail(liveStream.thumbnail)
            .setFooter({ text: "Click the title to watch the live stream!" });

        channel.send({ embeds: [liveEmbed] });
    }
}

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("YouTube live check started.");
        setInterval(() => checkYouTubeLive(client), CHECK_INTERVAL);
    }
};

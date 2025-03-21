/**
 * @file Twitch Live Stream Announcement Handler
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { checkStreamerLive, getStreamers } = require("../utils/twitch");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

const CHECK_INTERVAL = 60 * 1000; // 60 seconds
const liveStreamers = new Set(); // Track announced streamers

/**
 * Periodically check for live Twitch streams.
 */
async function checkLiveStreams(client) {
    const announceChannelId = config.twitch.announce_channel;
    
    if (!announceChannelId) {
        console.error("Twitch announce channel is not set in config.json!");
        return;
    }

    const streamers = getStreamers(); // Always get the latest streamer list

    for (const twitchUsername of streamers) {
        const streamData = await checkStreamerLive(twitchUsername);

        if (streamData && !liveStreamers.has(twitchUsername)) {
            liveStreamers.add(twitchUsername);
            announceLiveStream(client, announceChannelId, streamData);
        } else if (!streamData) {
            liveStreamers.delete(twitchUsername);
        }
    }
}

/**
 * Announce a Twitch stream going live.
 */
async function announceLiveStream(client, channelId, streamData) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error(`Channel ID ${channelId} not found.`);

    const roleMention = config.permissions.content_notifier
        ? `<@&${config.permissions.content_notifier}>`
        : "";

    const embed = new EmbedBuilder()
        .setColor("#6441A5")
        .setTitle(`${streamData.user_name} is now LIVE on Twitch!`)
        .setURL(`https://www.twitch.tv/${streamData.user_login}`)
        .setDescription(`**${streamData.title}**\nCategory: ${streamData.game_name}`)
        .setImage(streamData.thumbnail_url.replace("{width}", "1280").replace("{height}", "720"))
        .setFooter({ text: "Click the title to watch the stream!" });

        channel.send({
            content: `${roleMention} 🎮 **${streamData.user_name}** is now live! Go check them out!`,
            embeds: [embed]
        });
}

/**
 * Start the Twitch live check loop.
 */
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log("✅ Twitch live check started.");
        setInterval(() => checkLiveStreams(client), CHECK_INTERVAL);
    }
};

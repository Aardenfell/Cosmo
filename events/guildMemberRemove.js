/**
 * @file Leave Message Handler for Members Leaving the Server
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const config = require("../config.json");

module.exports = {
    name: "guildMemberRemove",

    async execute(member) {
        const leaveChannelId = config.welcome.channel_id; // Uses the same welcome channel

        if (!leaveChannelId) {
            console.error("Leave channel ID is not set in config.json!");
            return;
        }

        const channel = member.guild.channels.cache.get(leaveChannelId);
        if (!channel) {
            console.error(`Channel ID ${leaveChannelId} not found.`);
            return;
        }

        const memberCount = member.guild.memberCount;

        channel.send(`✧ Goodbye ${member}! We are now at **${memberCount}** server members. ʚ♡ɞ˚`);
    }
};

/**
 * @file Voice Hub Handler (Creates and manages temporary voice chats)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { ChannelType, PermissionsBitField } = require("discord.js");
const config = require("../config.json");

const activeTempVCs = new Map(); // Track active temp VCs

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState) {
        if (!config.voice_hubs.enabled) return;

        const member = newState.member;
        const newChannel = newState.channel;
        const guild = newState.guild;

        if (!newChannel) return; // Ignore if user is leaving

        // Check if the joined channel is a hub
        const hubConfig = config.voice_hubs.hubs.find(h => h.channel_id === newChannel.id);
        if (!hubConfig) return;

        // Enforce VC limit
        if (activeTempVCs.size >= config.voice_hubs.vc_limit) {
            return member.send("❌ No available temporary voice channels. Try again later!");
        }

        // Create a new temp VC
        const tempVC = await guild.channels.create({
            name: `${hubConfig.base_name} - ${member.user.username}`,
            type: ChannelType.GuildVoice,
            parent: hubConfig.category_id,
            userLimit: config.voice_hubs.vc_user_limit,
            permissionOverwrites: [
                {
                    id: guild.id,
                    allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: member.id,
                    allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers],
                }
            ]
        });

        console.log(`✅ Created Temp VC: ${tempVC.name}`);

        // Move the user to the temp VC
        await member.voice.setChannel(tempVC);

        // Store the VC to track when to delete it
        activeTempVCs.set(tempVC.id, tempVC);
    }
};

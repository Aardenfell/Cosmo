/**
 * @file Voice Hub Handler (Creates and manages temporary voice chats)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.2.0
 */

const { ChannelType, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

const TEMP_VC_FILE = path.join(__dirname, "../data/temp_vcs.json");

// Load active VCs from storage
function loadActiveVCs() {
    if (!fs.existsSync(TEMP_VC_FILE)) return {};
    return JSON.parse(fs.readFileSync(TEMP_VC_FILE, "utf8"));
}

// Save active VCs to storage
function saveActiveVCs(data) {
    fs.writeFileSync(TEMP_VC_FILE, JSON.stringify(data, null, 4), "utf8");
}

// Initialize active VCs from storage
let activeTempVCs = loadActiveVCs();

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState) {
        if (!config.voice_hubs.enabled) return;

        const member = newState.member;
        const guild = newState.guild;
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        // **HANDLE USER JOINING HUB**
        if (newChannel) {
            const hubConfig = config.voice_hubs.hubs.find(h => h.channel_id === newChannel.id);
            if (hubConfig) {
                // Enforce VC limit
                if (Object.keys(activeTempVCs).length >= config.voice_hubs.vc_limit) {
                    return member.send("❌ No available temporary voice channels. Try again later!");
                }

                // Create a new temp VC
                const tempVC = await guild.channels.create({
                    name: `✧ ${hubConfig.base_name} ${member.user.username}'s VC ✧`,
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

                // Store the VC with proper structure
                activeTempVCs[tempVC.id] = {
                    owner_id: member.id,
                    created_at: Math.floor(Date.now() / 1000)
                };

                saveActiveVCs(activeTempVCs);
            }
        }

        // **HANDLE EMPTY TEMP VC DELETION**
        if (oldChannel && activeTempVCs[oldChannel.id]) {
            const tempVC = guild.channels.cache.get(oldChannel.id);

            if (tempVC && tempVC.members.size === 0) {
                console.log(`🗑 Deleting empty Temp VC: ${tempVC.name}`);
                await tempVC.delete();
                delete activeTempVCs[oldChannel.id];
                saveActiveVCs(activeTempVCs);
            }
        }
    }
};

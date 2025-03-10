/**
 * @file Voice Hub Handler (Creates and manages temporary voice chats)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.4.0
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

                // Fetch hub channel permissions
                const hubChannel = guild.channels.cache.get(hubConfig.channel_id);
                if (!hubChannel) return console.error(`❌ Hub channel not found: ${hubConfig.channel_id}`);

                let permissionOverwrites = hubChannel.permissionOverwrites.cache.map(overwrite => ({
                    id: overwrite.id,
                    allow: overwrite.allow,
                    deny: overwrite.deny
                }));

                // Ensure @everyone can connect by overriding the hub's restrictions
                permissionOverwrites = permissionOverwrites.map(perm =>
                    perm.id === guild.id
                        ? { ...perm, allow: perm.allow.add(PermissionsBitField.Flags.Connect), deny: perm.deny.remove(PermissionsBitField.Flags.Connect) }
                        : perm
                );

                // If @everyone doesn't exist in the overwrites, add it
                if (!permissionOverwrites.some(perm => perm.id === guild.id)) {
                    permissionOverwrites.push({
                        id: guild.id,
                        allow: [PermissionsBitField.Flags.Connect],
                        deny: []
                    });
                }

                // Add owner-specific permissions
                permissionOverwrites.push({
                    id: member.id,
                    allow: [
                        PermissionsBitField.Flags.ManageChannels,
                        PermissionsBitField.Flags.ManageRoles,
                        PermissionsBitField.Flags.MoveMembers,
                        PermissionsBitField.Flags.MuteMembers,
                        PermissionsBitField.Flags.DeafenMembers
                    ],
                    deny: []
                });

                // Create a new temp VC
                const tempVC = await guild.channels.create({
                    name: `✧${hubConfig.base_name} ${member.user.username}'s VC ✧`,
                    type: ChannelType.GuildVoice,
                    parent: hubConfig.category_id,
                    userLimit: config.voice_hubs.vc_user_limit,
                    permissionOverwrites
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

        // **HANDLE OWNER LEAVING (30-Second Grace Period)**
        if (oldChannel && activeTempVCs[oldChannel.id]) {
            const tempVC = guild.channels.cache.get(oldChannel.id);

            if (tempVC && oldState.member.id === activeTempVCs[oldChannel.id].owner_id) {
                setTimeout(async () => {
                    const updatedVC = guild.channels.cache.get(oldChannel.id);

                    if (!updatedVC) return; // Channel was deleted during delay

                    const remainingMembers = [...updatedVC.members.values()];
                    if (remainingMembers.length === 0) {
                        console.log(`🗑 Deleting empty Temp VC: ${updatedVC.name}`);
                        await updatedVC.delete();
                        delete activeTempVCs[oldChannel.id];
                        saveActiveVCs(activeTempVCs);
                        return;
                    }

                    // Select a new owner
                    const newOwner = remainingMembers[Math.floor(Math.random() * remainingMembers.length)];
                    activeTempVCs[oldChannel.id].owner_id = newOwner.id;
                    saveActiveVCs(activeTempVCs);

                    // Rename the VC to reflect new owner
                    const hubConfig = config.voice_hubs.hubs.find(h => h.category_id === updatedVC.parentId);
                    if (hubConfig) {
                        await updatedVC.setName(`✧${hubConfig.base_name} ${newOwner.user.username}'s VC ✧`);
                    }

                    console.log(`🔄 Transferred ownership to ${newOwner.user.username}`);
                }, 30000); // 30-second grace period
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

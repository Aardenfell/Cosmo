/**
 * @file Voice Hub Handler (Creates and manages temporary voice chats)
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.6.0
 */

const { ChannelType, PermissionsBitField, EmbedBuilder } = require("discord.js");
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
                if (Object.keys(activeTempVCs).length >= config.voice_hubs.vc_limit) {
                    return member.send("❌ No available temporary voice channels. Try again later!");
                }

                // Create a new temp VC
                const tempVC = await guild.channels.create({
                    name: `✧${hubConfig.base_name} ${member.user.username}'s VC ✧`,
                    type: ChannelType.GuildVoice,
                    parent: hubConfig.category_id,
                    userLimit: config.voice_hubs.vc_user_limit,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.ManageRoles,
                                PermissionsBitField.Flags.MoveMembers,
                                PermissionsBitField.Flags.MuteMembers,
                                PermissionsBitField.Flags.DeafenMembers
                            ],
                        }
                    ]
                });

                console.log(`✅ Created Temp VC: ${tempVC.name}`);
                await member.voice.setChannel(tempVC);

                // Store the VC
                activeTempVCs[tempVC.id] = { owner_id: member.id };
                saveActiveVCs(activeTempVCs);

                // Send embed to the built-in text chat of the VC
                await sendVcInfoEmbed(tempVC, member);
            }
        }

        // **HANDLE OWNER LEAVING (TRANSFER OWNERSHIP)**
        if (oldChannel && activeTempVCs[oldChannel.id]) {
            const tempVC = guild.channels.cache.get(oldChannel.id);
            if (!tempVC) return;

            if (oldState.member.id === activeTempVCs[oldChannel.id].owner_id) {
                setTimeout(async () => {
                    const updatedVC = guild.channels.cache.get(oldChannel.id);
                    if (!updatedVC) return;

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

                    // Update the built-in text chat embed for the new owner
                    await sendVcInfoEmbed(updatedVC, newOwner);
                }, 30000);
            }
        }
    }
};

/**
 * Fetches command IDs dynamically and sends an updated embed.
 */
async function sendVcInfoEmbed(voiceChannel, owner) {
    if (!voiceChannel) return;

    try {
        // Fetch the built-in text chat of the VC
        const textChannel = await voiceChannel.guild.channels.fetch(voiceChannel.id);
        if (!textChannel || textChannel.type !== ChannelType.GuildVoice) return;

        // Fetch command list and store IDs in a map
        const commands = await voiceChannel.guild.commands.fetch();
        const commandIds = {};
        for (const [id, command] of commands) {
            commandIds[command.name] = id;
        }

        // Create the embed with clickable commands and properly formatted placeholders
        const embed = new EmbedBuilder()
            .setColor("#8f69f8")
            .setTitle("🎙️ Temporary Voice Chat Controls")
            .setDescription("You have control over this voice chat. Use the following commands:")
            .addFields(
                { name: `</voice rename:${commandIds["voice"]}> \`<name>\``, value: "Rename your voice channel." },
                { name: `</voice limit:${commandIds["voice"]}> \`<number>\``, value: "Set a user limit for your voice channel." },
                { name: `</voice lock:${commandIds["voice"]}>`, value: "Lock the voice channel so no one else can join." },
                { name: `</voice unlock:${commandIds["voice"]}>`, value: "Unlock the voice channel to allow users to join." },
                { name: `</voice hide:${commandIds["voice"]}>`, value: "Hide the voice channel from non-members." },
                { name: `</voice show:${commandIds["voice"]}>`, value: "Show the voice channel to non-members." }
            )
            .setFooter({ text: "Use these commands to manage your temporary VC." });

        // Send the message
        await textChannel.send({ content: `🔔 <@${owner.id}>, you are the owner of this VC.`, embeds: [embed] });
    } catch (error) {
        console.error("❌ Failed to send VC info embed:", error);
    }
}

/**
 * @file Welcome & AutoBan Event Handler for New Members
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.2.0
 */

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

const WHITELIST_PATH = path.join(__dirname, "../data/autoban_whitelist.json");

/**
 * Load the autoban whitelist from storage
 */
function loadWhitelist() {
    if (!fs.existsSync(WHITELIST_PATH)) {
        fs.writeFileSync(WHITELIST_PATH, JSON.stringify({ whitelisted_users: [] }, null, 4));
    }
    return JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8")).whitelisted_users;
}

module.exports = {
    name: "guildMemberAdd",

    async execute(member) {
        const guild = member.guild;
        const welcomeChannelId = config.welcome.channel_id;
        const imagePath = path.resolve(__dirname, "..", config.welcome.image_url);
        const thumbnailPath = path.resolve(__dirname, "..", config.welcome.thumbnail_url);

        const autobanConfig = config.moderation?.autoban || {};
        const logChannelId = autobanConfig.log_channel;
        const minAccountAge = autobanConfig.min_account_age || 86400000; // Default to 1 day
        const whitelist = loadWhitelist();

        const accountCreationDate = member.user.createdAt;
        const accountAge = Date.now() - accountCreationDate.getTime();

        // ** AutoBan Logic **
        if (autobanConfig.enabled && !whitelist.includes(member.id)) {
            if (accountAge < minAccountAge) {
                try {
                    // **Send DM Notification**
                    const dmEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setTitle("🚨 AutoBan Notification")
                        .setDescription(
                            `Hello **${member.user.tag}**,  
                            You have been **automatically banned** from **${guild.name}** because your account is younger than **${minAccountAge / 3600000
                            } hours**.\n\n
                            If you believe this was a mistake, you may appeal by messaging **@aardenfell**.`
                        )
                        .setFooter({ text: "AutoBan System | Contact @aardenfell for an appeal." })
                        .setTimestamp();

                    await member.send({ embeds: [dmEmbed] }).catch(() => {
                        console.warn(`⚠️ Could not send DM to ${member.user.tag}. (DMs may be closed.)`);
                    });

                    // **Ban the User**
                    await member.ban({ reason: "Account younger than required age." });
                    console.log(`🔨 AutoBanned ${member.user.tag} (ID: ${member.id}) - Account too new.`);

                    // **Log autoban to moderation log channel**
                    const logChannel = guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setColor("#ff0000")
                            .setTitle("🚨 AutoBan Executed")
                            .setDescription(`**User:** ${member.user.tag} (${member.id})\n**Reason:** Account younger than required age.`)
                            .setFooter({ text: "Banned by AutoModeration System" })
                            .setTimestamp();

                        await logChannel.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.error(`❌ Failed to ban ${member.user.tag} (ID: ${member.id}):`, error);
                }
                return; // Exit early to prevent welcome message
            }
        }

        // ** Welcome Message Logic **
        if (!welcomeChannelId) {
            console.error("⚠️ Welcome channel ID is not set in config.json!");
            return;
        }

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) {
            console.error(`⚠️ Channel ID ${welcomeChannelId} not found.`);
            return;
        }

        const bannerAttachment = new AttachmentBuilder(imagePath);
        const thumbnailAttachment = new AttachmentBuilder(thumbnailPath);

        const memberCount = member.guild.memberCount;

        const embed = new EmbedBuilder()
            .setColor("#8f69f8")
            .setTitle("✧ Cosmic Cove ✧")
            .setDescription(`✧ Welcome ${member} to the ✧ Cosmic Cove ✧! You are our **${memberCount}th** member. ʚ♡ɞ˚`)
            .setImage(`attachment://${path.basename(imagePath)}`)
            .setThumbnail(`attachment://${path.basename(thumbnailPath)}`)
            .setFooter({ text: "Enjoy your stay in the Cosmic Cove!" });

        channel.send({ embeds: [embed], files: [bannerAttachment, thumbnailAttachment] });
    }
};

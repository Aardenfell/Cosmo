/**
 * @file Set XP/Level Command (Admin Only)
 * @author Aardenfell
 * @since 1.0.0
 * @version 2.0.0
 */

const { loadXPData, saveXPData, assignRoleRewards, getXPForNextLevel } = require("../../../../utils/leveling");
const config = require("../../../../config.json");

/**
 * Checks if the user has the admin role.
 */
function hasAdminRole(member) {
    return member.roles.cache.has(config.permissions.admin);
}

module.exports = {
    async execute(interaction) {
        if (interaction.options.getSubcommand() !== "set") return;

        const { guild, member } = interaction;
        if (!hasAdminRole(member)) {
            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser("user");
        const type = interaction.options.getString("type");
        const amount = interaction.options.getInteger("amount");

        let xpData = loadXPData();
        if (!xpData.users[targetUser.id]) {
            xpData.users[targetUser.id] = { xp: 0, level: 0, last_message_xp: 0, last_voice_xp: 0, last_reaction_xp: 0 };
        }

        const userXP = xpData.users[targetUser.id];

        if (type === "xp") {
            // Set XP directly
            userXP.xp = amount;

            // Check for level-ups
            while (userXP.xp >= getXPForNextLevel(userXP.level)) {
                userXP.xp -= getXPForNextLevel(userXP.level);
                userXP.level += 1;
            }
        } else if (type === "level") {
            // Set level directly
            userXP.level = amount;

            // Adjust XP so they are at the start of their new level
            userXP.xp = amount > 0 ? getXPForNextLevel(amount - 1) : 0;
        }

        saveXPData(xpData);

        // Fetch the guild member (needed for role rewards)
        const targetMember = await guild.members.fetch(targetUser.id);

        // Assign roles based on new level and trigger announcement
        await assignRoleRewards(targetMember, userXP.level);

        return interaction.reply({
            content: `✅ Successfully set **${targetUser.username}**'s ${type.toUpperCase()} to **${amount}**.`,
            ephemeral: true
        });
    }
};

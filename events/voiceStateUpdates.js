/**
 * @file Voice State Update Handler 
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const { activeVoiceUsers } = require("../utils/voiceTracking");
const config = require("../config.json");

module.exports = {
    name: "voiceStateUpdate",
    
    async execute(oldState, newState) {
        if (!config.leveling.enabled || !config.leveling.xp_methods.voice_xp.enabled) return;

        const userId = newState.member.id;

        // User joins a voice channel
        if (!oldState.channelId && newState.channelId) {
            console.log(`🎤 User ${newState.member.user.username} joined VC.`);
            activeVoiceUsers.set(userId, {
                joinedAt: Date.now(),
                lastXP: 0
            });
        }

        // User leaves a voice channel
        if (oldState.channelId && !newState.channelId) {
            console.log(`🚪 User ${newState.member.user.username} left VC.`);
            activeVoiceUsers.delete(userId);
        }
    }
};

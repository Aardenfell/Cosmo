/**
 * @file Voice State Update Handler 
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.3.0
 */

const { activeVoiceUsers } = require("../utils/voiceTracking");
const { startVoiceXP, stopVoiceXP } = require("../utils/voiceXP");
const config = require("../config.json");

module.exports = {
    name: "voiceStateUpdate",
    
    async execute(oldState, newState) {
        if (!config.leveling.enabled || !config.leveling.xp_methods.voice_xp.enabled) return;

        const userId = newState.member.id;
        const member = newState.member;

        // **User joins a voice channel**
        if (!oldState.channelId && newState.channelId) {
            console.log(`🎤 User ${member.user.username} joined VC.`);
            activeVoiceUsers.set(userId, {
                joinedAt: Date.now(),
                lastXP: 0
            });

            startVoiceXP(newState.client);
        }

        // **User leaves a voice channel OR gets deafened/server-muted/suppressed**
        if (
            (oldState.channelId && !newState.channelId) ||  // Left VC
            newState.serverDeaf || newState.selfDeaf ||  // Deafened
            newState.serverMute ||  // Server Muted
            newState.suppress // Suppressed (AFK or Stage listener)
        ) {
            console.log(`🚪 User ${member.user.username} left VC OR is muted/deafened/suppressed.`);
            activeVoiceUsers.delete(userId);
            stopVoiceXP();
        }
    }
};

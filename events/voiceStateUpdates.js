/**
 * @file Voice State Update Handler 
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.5.0
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
                lastXP: 0,
                paused: false // Tracking starts active
            });

            startVoiceXP(newState.client);
        }

        // **User leaves the VC entirely**
        if (oldState.channelId && !newState.channelId) {
            console.log(`🚪 User ${member.user.username} left VC.`);
            activeVoiceUsers.delete(userId);
            stopVoiceXP();
        }

        // **User deafens, server-mutes, or gets suppressed**
        if (
            !oldState.selfDeaf && newState.selfDeaf ||  // Self Deafened
            !oldState.serverDeaf && newState.serverDeaf ||  // Server Deafened
            !oldState.serverMute && newState.serverMute ||  // Server Muted
            !oldState.suppress && newState.suppress  // Suppressed (AFK/Stage)
        ) {
            console.log(`⏸️ User ${member.user.username} is now paused (Deafened, Muted, or Suppressed).`);

            if (activeVoiceUsers.has(userId)) {
                activeVoiceUsers.get(userId).paused = true;
            }
        }

        // **User undeafens, unmutes, or unsuppresses**
        if (
            oldState.selfDeaf && !newState.selfDeaf ||  // Undeafened
            oldState.serverDeaf && !newState.serverDeaf ||  // Server Undeafened
            oldState.serverMute && !newState.serverMute ||  // Server Unmuted
            oldState.suppress && !newState.suppress  // Unsuppressed
        ) {
            console.log(`▶️ User ${member.user.username} is now active in VC again.`);

            if (activeVoiceUsers.has(userId)) {
                activeVoiceUsers.get(userId).paused = false;
            } else {
                // If they somehow weren’t tracked before, start fresh
                activeVoiceUsers.set(userId, {
                    joinedAt: Date.now(),
                    lastXP: 0,
                    paused: false
                });

                startVoiceXP(newState.client);
            }
        }
    }
};

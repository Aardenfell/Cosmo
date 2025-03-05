/**
 * @file Twitch API Utility Functions
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const axios = require("axios");
const fs = require("fs");
const config = require("../config.json");

/**
 * Fetch Twitch OAuth Token
 */
let accessToken = null;
async function getTwitchToken() {
    try {
        const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                client_id: config.twitch.client_id,
                client_secret: config.twitch.client_secret,
                grant_type: "client_credentials"
            }
        });
        accessToken = response.data.access_token;
        return accessToken;
    } catch (error) {
        console.error("Error fetching Twitch token:", error.response?.data || error.message);
        return null;
    }
}

/**
 * Check if a Twitch streamer is live
 * @param {string} username - Twitch username
 * @returns {Object|null} Stream data if live, else null
 */
async function checkStreamerLive(username) {
    if (!accessToken) {
        await getTwitchToken();
    }

    try {
        const response = await axios.get("https://api.twitch.tv/helix/streams", {
            headers: {
                "Client-ID": config.twitch.client_id,
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                user_login: username
            }
        });

        return response.data.data[0] || null;
    } catch (error) {
        console.error(`Error checking stream for ${username}:`, error.response?.data || error.message);
        return null;
    }
}

/**
 * Dynamically get all streamers from `data/twitch-streamers.json`.
 */
function getStreamers() {
    try {
        const data = fs.readFileSync("./data/twitch-streamers.json", "utf8");
        return JSON.parse(data).streamers || [];
    } catch (error) {
        console.error("Error reading Twitch streamers file:", error);
        return [];
    }
}

module.exports = {
    getTwitchToken,
    checkStreamerLive,
    getStreamers
};

/**
 * @file YouTube API Utility Functions
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

const streamersFilePath = path.join(__dirname, "../data/youtube-streamers.json");
const seenVideosFilePath = path.join(__dirname, "../data/youtube-seen.json");

/**
 * Convert a YouTube @handle or username to a Channel ID.
 * @param {string} handle - YouTube handle (e.g., @ChannelName) or username.
 * @returns {Promise<string|null>} Channel ID if found, else null.
 */
async function getChannelId(handle) {
    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
            params: {
                key: config.youtube.api_key,
                forHandle: handle.replace("@", ""), // API requires no @ symbol
                part: "id"
            }
        });

        return response.data.items.length ? response.data.items[0].id : null;
    } catch (error) {
        console.error(`Error fetching channel ID for ${handle}:`, error.response?.data || error.message);
        return null;
    }
}

/**
 * Fetch the latest video for a given YouTube channel ID.
 * @param {string} channelId - YouTube Channel ID.
 * @returns {Object|null} Latest video object or null.
 */
async function getLatestVideo(channelId) {
    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                key: config.youtube.api_key,
                channelId: channelId,
                part: "snippet",
                order: "date",
                type: "video",
                maxResults: 1
            }
        });

        const video = response.data.items[0];
        if (!video) return null;

        return {
            id: video.id.videoId,
            title: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            thumbnail: video.snippet.thumbnails.high.url,
            publishedAt: video.snippet.publishedAt
        };
    } catch (error) {
        console.error(`Error fetching video for channel ${channelId}:`, error.response?.data || error.message);
        return null;
    }
}

/**
 * Check if a YouTube streamer is live.
 * @param {string} channelId - YouTube Channel ID.
 * @returns {Object|null} Live stream object or null.
 */
async function checkLiveStream(channelId) {
    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                key: config.youtube.api_key,
                channelId: channelId,
                part: "snippet",
                eventType: "live",
                type: "video",
                maxResults: 1
            }
        });

        const stream = response.data.items[0];
        if (!stream) return null;

        return {
            id: stream.id.videoId,
            title: stream.snippet.title,
            url: `https://www.youtube.com/watch?v=${stream.id.videoId}`,
            thumbnail: stream.snippet.thumbnails.high.url,
            publishedAt: stream.snippet.publishedAt
        };
    } catch (error) {
        console.error(`Error checking live stream for ${channelId}:`, error.response?.data || error.message);
        return null;
    }
}

/**
 * Get all YouTube streamers from the JSON file.
 */
function getYouTubeStreamers() {
    try {
        const data = fs.readFileSync(streamersFilePath, "utf8");
        return JSON.parse(data).streamers || [];
    } catch (error) {
        console.error("Error reading YouTube streamers file:", error);
        return [];
    }
}

/**
 * Get previously seen videos/streams.
 */
function getSeenVideos() {
    try {
        const data = fs.readFileSync(seenVideosFilePath, "utf8");
        return JSON.parse(data) || {};
    } catch {
        return {};
    }
}

/**
 * Save seen videos/streams to prevent duplicate announcements.
 * @param {Object} seenVideos - Object containing seen video IDs.
 */
function saveSeenVideos(seenVideos) {
    fs.writeFileSync(seenVideosFilePath, JSON.stringify(seenVideos, null, 4), "utf8");
}

module.exports = {
    getChannelId,
    getLatestVideo,
    checkLiveStream,
    getYouTubeStreamers,
    getSeenVideos,
    saveSeenVideos
};

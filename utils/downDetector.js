/**
 * @file Down Detector Utility - Tracks bot downtime and sends recovery updates
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const config = require("../config.json");

const DOWNTIME_LOG = path.join(__dirname, "../data/downtime_log.json");
const COUNTING_DATA = path.join(__dirname, "../data/counting.json");

/**
 * Load the last recorded downtime timestamp.
 */
function loadDowntimeLog() {
    if (!fs.existsSync(DOWNTIME_LOG)) {
        fs.writeFileSync(DOWNTIME_LOG, JSON.stringify({ last_downtime: null }, null, 4));
    }
    return JSON.parse(fs.readFileSync(DOWNTIME_LOG, "utf8"));
}

/**
 * Save downtime timestamp.
 */
function saveDowntimeTimestamp() {
    const data = { last_downtime: Date.now() };
    fs.writeFileSync(DOWNTIME_LOG, JSON.stringify(data, null, 4));
}

/**
 * Waits until the client is fully ready before executing a function.
 */
async function waitForClientReady(client) {
    if (!client || typeof client.once !== "function") {
        console.error("❌ Invalid client instance passed to waitForClientReady.");
        return;
    }

    if (client.readyAt) return; // Client is already ready

    return new Promise((resolve) => {
        client.once("ready", resolve);
    });
}

/**
 * Calculate downtime duration and send a recovery message.
 */
async function handleRecovery(client) {
    if (!client || typeof client.channels?.fetch !== "function") {
        console.error("❌ Invalid client instance passed to handleRecovery.");
        return;
    }

    const logData = loadDowntimeLog();
    if (!logData.last_downtime) return; // No recorded downtime

    const downtimeDuration = Date.now() - logData.last_downtime;
    const minutesDown = Math.round(downtimeDuration / 60000);

    console.log(`✅ Bot recovered after ${minutesDown} minute(s) of downtime.`);

    // Reset downtime log
    fs.writeFileSync(DOWNTIME_LOG, JSON.stringify({ last_downtime: null }, null, 4));

    // Wait for client to be fully ready before fetching channels
    await waitForClientReady(client);

    // Fetch the last counting number if available
    let lastNumber = "Unknown";
    if (fs.existsSync(COUNTING_DATA)) {
        const countData = JSON.parse(fs.readFileSync(COUNTING_DATA, "utf8"));
        lastNumber = countData.current_count || "Unknown";
    }

    // Get the counting channel
    const countingChannelId = config.counting.channel_id;
    if (!countingChannelId) {
        console.warn("⚠️ Counting channel ID is missing in config.");
        return;
    }

    try {
        const countingChannel = await client.channels.fetch(countingChannelId);
        if (countingChannel) {
            countingChannel.send(`🛠️ **Bot is back online!** It was down for **${minutesDown} minute(s)**.\n
The last counted number was **${lastNumber}**. Please continue from there.`);
        } else {
            console.warn(`⚠️ Counting channel (ID: ${countingChannelId}) not found.`);
        }
    } catch (error) {
        console.error(`❌ Failed to send recovery message: ${error.message}`);
    }
}



module.exports = { saveDowntimeTimestamp, handleRecovery };

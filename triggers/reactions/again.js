/**
 * @file Again Trigger command.
 * @author Aardenfell
 * @since 1.0.0
 * @version 1.0.0
 */

// For now, the only available property is name array. Not making the name array will result in an error.

const { AttachmentBuilder } = require("discord.js");
const path = require("path");

/**
 * @type {import('../../typings').TriggerCommand}
 */
module.exports = {
    name: ["again"],

    execute(message, args) {
        // Define the path to the image
        const imagePath = path.join(__dirname, "../../assets/again.gif");

        // Create an attachment
        const attachment = new AttachmentBuilder(imagePath);

        // Send the message with the image
        message.channel.send({
            files: [attachment]
        });
    },
};

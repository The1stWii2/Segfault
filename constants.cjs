require("dotenv").config();

const SKIP_REGISTERING = 0; //1 - Don't update/add commands, 0 - Do as needed, -1 Force update
const HASH_LOCATION = "./command_hash";
const COMMAND_LOCATION = "./commands";

const DELETE_COMMANDS_ON_UPDATE = false; //Used when removing commands.

const LOG_ALL = true;
const SHOW_TIMESTAMP_IN_CONSOLE = false;
const SHOW_DEBUG = true; //Show debug messages

const WEBHOOKS = [];
const webhooksList = process.env.WEBHOOKS.split(",");

for (const entry of webhooksList) {
	WEBHOOKS.push({
		name: entry.split(":")[0],
		value: entry.split(":")[0],
		address: entry.split(":")[1]
	});
}

module.exports = {
	SKIP_REGISTERING : SKIP_REGISTERING,
	HASH_LOCATION : HASH_LOCATION,
	COMMAND_LOCATION : COMMAND_LOCATION,
	DELETE_COMMANDS_ON_UPDATE : DELETE_COMMANDS_ON_UPDATE,
	LOG_ALL : LOG_ALL,
	SHOW_TIMESTAMP_IN_CONSOLE : SHOW_TIMESTAMP_IN_CONSOLE,
	SHOW_DEBUG : SHOW_DEBUG,
	WEBHOOKS : WEBHOOKS
};
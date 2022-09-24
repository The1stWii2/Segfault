export const APP_CONSTANTS = {
  SKIP_REGISTERING: 0, //1 - Don't update/add commands, 0 - Do as needed, -1 Force update
  HASH_LOCATION: "../command_hash",
  COMMAND_LOCATION: "./commands",

  DELETE_COMMANDS_ON_UPDATE: false, //Used when removing commands.

  LOG_ALL: true,
  SHOW_TIMESTAMP_IN_CONSOLE: false,
  SHOW_DEBUG: true, //Show debug messages

  //webhooksList: process.env.WEBHOOKS.split(","),
};

// for (const entry of webhooksList) {
// 	WEBHOOKS.push({
// 		name: entry.split(":")[0],
// 		value: entry.split(":")[0],
// 		address: entry.split(":")[1]
// 	});
// }

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { print, TEXT_LEVEL } from "./print.js";
import "dotenv/config";
import fs from "fs";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

//Constants
const DELETE_COMMANDS_ON_UPDATE = false; //Used when removing commands.
const COMMAND_LOCATION = "./commands";

async function getCommands() {
	//Get commands
	const commandList = [];
	const commandFiles = fs.readdirSync(COMMAND_LOCATION)
		.filter(file => file.endsWith(".cjs"));

	for (const file of commandFiles) {
		print("Loading command: " + file, TEXT_LEVEL.DEBUG);
		const command = await import(COMMAND_LOCATION + "/" + file);
		commandList.push(command.data.toJSON());
	}
	return commandList;
}

const GUILDS = [process.env.DEV_GUILD_ID, process.env.GUILD_ID];

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

async function updateCommands() {
	const commandList = await getCommands();

	if (DELETE_COMMANDS_ON_UPDATE)
		deleteCommands();

	//Add Global commands
	await rest.put(Routes.applicationCommands(process.env.APP_ID),
		{ body: commandList })
		.then(() => print("Successfully registered global commands."))
		.catch(console.error);

	/*
	//Add Guild commands
	await rest.put(Routes.applicationGuildCommands(process.env.APP_ID, GUILD_ID),
		{ body: commandList })
		.then(() => print("Successfully registered guild commands."))
		.catch(console.error);
	*/

	print("Finished registering commands.", TEXT_LEVEL.SUCCESS);
}

async function deleteCommands() {
	/*
	//Clean up Guild commands
	await rest.put(Routes.applicationGuildCommands(process.env.APP_ID, GUILD_ID), { body: [] })
		.then(() => print("Successfully deleted all guild commands."))
		.catch(console.error);
	*/

	//Clean up Global commands
	await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: [] })
		.then(() => print("Successfully deleted all application commands."))
		.catch(console.error);
}

updateCommands();

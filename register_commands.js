import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { print, TEXT_LEVEL } from "./lib/print.js";
import "dotenv/config";
import fs from "fs";

import * as seg from "./constants.cjs";

//Constants

async function getCommands() {
	//Get commands
	const commandList = [];
	const commandFiles = fs.readdirSync(seg.COMMAND_LOCATION)
		.filter(file => file.endsWith(".cjs"));

	for (const file of commandFiles) {
		print("Loading command: " + file, TEXT_LEVEL.DEBUG);
		const command = await import(seg.COMMAND_LOCATION + "/" + file);
		commandList.push(command.data.toJSON());
	}
	return commandList;
}

//const GUILDS = [process.env.DEV_GUILD_ID, process.env.GUILD_ID];

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

async function updateCommands() {
	const commandList = await getCommands();

	if (seg.DELETE_COMMANDS_ON_UPDATE)
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

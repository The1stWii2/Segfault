import * as discordJS from "discord.js";
import * as discordAPI from "discord-api-types/v9";
import { computeMetaHash } from "./meta_hash.js";
import { print, TEXT_LEVEL } from "./lib/print.js";
import "dotenv/config";
import fs from "fs";

import * as seg from "./constants.js";

//Start up
print("\n\n\n");
print("Starting...", TEXT_LEVEL.SUCCESS);

async function getCommands() {
	//Get commands
	const commandList = new discordJS.Collection();
	const commandFiles = fs.readdirSync(seg.COMMAND_LOCATION)
		.filter(file => file.endsWith(".cjs"));

	for (const file of commandFiles) {
		print("Loading command: " + file, TEXT_LEVEL.DEBUG);
		const command = await import(seg.COMMAND_LOCATION + "/" + file);
		commandList.set(command.data.name, command);
	}
	return commandList;
}

async function Main() {
	//Create a new client instance
	const botIntents = [
		1 << 0, //GUILDS
		1 << 5, //GUILD_WEBHOOKS
		1 << 9, //GUILD_MESSAGES
		1 << 10, //GUILD_MESSAGE_REACTIONS
		1 << 11, //GUILD_MESSAGE_TYPING
		1 << 12, //DIRECT_MESSAGES
		1 << 13, //DIRECT_MESSAGE_REACTIONS
		1 << 14, //DIRECT_MESSAGE_TYPING
		1 << 15, //MESSAGE_CONTENT
		1 << 16, //GUILD_SCHEDULED_EVENTS
	];
	const client = new discordJS.Client({ intents: botIntents });

	//Get commands
	client.commands = await getCommands();

	//Check whether we need to update commands
	const currentHash = await computeMetaHash("./commands");
	print("Current hash for commands is: " + currentHash.readBigInt64LE(0), TEXT_LEVEL.DEBUG);

	let prevHash = 0;
	try {
		prevHash = await fs.readFileSync(seg.HASH_LOCATION);
		print("Previous hash for commands is: " + prevHash.readBigInt64LE(0), TEXT_LEVEL.DEBUG);
	} catch (e) {
		if (e.code == "ENOENT") { //Catch No-such-file exceptions
			print("No previous command hash exists, one will be created.", TEXT_LEVEL.ERROR);
		} else {
			throw e;
		}
	}

	if (seg.SKIP_REGISTERING == -1 || prevHash == 0 || currentHash.readBigInt64LE(0) != prevHash.readBigInt64LE(0)) {
		//Register Guild commands
		if (seg.SKIP_REGISTERING != 1) {
			print("Commands updated, refreshing Guild commands...", TEXT_LEVEL.WARN);
			print("Command registration may be delayed.", TEXT_LEVEL.INFO);
			await import("./register_commands.js");
		} else {
			print("Skipping registering commands per rule.", TEXT_LEVEL.INFO);
		}

		//Update Hash
		try {
			fs.writeFileSync(seg.HASH_LOCATION, currentHash);
		} catch (e) {
			print("Failed to write hash!", TEXT_LEVEL.ERROR, true, false);
			throw e;
		}
	} else {
		print("Skipping registering commands.", TEXT_LEVEL.INFO);
	}

	//When the client is ready, run this code (only once)
	client.once("ready", () => {
		print("Ready!");
	});



	client.on("interactionCreate", async interaction => {
		console.log(discordAPI.InteractionType.SLASH_COMMAND_REPLY);
		switch (interaction.type) {
		case (discordAPI.InteractionType.ApplicationCommand): {
			//Slash Command
			print("Received interaction: " + String(interaction), TEXT_LEVEL.DEBUG);

			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				print(interaction.user.username + " <@" + interaction.user.id + "> called command: " + String(interaction), TEXT_LEVEL.INFO);
				await command.execute(interaction, client);
			} catch (error) {
				print(error, TEXT_LEVEL.ERROR, true);
				if (interaction.deferred)
					await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
			}
			break;
		}
		case (discordAPI.InteractionType.ModalSubmit): {
			//Modal Response
			print("Received response about model: " + String(interaction.customId), TEXT_LEVEL.DEBUG);

			const command = client.commands.get(interaction.customId);
			if (!command) return;

			try {
				print(interaction.user.username + " <@" + interaction.user.id + "> finished modal: " + String(interaction.customId), TEXT_LEVEL.INFO);
				await command.process(interaction, client);
			} catch (error) {
				print(error, TEXT_LEVEL.ERROR, true);
				if (interaction.deferred)
					await interaction.reply({ content: "There was an error while executing processing modal!", ephemeral: true });
			}
			break;
		}
		}
		return;
	});


	//Login
	client.login(process.env.DISCORD_TOKEN);

}

Main();
import { Client, Collection, IntentsBitField } from "discord.js";
import { computeMetaHash } from "./meta_hash.js";
import { print, TEXT_LEVEL } from "./print.js";
import "dotenv/config";
import fs from "fs";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

//Constants
const SLASH_COMMAND_REPLY = 2;
const SKIP_REGISTERING = false;
const HASH_LOCATION = "./command_hash";

//Start up
print("\n\n\n");
print("Starting...", TEXT_LEVEL.SUCCESS);

async function getCommands() {
	//Get commands
	const commandList = new Collection();
	const commandsPath = path.join(__dirname, "commands");
	const commandFiles = fs.readdirSync(commandsPath)
		.filter(file => file.endsWith(".cjs"));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		print("Loading command: " + file, TEXT_LEVEL.DEBUG);
		const command = await import("file://" + filePath); //HACK Import from string
		commandList.set(command.data.name, command);
	}
	return commandList;
}

async function Main() {
	//Create a new client instance
	const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });

	//Get commands
	client.commands = await getCommands();

	//Check whether we need to update commands
	const currentHash = await computeMetaHash(path.join(__dirname, "commands"));
	print("Current hash for commands is: " + currentHash.readBigInt64LE(0), TEXT_LEVEL.DEBUG);

	let prevHash = 0;
	try {
		prevHash = await fs.readFileSync(HASH_LOCATION);
		print("Previous hash for commands is: " + prevHash.readBigInt64LE(0), TEXT_LEVEL.DEBUG);
	} catch (e) {
		if (e.code == "ENOENT") { //Catch No-such-file exceptions
			print("No previous command hash exists, one will be created.", TEXT_LEVEL.ERROR);
		} else {
			throw e;
		}
	}

	if (prevHash == 0 || currentHash.readBigInt64LE(0) != prevHash.readBigInt64LE(0)) {
		//Register Guild commands
		if (!SKIP_REGISTERING) {
			print("Commands updated, refreshing Guild commands...", TEXT_LEVEL.WARN);
			print("Command registration may be delayed.", TEXT_LEVEL.INFO);
			await import("./register_commands.js");
		} else {
			print("Skipping registering commands per rule.", TEXT_LEVEL.INFO);
		}

		//Update Hash
		try {
			fs.writeFileSync(HASH_LOCATION, currentHash);
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
		if (interaction.type != SLASH_COMMAND_REPLY) return;

		print("Received interaction: " + String(interaction), TEXT_LEVEL.DEBUG);

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			print(error, TEXT_LEVEL.ERROR, true);
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	});


	//Login
	client.login(process.env.DISCORD_TOKEN);

}

Main();
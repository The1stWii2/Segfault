import * as discordJS from "discord.js";

export async function getMessage(id, client, guildID) {
	const { print, TEXT_LEVEL } = await import("./print.js");

	for (const channel of client.channels.cache) {
		//if (channel[1].guildId != guildID)
			//continue;
		if (!(await channel[1] instanceof discordJS.TextChannel))
			continue;
		try {
			const message = await channel[1].messages.fetch(id);
			print("Message found in " + channel[1].name, TEXT_LEVEL.DEBUG);
			return message;
		} catch (e) {
			print("Could not find message in " + channel[1].name, TEXT_LEVEL.DEBUG);
		}
	}

	throw ReferenceError("No such message");
}

export async function convertLink(input) {
	const linkHandler = await import("./link_handler.js");

	if (linkHandler.isValidURL(input)) {
		input = input.split("/");
		input = input[input.length - 1];
	}
	return input;
}
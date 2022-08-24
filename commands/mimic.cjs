const { SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mimic")
		.setDescription("Makes the bot say something")
		.addStringOption((option) =>
			option.setName("message")
				.setDescription("What to make the bot say")
				.setRequired(true)
		)
};

module.exports.execute = async (interaction) => {

	const LENGTH = 20;

	let message = interaction.options.getString("message");

	if (message.length > LENGTH) {
		message = message.substring(0, LENGTH - 3);
		while (/(?:[\W]|[<>()[\]{}])/.match(message.substring[message.length - 1]))
			message = message.substring(0, message.length - 1);
		message = message += "...";
	}

	interaction.channel.send(message);
	interaction.reply({ content: "Done!", ephemeral: true });
};
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

	interaction.channel.send(interaction.options.getString("message"));
	interaction.reply({ content: "Done!", ephemeral: true });
};
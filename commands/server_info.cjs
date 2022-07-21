const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Replies with server info!")
};

module.exports.execute = (interaction) => {
	interaction.reply(`Server name: ${interaction.guild.name}\n
	Total members: ${interaction.guild.memberCount}`);
};
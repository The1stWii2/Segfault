const discordJS = require("discord.js");

module.exports = {
	data: new discordJS.SlashCommandBuilder()
		.setName("server")
		.setDescription("Replies with server info! (dummy command)")
};

module.exports.execute = async (interaction) => {
	interaction.reply(`Server name: ${interaction.guild.name}\n
	Total members: ${interaction.guild.memberCount}`);
};
const discordJS = require("discord.js");

const ALLOWED_ROLES = [324957515051696128];

module.exports = {
	data: new discordJS.SlashCommandBuilder()
		.setName("create-resource")
		.setDescription("Uploads given message to assets channel")
};

module.exports.execute = (interaction, client) => {

	//console.log(client.channels.cache);

	const exampleEmbed = new discordJS.EmbedBuilder();
	exampleEmbed.setColor("#0099ff");
	exampleEmbed.setTitle("TITLE");
	exampleEmbed.setURL("https://discord.js.org/");
	exampleEmbed.setAuthor({ name: "Some name", iconURL: "https://i.imgur.com/AfFp7pu.png", url: "https://discord.js.org" });
	exampleEmbed.setDescription("Some description here");
	exampleEmbed.addFields(
		{ name: "Regular field title", value: "Some value here" },
	);
	exampleEmbed.setImage("https://i.imgur.com/AfFp7pu.png");
	exampleEmbed.setTimestamp();
	exampleEmbed.setFooter({ text: "Some footer text here", iconURL: "https://i.imgur.com/AfFp7pu.png" });

	client.channels.cache.get("959197193439440907").send({ embeds: [exampleEmbed] });

	interaction.reply({ content: "Command in development!", ephemeral: true });
};

function hasInCommon(arr1, arr2, minimum = 1, maximum = -1) {
	let inCommon = 0;
	for (const element1 of arr1) {
		for (const element2 of arr2) {
			if (element1 == element2)
				inCommon++;
		}
	}
	console.log(arr1);
	return ((inCommon >= minimum) && (inCommon <= maximum || maximum < 0));
}
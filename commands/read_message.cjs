const discordJS = require("discord.js");

module.exports = {
	data: new discordJS.SlashCommandBuilder()
		.setName("read-message")
		.setDescription("(Dev) reads message")
};

module.exports.execute = async (interaction, client) => {
	//Create the modal
	const modal = new discordJS.ModalBuilder()
		.setCustomId("read-message")
		.setTitle("Upload asset to asset channel");

	let commandMenu;
	let row = new discordJS.ActionRowBuilder().addComponents(
		commandMenu = new discordJS.SelectMenuBuilder().setCustomId("commands").setPlaceholder(`abc`));
		commandMenu.addOptions({
			label: `a`,
			description: `b`,
			value: `c`
		});

	const hobbiesInput = new discordJS.TextInputBuilder()
		.setCustomId("hobbiesInput")
		.setLabel("What's some of your favorite hobbies?")
		//Paragraph means multiple lines of text.
		.setStyle(discordJS.TextInputStyle.Paragraph)
		.setPlaceholder("test");
		
	const ab = new discordJS.TextInputBuilder()
		.setCustomId("ab")
		.setLabel("What's some of your favorite hobbies?")
		//Paragraph means multiple lines of text.
		.setStyle(discordJS.TextInputStyle.Paragraph)
		.setPlaceholder("test");
	
	const ac = new discordJS.TextInputBuilder()
		.setCustomId("ac")
		.setLabel("What's some of your favorite hobbies?")
		//Paragraph means multiple lines of text.
		.setStyle(discordJS.TextInputStyle.Paragraph)
		.setPlaceholder("test")
		.setRequired(false);
		
	const ad = new discordJS.TextInputBuilder()
		.setCustomId("ad")
		.setLabel("What's some of your favorite hobbies?")
		//Paragraph means multiple lines of text.
		.setStyle(discordJS.TextInputStyle.Paragraph)
		.setPlaceholder("test")
		.setRequired(false);
	
	const ae = new discordJS.TextInputBuilder()
		.setCustomId("ae")
		.setLabel("What's some of your favorite hobbies?")
		//Paragraph means multiple lines of text.
		.setStyle(discordJS.TextInputStyle.Paragraph)
		.setPlaceholder("test")
		.setRequired(false);
		

	//An action row only holds one text input,
	//so you need one action row per text input.
	const firstActionRow = new discordJS.ActionRowBuilder().addComponents([commandMenu]);
	const secondActionRow = new discordJS.ActionRowBuilder().addComponents([hobbiesInput]);
	const thirdActionRow = new discordJS.ActionRowBuilder().addComponents([ab]);
	const fourthActionRow = new discordJS.ActionRowBuilder().addComponents([ac]);
	const fifthActionRow = new discordJS.ActionRowBuilder().addComponents([ad]);

	//Add inputs to the modal
	modal.addComponents([firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow]);

	//Show the modal to the user
	await interaction.showModal(modal);
};

module.exports.process = async (interaction, client) => {
	const hobbies = interaction.fields.getTextInputValue('hobbiesInput');

	console.log(hobbies);

	interaction.reply({ content: "This setting is for development purposes and does nothing otherwise!", ephemeral: true });

};
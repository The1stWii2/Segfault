const discordJS = require("discord.js");
require("dotenv").config();

const ALLOWED_ROLES = ["324957515051696128", "876331576567406632"];
const WEBHOOKS = [process.env.WEBHOOK_MODELS_AND_TEXTURES, process.env.WEBHOOK_MODELS_AND_TEXTURES];

const CREDIT = {
	DEFAULT: "Unknown, (Presumed Credit is Suggested)",
	EDUCATIONAL: "For Educational Purposes Only",
	SUGGESTED: "Credit is Suggested",
	REQUIRED: "Credit is Required",
	NOT_REQUIRED: "Credit is Not Required",
	TOOL: "Tool"
};

module.exports = {
	data: new discordJS.SlashCommandBuilder()
		.setName("create-resource")
		.setDescription("Uploads given message to assets channel")
		.addStringOption((option) =>
			option.setName("message-id")
				.setDescription("The message's ID")
				.setRequired(true)
		) //TODO: Smart creation. For now only used for User ID
		.addStringOption((option) =>
			option.setName("asset-type")
				.setDescription("The type of asset (channel to upload to)")
				.addChoices(
					{ name: "Hammer or Misc.", value: WEBHOOKS[0] },
					{ name: "Model or Texture", value: WEBHOOKS[1] }
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("title")
				.setDescription("Title of asset")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("description")
				.setDescription("Description of asset")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("url")
				.setDescription("URL of file")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("includes") //TODO: Generate file tree.
				.setDescription("Description of what is included")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("credit")
				.setDescription("Credit requirements")
				.addChoices(
					{ name: CREDIT.DEFAULT, value: CREDIT.DEFAULT },
					{ name: CREDIT.EDUCATIONAL, value: CREDIT.EDUCATIONAL },
					{ name: CREDIT.SUGGESTED, value: CREDIT.SUGGESTED },
					{ name: CREDIT.REQUIRED, value: CREDIT.REQUIRED },
					{ name: CREDIT.NOT_REQUIRED, value: CREDIT.NOT_REQUIRED },
					{ name: CREDIT.TOOL, value: CREDIT.TOOL },
				)
		)
		.addStringOption((option) =>
			option.setName("image")
				.setDescription("URL of showcase/preview image")
		)
};

module.exports.execute = async (interaction, client) => {
	const { print, TEXT_LEVEL } = await import("../print.js");

	const userRoles = await interaction.member._roles;
	if (!hasInCommon(userRoles, ALLOWED_ROLES)) {
		interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });
		print(interaction.user.username + " <@" + interaction.user.id + "> attempted to use create-resource command, but lacked privilege.", TEXT_LEVEL.WARN);
		return;
	}

	await interaction.deferReply({ ephemeral: true });

	getMessage(interaction.options.getString("message-id"), client)
		.then(message => {

			const webhookClient = new discordJS.WebhookClient({ url: "https://discord.com/api/webhooks/" + interaction.options.getString("asset-type") });

			const author = message.author.username;
			const authorIcon = message.author.avatarURL();
			const title = interaction.options.getString("title");
			const fileURL = interaction.options.getString("url");
			const description = interaction.options.getString("description");
			const includes = interaction.options.getString("includes");
			const credit = interaction.options.getString("credit") ? interaction.options.getString("credit") : CREDIT.DEFAULT;
			const imageURL = interaction.options.getString("image") ? interaction.options.getString("image") : "";

			const embed = generateEmbed(author, authorIcon, title, fileURL, description, includes, credit, imageURL);

			webhookClient.send({ embeds: [embed] });

			interaction.editReply({ content: "Done!", ephemeral: true });

		})
		.catch(e => {
			print(e, TEXT_LEVEL.ERROR, true);
			interaction.editReply({ content: "I do not have permission to read that message or it doesn't exist!", ephemeral: true });
			return;
		});
};

async function getMessage(id, client) {

	const { print, TEXT_LEVEL } = await import("../print.js");

	for (const channel of client.channels.cache) {
		if (!(channel[1] instanceof discordJS.TextChannel))
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

function generateEmbed(author, authorIcon, title, fileURL, description, includes, credit, imageURL) {
	const embed = new discordJS.EmbedBuilder();
	embed.setColor("#51A8FF");
	embed.setTitle(title);
	embed.setURL(fileURL);
	embed.setAuthor({ name: author }); //Disabled icon for now.
	//embed.setAuthor({ name: author, iconURL: authorIcon });
	embed.addFields(
		{ name: "**Description**", value: description },
		{ name: "**Includes**", value: "```" + includes + "```" },
		{ name: "**Credits**", value: credit }
	);
	if (imageURL != "")
		embed.setImage(imageURL);
	embed.setTimestamp();
	embed.setFooter({ text: "Click the title to download this item!", iconURL: "https://images.emojiterra.com/mozilla/512px/1f4be.png" });
	embed.setTimestamp(null);
	return embed;
}

function hasInCommon(arr1, arr2, minimum = 1, maximum = -1) {
	let inCommon = 0;
	for (const element1 of arr1) {
		for (const element2 of arr2) {
			if (element1 == element2)
				inCommon++;
		}
	}
	return ((inCommon >= minimum) && (inCommon <= maximum || maximum < 0));
}
const discordJS = require("discord.js");
require("dotenv").config();
const seg = require("../constants.cjs");

const ALLOWED_ROLES = ["324957515051696128", "876331576567406632"];


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
		.setDescription("Uploads given a message to assets channel")
		.addStringOption((option) =>
			option.setName("message")
				.setDescription("The message's ID or link")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("asset-type")
				.setDescription("The type of asset (channel to upload to)")
				.addChoices(
					...seg.WEBHOOKS
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("title")
				.setDescription("Title of asset")
		)
		.addStringOption((option) =>
			option.setName("description")
				.setDescription("Description of asset")
		)
		.addStringOption((option) =>
			option.setName("url")
				.setDescription("URL of file")
		)
		.addStringOption((option) =>
			option.setName("includes") //TODO: Generate file tree.
				.setDescription("Description of what is included")
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

	const { print, TEXT_LEVEL } = await import("../lib/print.js");
	const linkHandler = await import("../lib/link_handler.js");
	const messHandler = await import("../lib/message_handler.js");

	const userRoles = await interaction.member._roles;
	if (!hasInCommon(userRoles, ALLOWED_ROLES)) {
		interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });
		print(interaction.user.username + " <@" + interaction.user.id + "> attempted to use create-resource command, but lacked privilege.", TEXT_LEVEL.WARN);
		return;
	}

	await interaction.deferReply({ ephemeral: true });

	const messageID = await messHandler.convertLink(interaction.options.getString("message"));

	await messHandler.getMessage(messageID, client)
		.then(message => {

			const webhookClient = new discordJS.WebhookClient({ url: "https://discord.com/api/webhooks/" + getWebhook(interaction.options.getString("asset-type")) });

			//Automatically generate text
			const messageContent = message.content;
			print("Got message: " + messageContent, TEXT_LEVEL.DEBUG);

			const includesPattern = /(?:^include(?:s|)(?::|)(?: |)(?:\r?\n|))/gim;
			const creditPattern = /(?:^credit(?:s|)(?::|)(?: |))/gim;

			const includesAndPerhapsCredits = messageContent.split(includesPattern);
			let description = includesAndPerhapsCredits.shift();
			let title = description.split("\n").shift();
			description = description.split("\n");
			description.shift();
			description = description.join("\n");

			let credits = includesAndPerhapsCredits.join().split(creditPattern);
			let includes = credits.shift().split("```").join("");
			//If credits is empty, either it wasn't after includes or it doesn't exist
			credits = credits.pop();
			if (credits == "" || credits == undefined) {
				credits = messageContent.split(creditPattern, 2);
				credits = credits.pop().split("\n").shift();
			}

			const attachments = message.attachments;
			let fileURL = getProbableFileAttachment(attachments);
			if (fileURL != null)
				fileURL = fileURL.url;

			//Manually override param if set
			if (interaction.options.getString("title") != null)
				title = interaction.options.getString("title");
			if (interaction.options.getString("description") != null)
				description = interaction.options.getString("description");
			if (interaction.options.getString("includes") != null)
				includes = interaction.options.getString("includes");
			if (interaction.options.getString("credit") != null)
				credits = interaction.options.getString("credit");
			if (credits == "")
				credits = CREDIT.DEFAULT;
			if (interaction.options.getString("url") != null)
				fileURL = interaction.options.getString("url");

			//Read everything else
			const author = message.author.username;
			const authorIcon = message.author.avatarURL();
			const imageURL = interaction.options.getString("image") ? interaction.options.getString("image") : "";

			if (!linkHandler.isValidURL(fileURL)) {
				console.log(fileURL);
				interaction.editReply({ content: "URL for file is invalid!", ephemeral: true });
				return;
			} else if (!linkHandler.isValidURL(imageURL) && imageURL != "") {
				interaction.editReply({ content: "URL for image is invalid!", ephemeral: true });
				return;
			}

			const embed = generateEmbed(author, authorIcon, title, fileURL, description, includes, credits, imageURL);

			print("Posting embed...\n" + embed, TEXT_LEVEL.INFO);

			webhookClient.send({ embeds: [embed] });

			interaction.editReply({ content: "Done!", ephemeral: true });

		})
		.catch(e => {
			print(e, TEXT_LEVEL.ERROR, true);
			interaction.editReply({ content: "I do not have permission to read that message or it doesn't exist!", ephemeral: true });
			return;
		});
};

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

function getProbableFileAttachment(attachments) {
	const validAttachments = [
		"application/zip",
		"application/rar",
		"application/x-7z-compressed"
	];

	let validAttachment = null;

	attachments.forEach(attachment => {
		if (validAttachments.includes(attachment.contentType))
			validAttachment = attachment;
	});

	return validAttachment;
}

function getWebhook(webhookName) {
	for (const item of seg.WEBHOOKS) {
		if (item.name == webhookName)
			return item.address;
	}
	throw ReferenceError("No Such Webhook!");
}
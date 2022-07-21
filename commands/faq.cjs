const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("faq")
		.setDescription("Recalls answers to commonly asked questions.")
		.addStringOption((option) =>
			option.setName("question")
				.setDescription("Which question to answer.")
				.addChoices(
					...getQuestions()
				),
		)
};

module.exports.execute = async (interaction) => {
	const question = interaction.options.getString("question");
	interaction.reply(await getAnswer(question));
	//console.log(getQuestions());
};

//Get questions
function getQuestions() {
	const commandChoices = [];

	try {
		const data = fs.readFileSync("qa.json", "utf8");
		const dataJSON = JSON.parse(data);

		for (const key in dataJSON) {
			if (Object.prototype.hasOwnProperty.call(dataJSON, key)) {
				commandChoices.push({
					name: key,
					value: key,
				});
			}
		}

	} catch (err) {
		console.error(err);
	}

	return commandChoices;
}

//Get Answers
async function getAnswer(inputKey) {
	try {
		const data = await fs.readFileSync("./qa.json", "utf8");
		const dataJSON = JSON.parse(data);

		for (const key in dataJSON) {
			if (Object.prototype.hasOwnProperty.call(dataJSON, key)) {
				const value = dataJSON[key];
				if (inputKey == String(key))
					return value;
			}
		}

	} catch (err) {
		console.error(err);
		return null;
	}
	throw EvalError;
}
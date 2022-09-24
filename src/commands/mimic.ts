import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { physicalReply } from "../lib/commonDiscordFunc";

const command = {
  slashCommand: new SlashCommandBuilder()
    .setName("mimic")
    .setDescription("Makes the bot say something")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What to make the bot say")
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const message: string = interaction.options.getString("message")!;

    physicalReply(interaction, message, "Done!");
  },
} as ISlashCommand;

export const slashCommand = command.slashCommand;
export const execute = command.execute;

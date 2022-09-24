import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = {
  slashCommand: new SlashCommandBuilder().setName("server").setDescription("Replies with server info! (dummy command)"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    void interaction.reply(
      `Server name: ${interaction.guild!.name}\n` + `Total members: ${interaction.guild!.memberCount}`
    );
  },
} as ISlashCommand;

export const slashCommand = command.slashCommand;
export const execute = command.execute;

import {
  Client,
  ClientOptions,
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export class bot extends Client {
  constructor(params: {
    options: ClientOptions;
    commands: Collection<string, ISlashCommand>;
  });

  get commands(): Collection<string, ISlashCommand>;
}

export {};

declare global {
  /**
   * Interface for generic slash command
   *
   * @param slashCommand - The slash command
   * @param execute - The function to run when called.
   *
   */
  interface ISlashCommand {
    slashCommand: SlashCommandBuilder;
    execute: (interaction: CommandInteraction, client?: bot) => Promise<void>;
  }

  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Bot's Application ID, should be string of digits.
       */
      APP_ID: `${number}`;
      DISCORD_TOKEN: string;
    }
  }
}

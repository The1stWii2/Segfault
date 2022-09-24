import * as discordJS from "discord.js";
import * as discordAPI from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";

import fs from "fs";
import path from "path";
import "dotenv/config";

import { APP_CONSTANTS } from "./constants";
import { computeMetaHash } from "./lib/meta_hash";
import { SlashCommandBuilder } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

/**
 * "Bot" class. Just `discordJS.Client` but also stores commands
 */
class Bot extends discordJS.Client {
  private _commands: discordJS.Collection<string, ISlashCommand>;

  constructor(params: {
    options: discordJS.ClientOptions;
    commands: discordJS.Collection<string, ISlashCommand>;
  }) {
    super(params.options);

    this._commands = params.commands;
  }

  get commands() {
    return this._commands;
  }
}

/**
 *
 * @returns Promise of collection `<name, ICommand>`
 */
async function getCommands(): Promise<
  discordJS.Collection<string, ISlashCommand>
> {
  //Get commands
  const commandList = new discordJS.Collection();
  //const commandFiles = fs.readdirSync(APP_CONSTANTS.COMMAND_LOCATION);
  const commandFiles = fs.readdirSync(
    path.join(__dirname, APP_CONSTANTS.COMMAND_LOCATION)
  );

  //Only include ts files, (eg, drop .json files)
  commandFiles.filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    console.log("Loading command: " + file);

    const command = (await import(
      path.join(__dirname, APP_CONSTANTS.COMMAND_LOCATION, file)
    )) as ISlashCommand;

    commandList.set(command.slashCommand.name, command);
  }

  return commandList as discordJS.Collection<string, ISlashCommand>;
}

async function regCommands(commandList: SlashCommandBuilder[]) {
  //Check whether we need to update commands
  const currentHash = (await computeMetaHash(
    path.join(__dirname, APP_CONSTANTS.COMMAND_LOCATION)
  )) as Buffer;
  console.log("Current hash for commands is: ", currentHash.readBigInt64LE(0));

  //Find previous hash, if it exists
  const prevHash = (await fs.promises
    .readFile(APP_CONSTANTS.HASH_LOCATION)
    .catch((error: NodeJS.ErrnoException) => {
      if (error?.code == "ENOENT")
        console.log("No previous command hash exists, one will be created.");
    })) as Buffer;

  //If prevHash does exist, print it
  if (prevHash)
    console.log("Previous hash for commands is: ", prevHash.readBigInt64LE(0));

  //Compare hashes.
  if (
    APP_CONSTANTS.SKIP_REGISTERING == -1 ||
    !prevHash ||
    currentHash.readBigInt64LE(0) != prevHash.readBigInt64LE(0)
  ) {
    //Register Guild commands
    if (APP_CONSTANTS.SKIP_REGISTERING != 1) {
      console.log("Commands updated, refreshing Guild commands...");
      console.log("Command registration may be delayed.");

      await rest
        .put(Routes.applicationCommands(process.env.APP_ID), {
          body: commandList,
        })
        .then(() => console.log("Successfully registered global commands."))
        .catch(console.error);
    } else {
      console.log("Skipping command registration per rule.");
    }

    //Update Hash
    try {
      fs.writeFileSync(APP_CONSTANTS.HASH_LOCATION, currentHash);
    } catch (e) {
      console.log("Failed to write hash!");
      throw e;
    }
  } else {
    console.log("Skipping command registration.");
  }
}

async function main() {
  const botIntents = [
    discordAPI.GatewayIntentBits.Guilds,
    discordAPI.GatewayIntentBits.GuildWebhooks,
    discordAPI.GatewayIntentBits.GuildMessages,
    discordAPI.GatewayIntentBits.GuildMessageReactions,
    discordAPI.GatewayIntentBits.GuildMessageTyping,
    discordAPI.GatewayIntentBits.DirectMessages,
    discordAPI.GatewayIntentBits.DirectMessageReactions,
    discordAPI.GatewayIntentBits.DirectMessageTyping,
    discordAPI.GatewayIntentBits.MessageContent,
    discordAPI.GatewayIntentBits.GuildScheduledEvents,
  ];

  const client = new Bot({
    options: { intents: botIntents },
    commands: await getCommands(),
  });

  const commandList: SlashCommandBuilder[] = [];
  for (const item of client.commands) {
    commandList.push(item[1].slashCommand);
  }

  //Register commands (with the server)
  void regCommands(commandList);

  client.once("ready", () => {
    console.log("Ready!");
  });

  //On receive interaction
  client.on("interactionCreate", async (interaction) => {
    switch (interaction.type) {
      //Interaction is slash command...
      case discordAPI.InteractionType.ApplicationCommand: {
        //Slash Command
        console.log("Received interaction: " + String(interaction));

        //Get which command to execute.
        const command = client.commands.get(
          interaction.commandName
        ) as ISlashCommand;
        if (!command) return;

        try {
          console.log(
            interaction.user.username +
              " <@" +
              interaction.user.id +
              "> called command: " +
              String(interaction)
          );

          //Attempt to execute command
          await command.execute(interaction, client);
        } catch (error) {
          console.error(error);
          if (interaction.deferred)
            await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
        }
      }
    }
  });

  void client.login(process.env.DISCORD_TOKEN);
}

//Begin
console.log("\n\n\n");
console.log("Starting...");
void main();

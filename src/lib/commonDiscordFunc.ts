import { ChatInputCommandInteraction } from "discord.js";

export function physicalReply(
  interaction: ChatInputCommandInteraction,
  message: string,
  successMessage: string
): boolean {
  if (!interaction.channel) {
    void interaction.reply({
      content: "Cannot access channel.\nPerhaps I don't have permission?",
      ephemeral: true,
    });

    return false;
  } else {
    interaction.channel
      .send(message)
      .then(() => {
        void interaction.reply({
          content: successMessage,
          ephemeral: true,
        });
      })
      .catch((error) => {
        console.log(error);

        void interaction.reply({
          content: "Cannot post message.\nPerhaps I don't have permission?",
          ephemeral: true,
        });

        return false;
      });
  }

  return true;
}

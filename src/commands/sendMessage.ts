import { SlashCommandBuilder } from "@discordjs/builders";

const sendMessageCommand = new SlashCommandBuilder()
  .setName("sendmessage")
  .setDescription("Send a message to all users")
  .toJSON();

export default sendMessageCommand;

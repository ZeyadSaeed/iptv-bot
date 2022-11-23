// LIBRARIES
import { config } from "dotenv";
config();
import {
  Client,
  IntentsBitField,
  GatewayIntentBits,
  Routes,
  TextInputStyle,
  InteractionType,
} from "discord.js";
import { REST } from "@discordjs/rest";
import sendMessageCommand from "./commands/sendMessage";
import { CommandsType } from "./types";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
} from "@discordjs/builders";

const myIntents = new IntentsBitField();
const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_SECRET as string
);

myIntents.add(GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers);

const client = new Client({
  intents: myIntents,
});

// .ENV VARIABLES
const DISCORD_SECRET = process.env.DISCORD_SECRET as string;
const CLIENT_ID = process.env.CLIENT_ID as string;
const GUILD_ID = process.env.GUILD_ID as string;

client.on("ready", () => {
  console.log(`The Bot Is Ready To Go!`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "sendmessage") {
      const modal = new ModalBuilder()
        .setTitle("Send Message To All Users")
        .setCustomId("sendMessageModal")
        .setComponents(
          new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
              .setCustomId("messageContent")
              .setLabel("Message Content")
              .setPlaceholder("Enter your message here")
              .setStyle(TextInputStyle.Paragraph)
          )
        );

      interaction.showModal(modal);
    }
  } else if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === "sendMessageModal") {
      try {
        const server = await client.guilds.fetch(GUILD_ID);
        const users = await server.members.fetch();
        const messageContent =
          interaction.fields.fields.get("messageContent")?.value;
        if (!messageContent) return;
        users.map(async (user) => {
          if (user.user.bot) return;
          try {
            await user.send(messageContent);
          } catch (err) {
            return;
          }
        });

        await interaction.reply("Message Sent To All Users!");
      } catch (err) {
        console.log(err);
        await interaction.reply("Could Not Send The Message To All Users!");
      }
    }
  }
});

const commands: CommandsType = [sendMessageCommand];

async function main() {
  try {
    console.log("Started refreshing applecation (/) commands.");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    client.login(DISCORD_SECRET);
  } catch (err) {
    console.log(err);
  }
}

main();

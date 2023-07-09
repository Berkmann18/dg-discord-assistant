const { readdirSync } = require('fs');
const { join } = require('path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { succ, warn, error } = require('nclr/symbols');

const ENV = process.env.NODE_ENV ?? 'prod';
const { token } = require(`./configs/${ENV}.json`);
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  succ(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // console.log(interaction); //Logs the interaction with some JSON data about the user/guild/etc
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    const content = `No command matching ${interaction.commandName} was found.`;
    error(content);
    await interaction.reply({content, ephemeral: true});
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true //This means that only the person the bot replies to see this message
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    }
  }
});

// Log in to Discord with your client's token
client.login(token);

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const { readdirSync } = require('fs');
const { join } = require('path');
const { succ, warn, info, error } = require('nclr/symbols');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    info(`Started refreshing ${commands.length} application commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const global = !!process.env.GLOBAL;
    const options = {
      body: commands
    }
    const data = await rest.put(global ? Routes.applicationCommands(clientId) : Routes.applicationGuildCommands(clientId, guildId), options);

    succ(`Successfully reloaded ${data.length} application commands.`);
  } catch (err) {
    // And of course, make sure you catch and log any errors!
    error(err);
  }
})();

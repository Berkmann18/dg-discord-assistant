const { Events, italic } = require('discord.js');
const { error } = require('nclr/symbols');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // console.log(interaction); //Logs the interaction with some JSON data about the user/guild/etc
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        const content = `No command matching ${interaction.commandName} was found.`;
        error(content);
        await interaction.reply({ content, ephemeral: true });
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
            content: `There was an error while executing ${interaction.commandName}!`,
            ephemeral: true
          });
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      // await interaction.reply('Select menu found');
      // console.log('int=', interaction);
    } else {
      await interaction.reply(italic('Hey buddy, please check out my commands and use them'));
    }
  }
};

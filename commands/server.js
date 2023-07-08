const { SlashCommandBuilder, bold } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Display info about this server.'),
  async execute(interaction) {
    return interaction.reply(
      `${bold('Server name:')} ${interaction.guild.name}\n${bold('Total members')}: ${
        interaction.guild.memberCount
      }`
    );
  }
};

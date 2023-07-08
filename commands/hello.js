const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('hello').setDescription('Replies to the user!'),
  async execute(interaction) {
    await interaction.reply(`Oi ${interaction.user.username}!`);
  }
};

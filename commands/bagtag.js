const { SlashCommandBuilder, bold, inlineCode, italic, hyperlink } = require('discord.js');
const { readFileSync: read, writeFileSync: write } = require('fs');
const { use } = require('nclr');
const { join } = require('path');

const BAGTAG_URL = 'https://bagtag.manchesterdiscgolf.co.uk/update-tag?year=2023&tag=';
const PLAYERS_FILE = join(__dirname, '../players.json');
/**
 * @type {Array<{name: string, score?: number, bagtag: number}>}
 */
let playerData = JSON.parse(read(PLAYERS_FILE, 'utf-8')) || [];
console.log('playerData=', playerData);

const bagTagList = (interaction) => {
  playerData.sort((a, b) => a.bagtag - b.bagtag);
  const tagList = playerData.map(
    (p) =>
      `- ${inlineCode(p.bagtag)} ${p.name} ${
        p.score !== 999 ? '(' + italic(p.score) + ')' : ''
      } (${hyperlink('update tag', BAGTAG_URL + p.bagtag)})`
  );
  return interaction.reply(`${bold('MDG BagTags:')}\n${tagList.join('\n')}`);
};

const playerOption = (opt) => {
  return opt.setName('player').setDescription('player name to add to the list').setMinLength(2);
};
const tagOption = (opt) => {
  return opt
    .setName('tag')
    .setDescription('tag of the player to add')
    .setMinValue(1)
    .setMaxValue(99);
};
const scoreOption = (opt) => {
  return opt.setName('score').setDescription('score of the player after the round');
};

const save = () => write(PLAYERS_FILE, JSON.stringify(playerData, null, 2));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bagtag')
    .setDescription('Manage MDG bag tag for leagues/club nights')
    .addSubcommand((subcmd) => {
      return subcmd
        .setName('add')
        .setDescription('Add a player/tag to the list')
        .addStringOption(playerOption)
        .addNumberOption(tagOption);
    })
    .addSubcommand((subcmd) => {
      return subcmd
        .setName('update')
        .setDescription('Update a player/tag from the list')
        .addStringOption(playerOption)
        .addNumberOption(tagOption);
    })
    .addSubcommand((subcmd) => {
      return subcmd
        .setName('score')
        .setDescription('Add a player score after the round')
        .addStringOption(playerOption)
        .addNumberOption(scoreOption);
    })
    .addSubcommand((subcmd) => {
      return subcmd.setName('view').setDescription('View the bag tag list');
    })
    .addSubcommand((subcmd) => {
      return subcmd.setName('clear').setDescription('Empties the list');
    }),
  async execute(interaction) {
    const name = interaction.options.getString('player');
    const bagtag = interaction.options.getNumber('tag');
    const score = interaction.options.getNumber('score');
    let player = null;
    switch (interaction.options.getSubcommand()) {
      case 'add':
        //Add players and current bagtags (before the round starts)
        const data = { name, bagtag, score: score ?? 999 }
        playerData.push(data);
        save();
        info(`Added ${use('out', JSON.stringify(data, null, 2))}`);
        return interaction.reply(`Adding player ${name} with tag #${bagtag}`);
      case 'update':
        player = name
          ? playerData.find((p) => p.name === name)
          : playerData.find((p) => p.bagtag === bagtag);
        player.name = name;
        player.bagtag = bagtag;
        save();
        info(`Updated ${use('out', JSON.stringify(player, null, 2))}`);
        return interaction.reply(`Updated player ${name} with tag #${bagtag}`);
      case 'score':
        //Enter player scores then show updated tag list
        player = playerData.find((p) => p.name === name);
        player.score = score;
        save();
        info(`Updated ${use('out', name)} with score ${use('out', score)}`);
        return interaction.reply(`Updated player ${name} with score ${score}`);
      case 'view':
        // eslint-disable-next-line no-case-declarations
        const tagList = playerData.map((p) => p.bagtag).sort((a, b) => a - b);
        playerData.sort((a, b) => {
          return a.score === b.score ? a.bagtag - b.bagtag : a.score - b.score;
        });
        for (const player of playerData) {
          player.bagtag = tagList.shift();
        }
        save();
        info('Viewing bag tag list');
        console.table(playerData);
        return bagTagList(interaction);
      case 'clear':
        playerData = [];
        save();
        info('Cleared the player list');
        return interaction.reply('List emptied');
      default:
        warn(`"${interaction.options.getSubcommand()}" interaction failed`);
        console.log(interaction);
        return interaction.reply(italic('Interaction failed'));
    }
  }
};

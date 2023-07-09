const { SlashCommandBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { readFileSync: read, writeFileSync: write } = require('fs');
const { use, info, warn } = require('nclr');
const { join } = require('path');

const PUTTING_FILE = join(__dirname, '../data/putting.json');
/**
 * @type {{[puttingStyle: string]: {label: string, description: string, stats: [dist: number]: number}}}
 */
let puttingData = JSON.parse(read(PUTTING_FILE, 'utf-8')) || {};
/*
  {
    spush: {
      //distances w/ Puttify sucess rate
      5: 1, //100%
      6: .8,
      ...
      20: .2
    },
    spush_s: {...}
    spush_p: {...}
    rotationalSpush: {...}
  }
*/

const setupPuttingStyle = (name, label = name, description = '') => {
  puttingData[name] = {
    label,
    description,
    stats: {}
  };
  //Only track stats for 5-20m putts
  for (let i = 5; i < 21; ++i) {
    puttingData[name].stats[i] = 0;
  }
};

const distanceOption = (opt) => {
  return opt
    .setName('dist')
    .setDescription('distance to the basket')
    .setMinValue(3)
    .setMaxValue(30);
};

const styleOption = (opt) => {
  return opt.setName('style').setDescription('putting style name').setMinLength(2);
};

const save = () => write(PUTTING_FILE, JSON.stringify(puttingData, null, 2));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('putt')
    .setDescription('Putt comparisons')
    .addSubcommand((subcmd) => {
      return subcmd
        .setName('add')
        .setDescription('Add putting style')
        .addStringOption(styleOption)
        .addStringOption((opt) => opt.setName('label').setDescription('putting style label'))
        .addStringOption((opt) =>
          opt.setName('description').setDescription('putting style description')
        );
    })
    .addSubcommand((subcmd) => {
      return (
        subcmd
          .setName('add-results')
          .setDescription('Add Puttify results')
          //? Can this be set as an arg rather than option? Nope, the interactions don't contain any arguments passed outside of the values to options
          .addStringOption((opt) =>
            opt.setName('results').setDescription('Puttify results in "5=1, 6=.8, 7=.47, ..."')
          )
      );
    }),
  async execute(interaction) {
    const style = interaction.options.getString('style');
    switch (interaction.options.getSubcommand()) {
      case 'add':
        setupPuttingStyle(
          style,
          interaction.options.getString('label'),
          interaction.options.getString('description')
        );
        save();
        return interaction.reply(`Added "${style}"`);
      case 'add-results':
        //TODO Add the Puttify result to specified style (possibly using https://discordjs.guide/message-components/select-menus.html#building-string-select-menus)
        const options = [];
        for (const style in puttingData) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(puttingData[style].label)
              .setDescription(puttingData[style].description)
              .setValue(style)
          );
        }
        const select = new StringSelectMenuBuilder()
          .setCustomId('puttingStyle')
          .setPlaceholder('Select a style')
          .addOptions(...options);
        const dist = interaction.options.getString('dist');
        const stats = dist.split(/\s*,\s*/);
        console.log('stats=', stats);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
          content: 'For which style?',
          components: [row],
        });
        return;
      case 'compare':
        //TODO Compare in C1/C2/overall which are the best styles (ranked from best to worst)
        //TODO Suggest best putt based on ^
        return;
      default:
        warn(`"${interaction.options.getSubcommand()}" interaction failed`);
        console.log(interaction);
        return interaction.reply(italic('Interaction failed'));
    }
  }
};

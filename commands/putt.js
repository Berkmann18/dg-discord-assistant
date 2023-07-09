const {
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const { readFileSync: read, writeFileSync: write } = require('fs');
const { warn, error, info } = require('nclr');
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
  } 5=.95, 6=.6, 7=.49, 8=.6, 9=.36, 10=.36
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

const styleOption = (opt) => {
  return opt.setName('style').setDescription('putting style name').setMinLength(2);
};

const save = () => write(PUTTING_FILE, JSON.stringify(puttingData, null, 2));
const puttingTable = (style) => {
  const dists = Object.keys(puttingData[style].stats);
  const distsHeader = dists.map((d) => `${d}m`).join(' | ');
  const percs = Object.values(puttingData[style].stats).join(' | ');
  //Discord doesn't support MD tables
  return `\`\`\`
  ╔═══════${'╤═════'.repeat(dists.length)}═╗
  ║ style | ${distsHeader} ║
  ║═══════${'╪═════'.repeat(dists.length)} ║
  ║ ${style} | ${percs} ║
  ╚═══════${'╧═════'.repeat(dists.length)}═╝
  \`\`\``;
};

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
        const res = interaction.options.getString('results');
        const stats = res.split(/\s*,\s*/);
        console.log('stats=', stats);

        const row = new ActionRowBuilder().addComponents(select);

        try {
          const styleSelection = await interaction.reply({
            content: 'For which style?',
            components: [row]
          });
          const selection = await styleSelection.awaitMessageComponent();
          const selectedStyle = selection.values ? selection.values[0] : null;

          info('Style selected:', selectedStyle);
          for (let stat of stats) {
            const [dist, perc] = stat.split('=');

            puttingData[selectedStyle].stats[+dist] = +perc;
          }
          save();
          return interaction.followUp(puttingTable(selectedStyle));
        } catch (err) {
          error(err);
          return await interaction.editReply({
            content: 'An error happened, operation cancelled',
            ephemeral: true,
            components: []
          });
        }
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

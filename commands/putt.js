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
 * @type {{[puttingStyle: string]: {label: string, description: string, stats: [dist: number]: number, c1: number, c2: number, overall: number}}}
 */
let puttingData = JSON.parse(read(PUTTING_FILE, 'utf-8')) || {};
const DISTANCES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const setupPuttingStyle = (name, label = name, description = '') => {
  puttingData[name] = {
    label,
    description,
    stats: {},
    c1: 0,
    c2: 0,
    overall: 0
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
  const distsHeader = dists.map((d) => ` ${d}m `).join(' | ');
  const percs = Object.values(puttingData[style].stats)
    .map((p) => p.toFixed(2))
    .join(' | ');
  //Discord doesn't support MD tables
  const styleColBorder = '═'.repeat(style.length + 2);
  return `\`\`\`
  ╔${styleColBorder}${'╤═════'.repeat(dists.length)}═╗
  ║ style | ${distsHeader} ║
  ║${styleColBorder}${'╪═════'.repeat(dists.length)}═╣
  ║ ${style} | ${percs} ║
  ╚${styleColBorder}${'╧═════'.repeat(dists.length)}═╝
  \`\`\``;
};
const allPuttsTable = () => {
  const distsHeader = DISTANCES.map((d) => d < 10 ? ` ${d}m ` : `${d}m `).join(' | ');
  const longestName = Math.max(...Object.keys(puttingData).map((s) => s.length)) + 2;
  const headerBorder = '═'.repeat(longestName);
  const styleBorder = '─'.repeat(longestName); //
  let rows = '';
  let summaryRows = ''
  const styleCount = Object.keys(puttingData).length;
  let i = 0;
  let bestC1 = 0;
  let bestC1Style = '';
  let bestC2 = 0;
  let bestC2Style = '';
  let bestOverall = 0;
  let bestStyle = '';
  for (const style in puttingData) {
    ++i;
    const percs = Object.values(puttingData[style].stats)
      .map((p) => p.toFixed(2))
      .join(' | ');
    const header = style + ' '.repeat(longestName - 2 - style.length);
    rows += `║ ${header} | ${percs} ║`;
    summaryRows += `║ ${header} | ${puttingData[style].c1.toFixed(2)} | ${puttingData[style].c2.toFixed(2)} | ${puttingData[style].overall.toFixed(2)} ║`;
    if (i < styleCount) {
      rows += '\n';/* ╟${styleBorder}${'┼─────'.repeat(DISTANCES.length)}╢ */
      summaryRows += '\n';
    }
    if (bestC1 < puttingData[style].c1) {
      bestC1 = puttingData[style].c1;
      bestC1Style = puttingData[style].label;
    }
    if (bestC2 < puttingData[style].c2) {
      bestC2 = puttingData[style].c2;
      bestC2Style = puttingData[style].label;
    }
    if (bestOverall < puttingData[style].overall) {
      bestOverall = puttingData[style].overall;
      bestStyle = puttingData[style].label;
    }
  }

  const styleHeader = 'style' + ' '.repeat(longestName - 7);
  return `\`\`\`
╔${headerBorder}${'╤══════'.repeat(DISTANCES.length)}╗
║ ${styleHeader} | ${distsHeader} ║
║${headerBorder}${'╪══════'.repeat(DISTANCES.length)}╣
${rows}
╚${headerBorder}${'╧══════'.repeat(DISTANCES.length)}╝

╔${headerBorder}╤══════╤══════╤══════╗
║ ${styleHeader} |  C1  |  C2  | C1-2 ║
║${headerBorder}╪══════╪══════╪══════╣
${summaryRows}
╚${headerBorder}╧══════╧══════╧══════╝
  \`\`\`
  **Best C1 style**: ${bestC1Style} (\`${bestC1 * 100}%\`)

  **Best C2 style**: ${bestC2Style} (\`${bestC2 * 100}%\`)

  **Best Overall style**: ${bestStyle} (\`${bestOverall * 100}%\`)`;
};

const avg = arr => arr.reduce((a, v) => a + v, 0) / arr.length;

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
      return subcmd
        .setName('add-results')
        .setDescription('Add Puttify results')
        .addStringOption((opt) =>
          opt.setName('results').setDescription('Puttify results in "5=1, 6=.8, 7=.47, ..."')
        );
    })
    .addSubcommand((subcmd) => {
      return subcmd.setName('compare').setDescription('Compare the putting styles');
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
          const indexOf10m = 6;
          puttingData[selectedStyle].c1 = avg(puttingData[selectedStyle].stats.slice(0, indexOf10m));
          puttingData[selectedStyle].c2 = avg(puttingData[selectedStyle].stats.slice(indexOf10m));
          puttingData[selectedStyle].overall = avg(puttingData[selectedStyle].stats);
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
        //TODO Rank C1/C2/overall stats from best to worst (when I have enough data)
        return interaction.reply(allPuttsTable());
      default:
        warn(`"${interaction.options.getSubcommand()}" interaction failed`);
        console.log(interaction);
        return interaction.reply(italic('Interaction failed'));
    }
  }
};

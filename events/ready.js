const { Events } = require('discord.js');
const { succ } = require('nclr/symbols');

// When the client is ready, run this code (only once)
module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    succ(`Ready! Logged in as ${client.user.tag}`);
  }
};

const { Events } = require('discord.js');
const config = require('../config/config.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const prefix = config.PREFIX;
    
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = message.client.prefixCommands.get(commandName);
    if (!command) return;
    
    try {
      await command.execute(message, args);
    } catch (err) {
      console.log('Error while executing commands', err);
    }
  }
};
const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log('Connected!, how nice');
    
    client.user.setActivity('Nekoyama', {
      type: ActivityType.Playing
    });
  }
};
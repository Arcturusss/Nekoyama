const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`Command "${interaction.commandName}" is not found`);
      return;
    }
    
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(error);
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'error while executing this command', ephemeral: true });
      } else {
        await interaction.reply({ content: 'error while executing this command', ephemeral: true });
      }
    }
  }
};
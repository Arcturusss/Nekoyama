const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Show the ping of the bot',
  async execute(message, args, client) {
    const sent = await message.channel.send('Pinging...');
    const messageLatency = sent.createdTimestamp - message.createdTimestamp;
    const websocketPing = message.client.ws.ping;
    const uptime = Math.floor(Date.now() / 1000);
    const convertedTime = `<t:${uptime}:R>`;

    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setColor('#F00075')
      .addFields(
        { name: 'Message Latency', value: `${messageLatency}ms`, inline: true },
        { name: 'WebSocket Ping', value: `${websocketPing}ms`, inline: true },
        { name: 'Uptime', value: convertedTime, inline: false }
      )
      .setTimestamp();

    await sent.edit({ content: '', embeds: [embed] });
  }
};
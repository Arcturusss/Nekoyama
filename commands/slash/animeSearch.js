const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Anilist = require('anilist-node');
const anilist = new Anilist();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Search an anime and get detailed information')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Input the name of the anime')
        .setRequired(true)
    ),

  async execute(interaction) {
    const animeToSearch = interaction.options.getString('name');

    await interaction.deferReply();

    try {
      const result = await anilist.search('anime', animeToSearch);
      
      if (!result.media.length) {
        return interaction.editReply('Anime not found.');
      }

      const selected = result.media.find(a => a.id && a.title);
      console.log(selected);

      if (!selected) {
        return interaction.editReply('No valid anime found.');
      }

      const anime = await anilist.media.anime(selected.id);

      const description = anime.description
        ? anime.description.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, '').slice(0, 500) + '...'
        : 'No description available.';

      const embed = new EmbedBuilder()
        .setTitle(anime.title.romaji || anime.title.english || anime.title.native || 'Unknown Title')
        .setDescription(description)
        .setURL(`https://anilist.co/anime/${anime.id}`)
        .setColor('#F00075')
        .setThumbnail(anime.coverImage?.large || anime.coverImage?.medium || null)
        .addFields(
          { name: 'Rating', value: anime.averageScore ? `${anime.averageScore}%` : 'Unknown', inline: true },
          { name: 'Episodes', value: anime.episodes?.toString() || 'Unknown', inline: true },
          { name: 'Status', value: anime.status || 'Unknown', inline: true },
          {
            name: 'Next Episode',
            value: anime.nextAiringEpisode
              ? `<t:${anime.nextAiringEpisode.airingAt}:R>`
              : 'Never',
            inline: true
          },
          {
            name: 'Streaming',
            value: Array.isArray(anime.externalLinks) && anime.externalLinks.length
            ? anime.externalLinks
               .filter(link => link?.site && link?.url) // pastikan link valid
               .map(link => `[${link.site}](${link.url})`)
               .join(', ')
          : 'Not available',
           inline: false
          },
          {
            name: 'Information',
            value: `[AniList](https://anilist.co/anime/${anime.id})${anime.idMal ? `, [MAL](https://myanimelist.net/anime/${anime.idMal})` : ''}`,
            inline: false
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.editReply('Error while searching the anime.');
    }
  }
};
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun ping durumunu gösterir ve destek sunucusu linkini verir.'),
    async execute(interaction) {
        const ping = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .setDescription(`Botun pingi: ${ping}ms`)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Destek için tıkla')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/invite/6SbCcgBRh8')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
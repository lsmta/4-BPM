const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const emoji = require('../../emojis.json').outros;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cticket')
    .setDescription('[Moderação] Crie o menu de ticket.'),
  async execute(interaction, client) {
    if (interaction.user.id != require('../../config.json').ownerID) return interaction.reply({content: 'Apenas o dono pode usar esse comando', ephemeral: true})
    
    let embed = {
      title: '🎟️ | Ticket',
      description: `Olá, seja bem-vindo ao **Menu de Ticket**!

      **Categorias**
      ${emoji.financas} | Finanças - Para falar conosco a respeito de dinheiro;
      ${emoji.denuncias} | Denuncias - Para denunciar algo que quebre as regras do servidor;
      ${emoji.duvidas} | Dúvidas - Para tirar suas dúvidas sobre o servidor`,
      color: "#0000FF",
	  image: {
		  url: "https://media.discordapp.net/attachments/1097138579714613359/1148331433455267960/imagem_2023-09-04_155517321-removebg-preview.png"
	  }
    }
    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('ticket')
          .setPlaceholder('Categorias')
          .addOptions([
            {
              label: 'Finanças',
              description: 'Para falar conosco a respeito de dinheiro',
              value: 'primeiro_ticket',
            }, {
              label: 'Denuncias',
              description: 'Para denunciar algo que quebre as regras do servidor',
              value: 'segundo_ticket',
            }, {
              label: 'Dúvidas',
              description: 'Para tirar suas dúvidas sobre o servidor',
              value: 'terceiro_ticket',
            },
          ]),
      );
      
    await interaction.channel.send({ embeds: [embed], components: [row] })
    await interaction.reply({content: `Mensagem criada com sucesso! Clique em 'Ignorar Mensagem'`, ephemeral: true})
  }
}
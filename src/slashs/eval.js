const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { inspect } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('[Developers] Use para testar um comando (Somente Desenvolvedores)')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('O código para testar')
        .setRequired(true)),
  async execute(interaction, client) {
    if (interaction.user.id != require('../../config.json').ownerID) return interaction.reply({ content: `Somente meu desenvolvedor pode usar esse comando!`, ephemeral: true })
    const code = interaction.options.getString('code');

    try {
		
      let saida = eval(code);
      interaction.reply({ content: `**[SUCCESS]** Saida:\n\`\`\`js\n${saida}\`\`\``, ephemeral: true })
		
    } catch (err) {
		
      interaction.reply({ content: `**[ERROR]** Saida:\n\`\`\`${err}\`\`\``, ephemeral: true })
		
    }
  }
}
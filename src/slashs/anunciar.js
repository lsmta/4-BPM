const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configurar')
    .setDescription('[Moderação] Configurações')
	.addSubcommand(subcommand =>
		subcommand
			.setName('ticket')
			.setDescription('[Moderação] Configure o sistema de ticket')
			.addChannelOption(option => 
				option.setName('categoria')
				.setDescription('Categoria onde o ticket criado irá ficar')
				.setRequired(true)))
	.addSubcommand(subcommand =>
		subcommand
			.setName('bate-ponto')
			.setDescription('[Moderação] Configure o sistema de bate-ponto')),
	async execute(interaction, client) {
	const subcommand = interaction.options.getSubcommand()
	  
	if(subcommand == "ticket") {
		
		interaction.reply({ content: "**[ERROR]** Comando em manutenção.", ephemeral: true })
		
	} else if(subcommand == "bate-ponto") {
		
		interaction.reply({ content: "**[ERROR]** Comando em manutenção.", ephemeral: true })
		
	}
  }
}
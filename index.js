const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_PRESENCES
  ]
});
const config = require('./config.json');
const fs = require('fs')
const db = require('quick.db')
const ms = require('parse-ms')

client.db = require('quick.db');
client.color = "#128500";
client.slashs = new Discord.Collection();

const pasta = fs.readdirSync('./src/slashs').filter(file => file.endsWith('.js'));

for (const file of pasta) {
  const slash = require(`./src/slashs/${file}`);
  client.slashs.set(slash.data.name, slash);
}

client.on('ready', async () => {
  let commands = [];
  let commandFile = fs.readdirSync('./src/slashs').filter(file => file.endsWith('.js'));

  for (const file of commandFile) {
    const command = require(`./src/slashs/${file}`);
    commands.push(command.data.toJSON());
  };

  await client.application.commands.set(commands).then(() => console.log(`Slashs carregados.`)).catch((e) => console.log(e));
  console.log('Estou Online!')
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const slash = client.slashs.get(interaction.commandName);

  if (!slash) return;

  try {
    await slash.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Ocorreu um erro ao executar esse comando!', ephemeral: true });
  }
});

//                                  4°BPM                                  \\

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.guild.id != "554144874409099274") return;

  let author = interaction.user;

  let data2 = Date.now()
  let data = new Date(data2);
  let dia = data.getDate() >= 10 ? data.getDate() : `0${data.getDate()}`;
  let mes = data.getMonth() + 1 >= 10 ? data.getMonth() + 1 : `0${data.getMonth() + 1}`;
  let ano = data.getFullYear();
  let horas_errado = data.setHours(data.getHours() - 3);
  let horas = data.getHours() >= 10 ? data.getHours() : `0${data.getHours()}`;
  let minutos = data.getMinutes() >= 10 ? data.getMinutes() : `0${data.getMinutes()}`;

  // Chat-Logs Bate-ponto
  let log_channel = client.channels.cache.get(config.bp4.clogs)

  // Emoji de pasta
  let emoji = "<:pasta_1:830025704246738975>"

  if (interaction.customId == 'iniciarbp') {
    if (!db.get(`bp/${author.id}`)) {
      db.set(`bp/${author.id}`, true)

      if (!db.get(`bp/${author.id}/chat`)) {
        let categ = config.bp4.categ
        let channel = await interaction.guild.channels.create(`🎫-${author.username}`, {
          type: 'GUILD_TEXT', permissionOverwrites: [{
            id: interaction.guild.id,
            deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
          }, {
            id: interaction.user.id,
            allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
          }],
          parent: categ
        })
        db.set(`bp/${author.id}/chat`, channel.id)
      }

      let bp_channel = client.channels.cache.get(db.get(`bp/${author.id}/chat`))

      let bpembed = {
        title: `${emoji} | Bate-ponto iniciado`,
		fields: [{
			name: "👮 Policial:",
			value: `<@${author.id}>`
		}, {
			name: "⏰ Iniciado:",
			value: `\`\`\`Diff\n+ ${dia}/${mes}/${ano} ás ${horas}:${minutos}\`\`\``
		}],
        color: "GREEN"
      }

      db.set(`bp/${interaction.user.id}/tempoinicio`, data2)
      bp_channel.send({ embeds: [bpembed] })
      interaction.reply({ content: `Você iniciou seu bate-ponto com Sucesso!`, ephemeral: true })
    } else {
      interaction.reply({ content: `Você já está batendo ponto!`, ephemeral: true })
    }
  } else if (interaction.customId == 'finalizarbp') {
    if (db.get(`bp/${author.id}`)) {
      db.set(`bp/${author.id}`, false)

      let bp_channel = client.channels.cache.get(db.get(`bp/${author.id}/chat`))
      let total_hoje = Date.now() - db.get(`bp/${interaction.user.id}/tempoinicio`)
      let total = total_hoje + db.get(`bp/${author.id}/total`)

	  db.set(`bp/${author.id}/total`, total)

      let bpembed = {
        title: `${emoji} | Bate-ponto finalizado`,
	    fields: [{
			name: "👮 Policial:",
			value: `<@${author.id}>`
		}, {
			name: "⏰ Finalizado:",
			value: `\`\`\`Diff\n- ${dia}/${mes}/${ano} ás ${horas}:${minutos}\`\`\``
		}, {
			name: "⏰ Total:",
			value: `\`\`\`Diff\n- ${ms(total_hoje).hours} horas e ${ms(total_hoje).minutes >= 10 ? ms(total_hoje).minutes : `0${ms(total_hoje).minutes}`} minutos\`\`\``
		}],
        color: "RED"
      }

      let log_embed = {
        title: 'Um bate-ponto acaba de ser finalizado',
        description: `**Policial:** <@${author.id}>
              **Data:** ${dia}/${mes}/${ano}
              **Total de hoje:** ${ms(total_hoje).hours >= 10 ? ms(total_hoje).hours : `0${ms(total_hoje).hours}`}:${ms(total_hoje).minutes >= 10 ? ms(total_hoje).minutes : `0${ms(total_hoje).minutes}`}

              **Total:** ${ms(total).hours >= 10 ? ms(total).hours : `0${ms(total).hours}`} horas e ${ms(total).minutes >= 10 ? ms(total).minutes : `0${ms(total).minutes}`} minutos`,
        color: "RED"
      }

      bp_channel.send({ embeds: [bpembed] })
      log_channel.send({ embeds: [log_embed] })
      interaction.reply({ content: `Você finalizou seu bate-ponto com Sucesso!`, ephemeral: true })
    } else {
      interaction.reply({ content: `Você não está batendo ponto!`, ephemeral: true })
    }
  }
})

// Ticket \\

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.guild.id != "554144874409099274") return;
	
  if (interaction.customId == "ticket") {

    if (interaction.values.includes('primeiro_ticket')) {

		let modal = new Discord.Modal()
		.setCustomId('primeiro_ticket')
		.setTitle('Ticket | Policia Militar');

	let modalinputs = new Discord.TextInputComponent()
			.setCustomId('motivo_ticket')
			.setLabel("Por que você abriu esse ticket?")
			.setStyle('PARAGRAPH');
		const secondActionRow = new Discord.MessageActionRow().addComponents(modalinputs);
		modal.addComponents(secondActionRow);
	await interaction.showModal(modal);

    } else if (interaction.values.includes('segundo_ticket')) {

		let modal = new Discord.Modal()
		.setCustomId('Segundo_ticket')
		.setTitle('Ticket | Policia Militar');

	let modalinputs = new Discord.TextInputComponent()
			.setCustomId('motivo_ticket')
			.setLabel("Qual o motivo da denuncia?")
			.setStyle('PARAGRAPH');
		const secondActionRow = new Discord.MessageActionRow().addComponents(modalinputs);
		modal.addComponents(secondActionRow);
	await interaction.showModal(modal);

    } else if (interaction.values.includes('terceiro_ticket')) {

		let modal = new Discord.Modal()
		.setCustomId('terceiro_ticket')
		.setTitle('Ticket | Policia Militar');

	let modalinputs = new Discord.TextInputComponent()
			.setCustomId('motivo_ticket')
			.setLabel("Por que você abriu esse ticket?")
			.setStyle('PARAGRAPH');
		const secondActionRow = new Discord.MessageActionRow().addComponents(modalinputs);
		modal.addComponents(secondActionRow);
	await interaction.showModal(modal);

    }
  }
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isModalSubmit()) return;
    if (interaction.guild.id != "554144874409099274") return;

	let cargo1 = config.ticket4.cargo1
	let cargo2 = config.ticket4.cargo2
	let cargo3 = config.ticket4.cargo3
	  
    let categ = config.ticket4.categ
    let embed = {
      title: 'Ticket',
      description: `Aguarde, jájá nossa equipe irá te atender!
      Enquanto isso, vai falando pra que abriu seu ticket.`,
	  fields: [{
		  name: "Motivo:",
		  value: `\`\`\`\n${interaction.fields.getTextInputValue('motivo_ticket')}\`\`\``,
	  }],
	  thumbnail: { url: client.user.avatarURL() },
      color: "YELLOW",
    }
    let fechartckt = new Discord.MessageActionRow()
      .addComponents([
        new Discord.MessageButton()
          .setCustomId('fechartckt')
          .setLabel('Fechar ticket')
          .setStyle('DANGER')
      ])

    if (interaction.customId =='primeiro_ticket') {

      let channel = await interaction.guild.channels.create(`fin-${interaction.user.id}`, {
        type: 'GUILD_TEXT', permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }],
        parent: categ
      })

      channel.send({ content: `<@${cargo1}>, o ${interaction.user} quer conversar sobre finanças!`, embeds: [embed], components: [fechartckt] })
      interaction.reply({ content: `Ticket criado com Sucesso! <#${channel.id}>`, ephemeral: true })
    } else if (interaction.customId == 'segundo_ticket') {

      let channel = await interaction.guild.channels.create(`den-${interaction.user.id}`, {
        type: 'GUILD_TEXT', permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: cargo2,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }],
        parent: categ
      })

      let embed_den = {
        title: 'Corregedoria | 4°BPM',
        description: `**Envie o formulário abaixo.**
        
        ***Denunciante: 
        Policial: 
        Motivo: 
        Provas:***`,
		fields: [{
		  name: "Motivo:",
		  value: `\`\`\`\n${interaction.fields.getTextInputValue('motivo_ticket')}\`\`\``,
		}],
		thumbnail: { url: client.user.avatarURL() },
        color: "YELLOW",
      }

      channel.send({ content: `<@&${cargo2}>, o ${interaction.user} quer denunciar alguém!`, embeds: [embed_den], components: [fechartckt] })
      interaction.reply({ content: `Ticket criado com Sucesso! <#${channel.id}>`, ephemeral: true })
    } else if (interaction.customId == 'terceiro_ticket') {

      let channel = await interaction.guild.channels.create(`duv-${interaction.user.id}`, {
        type: 'GUILD_TEXT', permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: cargo3,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }],
        parent: categ
      })

      channel.send({ content: `<@&${cargo3}>, o ${interaction.user} precisa de suporte!`, embeds: [embed], components: [fechartckt] })
      interaction.reply({ content: `Ticket criado com Sucesso! <#${channel.id}>`, ephemeral: true })
    }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.guild.id != "554144874409099274") return;

  if (interaction.customId == 'fechartckt') {
    let = embed_log = {
      title: 'Ticket',
      description: `Alguém acaba de fechar um ticket!

      Ticket: ${interaction.channel.name}
      Fechado por: <@${interaction.user.id}>`,
      color: "RED",
    }

    let log_channel = client.channels.cache.get(config.ticket4.clogs)
    
    log_channel.send({embeds: [embed_log]})
    await interaction.guild.channels.delete(interaction.channel.id, 'Ticket fechado!')
  }
})

//                                  28°BPM                                  \\

// Bate-ponto \\

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.guild.id != "903867644023828500") return;

  let author = interaction.user;

  let data2 = Date.now()
  let data = new Date(data2);
  let dia = data.getDate() >= 10 ? data.getDate() : `0${data.getDate()}`;
  let mes = data.getMonth() + 1 >= 10 ? data.getMonth() + 1 : `0${data.getMonth() + 1}`;
  let ano = data.getFullYear();
  let horas_errado = data.setHours(data.getHours() - 3);
  let horas = data.getHours() >= 10 ? data.getHours() : `0${data.getHours()}`;
  let minutos = data.getMinutes() >= 10 ? data.getMinutes() : `0${data.getMinutes()}`;

  // Chat-Logs Bate-ponto
  let log_channel = client.channels.cache.get(config.bp28.clogs)

  // Emoji de pasta
  let emoji = "<:pasta_1:830025704246738975>"

  if (interaction.customId == 'iniciarbp') {
    if (!db.get(`bp/${author.id}`)) {
      db.set(`bp/${author.id}`, true)

      if (!db.get(`bp/${author.id}/chat`)) {
        let categ = config.bp28.categ
        let channel = await interaction.guild.channels.create(`🎫-${author.username}`, {
          type: 'GUILD_TEXT', permissionOverwrites: [{
            id: interaction.guild.id,
            deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
          }, {
            id: interaction.user.id,
            allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
          }],
          parent: categ
        })
        db.set(`bp/${author.id}/chat`, channel.id)
      }

      let bp_channel = client.channels.cache.get(db.get(`bp/${author.id}/chat`))

      let bpembed = {
        title: `${emoji} | Bate-ponto iniciado`,
		fields: [{
			name: "👮 Policial:",
			value: `<@${author.id}>`
		}, {
			name: "⏰ Iniciado:",
			value: `\`\`\`Diff\n+ ${dia}/${mes}/${ano} ás ${horas}:${minutos}\`\`\``
		}],
        color: "GREEN"
      }

      db.set(`bp/${interaction.user.id}/tempoinicio`, data2)
      bp_channel.send({ embeds: [bpembed] })
      interaction.reply({ content: `Você iniciou seu bate-ponto com Sucesso!`, ephemeral: true })
    } else {
      interaction.reply({ content: `Você já está batendo ponto!`, ephemeral: true })
    }
  } else if (interaction.customId == 'finalizarbp') {
    if (db.get(`bp/${author.id}`)) {
      db.set(`bp/${author.id}`, false)

      let bp_channel = client.channels.cache.get(db.get(`bp/${author.id}/chat`))
      let total_hoje = Date.now() - db.get(`bp/${interaction.user.id}/tempoinicio`)
      let total = total_hoje + db.get(`bp/${author.id}/total`)

	  db.set(`bp/${author.id}/total`, total)

      let bpembed = {
        title: `${emoji} | Bate-ponto finalizado`,
	    fields: [{
			name: "👮 Policial:",
			value: `<@${author.id}>`
		}, {
			name: "⏰ Finalizado:",
			value: `\`\`\`Diff\n- ${dia}/${mes}/${ano} ás ${horas}:${minutos}\`\`\``
		}, {
			name: "⏰ Total:",
			value: `\`\`\`Diff\n- ${ms(total_hoje).hours} horas e ${ms(total_hoje).minutes >= 10 ? ms(total_hoje).minutes : `0${ms(total_hoje).minutes}`} minutos\`\`\``
		}],
        color: "RED"
      }

      let log_embed = {
        title: 'Um bate-ponto acaba de ser finalizado',
        description: `**Policial:** <@${author.id}>
              **Data:** ${dia}/${mes}/${ano}
              **Total de hoje:** ${ms(total_hoje).hours >= 10 ? ms(total_hoje).hours : `0${ms(total_hoje).hours}`}:${ms(total_hoje).minutes >= 10 ? ms(total_hoje).minutes : `0${ms(total_hoje).minutes}`}

              **Total:** ${ms(total).hours >= 10 ? ms(total).hours : `0${ms(total).hours}`} horas e ${ms(total).minutes >= 10 ? ms(total).minutes : `0${ms(total).minutes}`} minutos`,
        color: "RED"
      }

      bp_channel.send({ embeds: [bpembed] })
      log_channel.send({ embeds: [log_embed] })
      interaction.reply({ content: `Você finalizou seu bate-ponto com Sucesso!`, ephemeral: true })
    } else {
      interaction.reply({ content: `Você não está batendo ponto!`, ephemeral: true })
    }
  }
})

// Ticket \\

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.guild.id != "903867644023828500") return;
	
  if (interaction.customId == "ticket") {

    if (interaction.values.includes('primeiro_ticket')) {

		let modal = new Discord.Modal()
		.setCustomId('primeiro_ticket')
		.setTitle('Ticket | Policia Militar');

	let modalinputs = new Discord.TextInputComponent()
			.setCustomId('motivo_ticket')
			.setLabel("Por que você abriu esse ticket?")
			.setStyle('PARAGRAPH');
		const secondActionRow = new Discord.MessageActionRow().addComponents(modalinputs);
		modal.addComponents(secondActionRow);
	await interaction.showModal(modal);

    } else if (interaction.values.includes('segundo_ticket')) {

		let modal = new Discord.Modal()
		.setCustomId('Segundo_ticket')
		.setTitle('Ticket | Policia Militar');

	let modalinputs = new Discord.TextInputComponent()
			.setCustomId('motivo_ticket')
			.setLabel("Qual o motivo da denuncia?")
			.setStyle('PARAGRAPH');
		const secondActionRow = new Discord.MessageActionRow().addComponents(modalinputs);
		modal.addComponents(secondActionRow);
	await interaction.showModal(modal);

    } else if (interaction.values.includes('terceiro_ticket')) {

		let modal = new Discord.Modal()
		.setCustomId('terceiro_ticket')
		.setTitle('Ticket | Policia Militar');

	let modalinputs = new Discord.TextInputComponent()
			.setCustomId('motivo_ticket')
			.setLabel("Por que você abriu esse ticket?")
			.setStyle('PARAGRAPH');
		const secondActionRow = new Discord.MessageActionRow().addComponents(modalinputs);
		modal.addComponents(secondActionRow);
	await interaction.showModal(modal);

    }
  }
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isModalSubmit()) return;
    if (interaction.guild.id != "903867644023828500") return;

	let cargo1 = config.ticket28.cargo1
	let cargo2 = config.ticket28.cargo2
	let cargo3 = config.ticket28.cargo3
	  
    let categ = config.ticket28.categ
    let embed = {
      title: 'Ticket',
      description: `Aguarde, jájá nossa equipe irá te atender!
      Enquanto isso, vai falando pra que abriu seu ticket.`,
	  fields: [{
		  name: "Motivo:",
		  value: `\`\`\`\n${interaction.fields.getTextInputValue('motivo_ticket')}\`\`\``,
	  }],
      color: "YELLOW",
    }
    let fechartckt = new Discord.MessageActionRow()
      .addComponents([
        new Discord.MessageButton()
          .setCustomId('fechartckt')
          .setLabel('Fechar ticket')
          .setStyle('DANGER')
      ])

    if (interaction.customId =='primeiro_ticket') {

      let channel = await interaction.guild.channels.create(`fin-${interaction.user.id}`, {
        type: 'GUILD_TEXT', permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }],
        parent: categ
      })

      channel.send({ content: `<@${cargo1}>, o ${interaction.user} quer conversar sobre finanças!`, embeds: [embed], components: [fechartckt] })
      interaction.reply({ content: `Ticket criado com Sucesso! <#${channel.id}>`, ephemeral: true })
    } else if (interaction.customId == 'segundo_ticket') {

      let channel = await interaction.guild.channels.create(`den-${interaction.user.id}`, {
        type: 'GUILD_TEXT', permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: cargo2,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }],
        parent: categ
      })

      let embed_den = {
        title: 'Corregedoria | 28°BPM',
        description: `**Envie o formulário abaixo.**
        
        ***Denunciante: 
        Policial: 
        Motivo: 
        Provas:***`,
		fields: [{
		  name: "Motivo:",
		  value: `\`\`\`\n${interaction.fields.getTextInputValue('motivo_ticket')}\`\`\``,
		}],
        color: "YELLOW",
      }

      channel.send({ content: `<@&${cargo2}>, o ${interaction.user} quer denunciar alguém!`, embeds: [embed_den], components: [fechartckt] })
      interaction.reply({ content: `Ticket criado com Sucesso! <#${channel.id}>`, ephemeral: true })
    } else if (interaction.customId == 'terceiro_ticket') {

      let channel = await interaction.guild.channels.create(`duv-${interaction.user.id}`, {
        type: 'GUILD_TEXT', permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: cargo3,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
        }],
        parent: categ
      })

      channel.send({ content: `<@&${cargo3}>, o ${interaction.user} precisa de suporte!`, embeds: [embed], components: [fechartckt] })
      interaction.reply({ content: `Ticket criado com Sucesso! <#${channel.id}>`, ephemeral: true })
    }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.guild.id != "903867644023828500") return;

  if (interaction.customId == 'fechartckt') {
    let = embed_log = {
      title: 'Ticket',
      description: `Alguém acaba de fechar um ticket!

      Ticket: ${interaction.channel.name}
      Fechado por: <@${interaction.user.id}>`,
      color: "RED",
    }

    let log_channel = client.channels.cache.get(config.ticket28.clogs)
    
    log_channel.send({embeds: [embed_log]})
    await interaction.guild.channels.delete(interaction.channel.id, 'Ticket fechado!')
  }
})

client.login(config.token)
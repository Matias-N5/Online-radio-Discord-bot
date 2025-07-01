const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const prism = require('prism-media');
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');

// === CONFIGURA ESTOS VALORES ===
const TOKEN = '';
const CLIENT_ID = '';
const GUILD_ID = '';
const RADIO_URL = '';
// ===============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const commands = [
  new SlashCommandBuilder().setName('play').setDescription('Reproduce la radio online'),
  new SlashCommandBuilder().setName('stop').setDescription('Detiene la radio si estás en el mismo canal de voz'),
].map(cmd => cmd.toJSON());

// Registrar comandos
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados.');
  } catch (error) {
    console.error(error);
  }
})();

let player; // Guardamos el reproductor global para controlarlo en stop

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, member, guild } = interaction;
  const userVoiceChannel = member.voice.channel;

  if (commandName === 'play') {
    if (!userVoiceChannel) {
      return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando.', ephemeral: true });
    }

    await interaction.reply('🎶 Reproduciendo la radio...');

    const connection = joinVoiceChannel({
      channelId: userVoiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    // Configuración correcta de ffmpeg para que reconecte y transmita bien
    const ffmpegArgs = [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', RADIO_URL,
      '-vn', // sin video
      '-f', 'mp3', // formato mp3
      '-ar', '48000',
      '-ac', '2',
      'pipe:1', // salida a pipe
    ];

    const ffmpegProcess = spawn(ffmpeg, ffmpegArgs);

    ffmpegProcess.stderr.on('data', data => {
      console.error(`FFmpeg stderr: ${data.toString()}`);
    });

    player = createAudioPlayer();

    player.on('error', error => {
      console.error('Error en audio player:', error);
    });

    const resource = createAudioResource(ffmpegProcess.stdout, { inputType: 'arbitrary' });

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
      console.log('Reproducción terminada, conexión destruida.');
    });
  }

  if (commandName === 'stop') {
    const connection = getVoiceConnection(guild.id);

    if (!connection) {
      return interaction.reply({ content: '❌ El bot no está conectado a ningún canal.', ephemeral: true });
    }

    const botChannelId = connection.joinConfig.channelId;

    if (!userVoiceChannel || userVoiceChannel.id !== botChannelId) {
      return interaction.reply({
        content: '❌ Debes estar en el mismo canal de voz que el bot para usar este comando.',
        ephemeral: true,
      });
    }

    if (player) {
      player.stop();
    }

    connection.destroy();
    await interaction.reply('🛑 Radio detenida y desconectado del canal.');
  }
});

client.once('ready', () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);
});

client.login(TOKEN);

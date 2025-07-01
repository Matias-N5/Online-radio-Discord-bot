# This bot was made with the use of Chat-GPT
Feel free to do whatever you want with this
# Discord Radio Bot

Discord bot that allows you to play an online radio in voice channels using the slash commands `/play` and `/stop`.

---

## Requirements

- Node.js 16 or higher
- A Discord bot created with a token
- Bot's Client ID (CLIENT_ID)
- Server ID (GUILD_ID) where you will register the commands
- Valid online radio URL to play

---

## Installation and setup

1. Clone or download this repository.

2. In the `index.js` file (or whatever filename you use), replace the following variables with your actual data:

   ```js
   const TOKEN = 'your_discord_token_here';
   const CLIENT_ID = 'your_client_id_here';
   const GUILD_ID = 'your_guild_id_here';
   const RADIO_URL = 'your_radio_url_here';
   ```

3. Install the necessary dependencies with npm:

   ```bash
   npm install discord.js @discordjs/voice prism-media ffmpeg-static
   ```

4. Start the bot:

   ```bash
   node index.js
   ```

---

## Usage

- `/play`: The bot will join the voice channel you are in and play the configured online radio.
- `/stop`: Stops the playback and disconnects the bot from the voice channel.


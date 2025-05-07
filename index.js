const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require('discord.js');

const config = require('./config/config.json');
const path = require('path');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

client.commands = new Collection();
client.prefixCommands = new Collection();

// if token or client id is missing in config.json
if (!config.TOKEN || !config.CLIENT_ID) {
  console.log('Not found config or client id please to configure first');
}


/*
loader commands multifolder
how to use?
loadCommand({commandFolder})
*/

const eventPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

if (eventFiles.length === 0) {
  console.log('⚠️  No files in the events folder!');
} else {
  console.table(eventFiles);
}

for (const file of eventFiles) {
  const filePath = path.join(eventPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const loadCommand = (dir) => {
  const basePath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(basePath, { withFileTypes: true });

  let total = 0;

  for (const file of files) {
    const fullPath = path.join(basePath, file.name);

    if (file.isDirectory()) {
      total += loadCommand(path.join(dir, file.name));
    } else if (file.name.endsWith('.js')) {
      const command = require(fullPath);

      if (command?.data) {
        client.commands.set(command.data.name, command);
        console.log(`✅ [Slash] ${command.data.name} loaded from ${path.join(dir, file.name)}`);
      } else if (command?.name) {
        client.prefixCommands.set(command.name, command);
        console.log(`✅ [Prefix] ${command.name} loaded from ${path.join(dir, file.name)}`);
      } else {
        console.warn(`⚠️  Skipped ${file.name} (no data/name)`);
      }

      total++;
    }
  }

  if (total === 0) {
    console.log(`⚠️  No .js command files found in: ${dir}`);
  }

  return total;
};

loadCommand('commands');

const rest = new REST({ version: '10' }).setToken(config.TOKEN);

(async () => {
  try {
    console.log('Waiting for updating commands please patience...');

    const commands = client.commands.map(cmd => cmd.data.toJSON());
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });

    console.log('All Commands is successfuly updated');
  } catch (error) {
    console.error('❌  error while getting commands:', error);
  }
})();


/*
Tracking if token is invalid or something
*/

client.on('error', (err) => {
  console.log('Error while try to connecting', err);
});

client.login(config.TOKEN);
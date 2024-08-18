const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// Komutları yükle ve deploy et
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.log(`[UYARI] ${filePath} komut dosyasında gerekli "data" veya "execute" özelliği eksik.`);
    }
}

// Komutları deploy et
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`${commands.length} adet komut yükleniyor.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log(`${data.length} adet komut başarıyla yüklendi.`);
    } catch (error) {
        console.error('Komutları yüklerken bir hata oluştu:', error);
    }
})();

// Eventleri yükle
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
} else {
    console.log('Events klasörü bulunamadı. Event yükleme işlemi atlanıyor.');
}

// Slash komut işleyici
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
    }
});

// Hata yakalama
process.on('unhandledRejection', error => {
    console.error('İşlenmemiş bir hata oluştu:', error);
});

client.login(config.token);
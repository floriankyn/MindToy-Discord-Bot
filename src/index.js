//index.js// -- Created By FLorian Lepage
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildIntegrations
        ], partials: [
            Partials.Channel,
            Partials.Reaction,
            Partials.Message,
            Partials.GuildMember
        ]
    }
);

const config = require("./config/config.json");

//Libs imports
const { CommandsLoader } = require("./components/CommandsLoader.js");
const { SQLTablesManager } = require("./components/SQLTablesManager.js");
const { Database } = require("./database/Database.js");

//Modules Imports
const { ToyCreationManager } = require("./components/ToyCreationManager.js");
const { CollectionManager } = require("./components/CollectionManager.js");

client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`);

    await new Database(config).checkConnectionState();

    await new SQLTablesManager(config, [
        ToyCreationManager,
        CollectionManager
    ]).loadTables();

    await new CommandsLoader(client, [
        ToyCreationManager,
        CollectionManager
    ], config).loadCommands();
});

client.on("interactionCreate", async (interaction) => {
    await new ToyCreationManager(interaction, client, config).on();
    await new CollectionManager(interaction, client, config).on();
});

client.login(config.discord.token).then().catch();


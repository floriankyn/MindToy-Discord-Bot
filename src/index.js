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


client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`);

    await new Database(config).checkConnectionState();

    await new SQLTablesManager(config, [

    ]).loadTables();

    await new CommandsLoader(client, [

    ], config).loadCommands();
});

client.on("interactionCreate", (interaction) => {

});

client.on(`messageCreate`, (message) => {

})

client.login(config.discord.token).then().catch();